import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { storageConfig, initializeStorage } from '../config/storage.config';
import prisma from '../config/db';

export interface PhotoData {
  filename: string;
  dataUrl: string;
  size: number;
  timestamp: string;
}

export interface StoredPhoto {
  id: number;
  filename: string;
  path: string;
  url: string; // Serving URL
  size: number;
  mimeType: string;
  createdAt: Date;
  originalSize?: number;
  compressed?: boolean;
}

export class LocalPhotoStorageService {

  /**
   * Initialize storage directories
   */
  static async initialize(): Promise<void> {
    initializeStorage();
  }

  /**
   * Compress image buffer using sharp
   */
  private static async compressImage(
    buffer: Buffer,
    mimeType: string
  ): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
    const config = storageConfig.compression;

    if (!config.enabled) {
      const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      return { buffer, mimeType, extension: ext };
    }

    try {
      let sharpInstance = sharp(buffer);

      sharpInstance = sharpInstance.resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });

      if (config.convertToWebp) {
        const compressedBuffer = await sharpInstance
          .webp({ quality: config.webpQuality })
          .toBuffer();
        return { buffer: compressedBuffer, mimeType: 'image/webp', extension: 'webp' };
      } else {
        const compressedBuffer = await sharpInstance
          .jpeg({ quality: config.jpegQuality, mozjpeg: true })
          .toBuffer();
        return { buffer: compressedBuffer, mimeType: 'image/jpeg', extension: 'jpg' };
      }
    } catch (error) {

      const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      return { buffer, mimeType, extension: ext };
    }
  }

  /**
   * Store photos from base64 data URLs to filesystem and database
   * Images are automatically compressed to save storage space
   */
  static async storePhotos(
    photos: PhotoData[],
    context: {
      ticketId?: number;
      activityId?: number;
      userId: number;
      type: 'ticket' | 'activity';
    }
  ): Promise<StoredPhoto[]> {
    await this.initialize();

    const storedPhotos: StoredPhoto[] = [];
    const folderMap: Record<string, string> = {
      'ticket': 'tickets',
      'activity': 'activities'
    };
    const uploadDir = path.join(storageConfig.images, folderMap[context.type] || context.type + 's');

    await fs.mkdir(uploadDir, { recursive: true });

    for (const photo of photos) {
      try {
        if (photo.size > storageConfig.maxFileSize) {
          throw new Error(`File size ${photo.size} exceeds limit ${storageConfig.maxFileSize}`);
        }

        const matches = photo.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches) {
          throw new Error('Invalid data URL format');
        }

        const originalMimeType = matches[1];
        const base64Data = matches[2];
        const originalBuffer = Buffer.from(base64Data, 'base64');
        const originalSize = originalBuffer.length;

        // Compress the image
        const { buffer, mimeType, extension } = await this.compressImage(originalBuffer, originalMimeType);

        // Validate file type
        if (!storageConfig.allowedImageTypes.includes(extension.toLowerCase())) {
          throw new Error(`File type ${extension} not allowed`);
        }

        // Generate short, readable, knowable filename
        // Format: T45_27Jan_1230_abc1.jpg (TypeID_DayMonth_Time_ShortHash.ext)
        const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 4);
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = now.getDate().toString().padStart(2, '0');
        const month = months[now.getMonth()];
        const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

        const typeMap: Record<string, string> = {
          'ticket': 'T',
          'activity': 'A',
          'profile': 'P'
        };
        const typePrefix = typeMap[context.type] || context.type.charAt(0).toUpperCase();
        const contextId = context.ticketId || context.activityId || context.userId;
        const uniqueFilename = `${typePrefix}${contextId}_${day}${month}_${timeStr}_${hash}.${extension}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        // Save compressed file to disk
        await fs.writeFile(filePath, buffer);

        const compressionRatio = originalSize > 0 ? Math.round((1 - buffer.length / originalSize) * 100) : 0;


        // Generate serving URL
        const relativePath = path.relative(storageConfig.root, filePath).replace(/\\/g, '/');
        const servingUrl = `/storage/${relativePath}`;

        // Save to database (only for tickets, not activities)
        if (context.ticketId) {
          // For ticket photos, store in database
          const attachmentData: any = {
            filename: photo.filename,
            path: filePath,
            mimeType,
            size: buffer.length,
            uploadedById: context.userId,
            ticketId: context.ticketId,
          };

          const attachment = await prisma.attachment.create({
            data: attachmentData
          });

          storedPhotos.push({
            id: attachment.id,
            filename: attachment.filename,
            path: attachment.path,
            url: servingUrl,
            size: attachment.size,
            mimeType: attachment.mimeType,
            createdAt: attachment.createdAt,
          });
        } else {
          // For activity photos, don't store in database (just return file info)
          const photoResult = {
            id: Math.floor(Date.now() + Math.random() * 1000), // Temporary ID for activities
            filename: photo.filename,
            path: filePath,
            url: servingUrl,
            size: photo.size,
            mimeType: mimeType,
            createdAt: new Date(),
          };

          storedPhotos.push(photoResult);
        }

      } catch (error) {
        // Continue with other photos
      }
    }

    return storedPhotos;
  }

  /**
   * Get photo as base64 data URL (for API responses)
   */
  static async getPhotoAsDataUrl(attachmentId: number): Promise<string | null> {
    try {
      const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId }
      });

      if (!attachment) {
        return null;
      }

      const buffer = await fs.readFile(attachment.path);
      const base64 = buffer.toString('base64');
      return `data:${attachment.mimeType};base64,${base64}`;

    } catch (error) {
      return null;
    }
  }

  /**
   * Get photo file path for direct serving
   */
  static async getPhotoPath(attachmentId: number): Promise<string | null> {
    try {
      const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId }
      });

      return attachment?.path || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete photo from filesystem and database
   */
  static async deletePhoto(attachmentId: number): Promise<boolean> {
    try {
      const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId }
      });

      if (!attachment) {
        return false;
      }

      // Delete file from disk
      try {
        await fs.unlink(attachment.path);
      } catch (error) {
      }

      // Delete from database
      await prisma.attachment.delete({
        where: { id: attachmentId }
      });

      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Get all photos for a ticket with serving URLs
   */
  static async getTicketPhotos(ticketId: number): Promise<StoredPhoto[]> {
    const attachments = await prisma.attachment.findMany({
      where: {
        ticketId,
        mimeType: {
          startsWith: 'image/'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return attachments.map(att => {
      const relativePath = path.relative(storageConfig.root, att.path).replace(/\\/g, '/');
      return {
        id: att.id,
        filename: att.filename,
        path: att.path,
        url: `/storage/${relativePath}`,
        size: att.size,
        mimeType: att.mimeType,
        createdAt: att.createdAt,
      };
    });
  }

}
