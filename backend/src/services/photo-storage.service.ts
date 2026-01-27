import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import prisma from '../config/db';
import { storageConfig } from '../config/storage.config';

export interface PhotoData {
  filename: string;
  dataUrl: string;
  size: number;
  timestamp?: string;
}

// Compatible interface with routes (matches EnhancedPhotoStorageService response)
export interface StoredPhotoResult {
  id: number;
  filename: string;
  url: string;           // Local URL for serving
  thumbnailUrl: string;  // Same as url for local storage
  path: string;          // Filesystem path
  size: number;
  mimeType: string;
  createdAt: Date;
  originalSize?: number; // Original size before compression
  compressed?: boolean;  // Whether compression was applied
}

// Legacy interface for backwards compatibility
export interface StoredPhoto {
  id: number;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
}

export class PhotoStorageService {
  // Use environment variable or default to relative storage path (portable across environments)
  // On AWS: Set PHOTO_UPLOAD_DIR=D:\\storage\\images (EBS volume)
  // On local: Defaults to ./storage/images relative to project root
  private static readonly UPLOAD_DIR = process.env.PHOTO_UPLOAD_DIR || './storage/images';

  /**
   * Compress image buffer using sharp
   * Reduces file size by ~80-90% while maintaining good visual quality
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

      // Resize if larger than max dimensions (maintains aspect ratio)
      sharpInstance = sharpInstance.resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true, // Don't upscale small images
      });

      // Convert to WebP or compress as JPEG
      if (config.convertToWebp) {
        const compressedBuffer = await sharpInstance
          .webp({ quality: config.webpQuality })
          .toBuffer();
        return { buffer: compressedBuffer, mimeType: 'image/webp', extension: 'webp' };
      } else {
        // Compress as JPEG (most compatible)
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
   * Store photos from base64 data URLs to LOCAL filesystem and database
   * 
   * ⚠️ IMPORTANT: This service stores files LOCALLY on the server.
   * Images are NOT uploaded to any external cloud service.
   * This complies with company policy to keep all data within the network.
   * 
   * 📦 COMPRESSION: Images are automatically compressed to save storage space.
   * - Max dimensions: 1920x1920px
   * - JPEG quality: 80% (configurable)
   * - Typically reduces file size by 80-90%
   * 
   * @param photos - Array of photo data with base64 encoded images
   * @param context - Context object containing ticketId/activityId, userId, and type
   * @returns Array of stored photo results with local URLs
   */
  static async storePhotos(
    photos: PhotoData[],
    context: {
      ticketId?: number;
      activityId?: number;
      userId: number;
      type: 'ticket_verification' | 'activity_verification';
    }
  ): Promise<StoredPhotoResult[]> {
    // Determine subdirectory based on context
    const subDir = context.type === 'ticket_verification' ? 'tickets' : 'activities';
    const entityId = context.ticketId || context.activityId || 0;
    const targetDir = path.join(this.UPLOAD_DIR, subDir);

    // Ensure upload directory exists
    await fs.mkdir(targetDir, { recursive: true });

    const storedPhotos: StoredPhotoResult[] = [];

    for (const photo of photos) {
      try {
        // Extract base64 data and mime type
        const matches = photo.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches) {

          continue;
        }

        const originalMimeType = matches[1];
        const base64Data = matches[2];
        const originalBuffer = Buffer.from(base64Data, 'base64');
        const originalSize = originalBuffer.length;

        // Compress the image
        const { buffer, mimeType, extension } = await this.compressImage(originalBuffer, originalMimeType);

        // Generate short, readable, knowable filename
        // Format: T45_27Jan_1230_abc1.jpg (TypeID_DayMonth_Time_ShortHash.ext)
        const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 4);
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = now.getDate().toString().padStart(2, '0');
        const month = months[now.getMonth()];
        const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

        const typePrefix = context.type === 'ticket_verification' ? 'T' : 'A';
        const uniqueFilename = `${typePrefix}${entityId}_${day}${month}_${timeStr}_${hash}.${extension}`;
        const filePath = path.join(targetDir, uniqueFilename);

        // Save compressed file to local disk
        await fs.writeFile(filePath, buffer);

        // Calculate actual file size from buffer
        const actualSize = buffer.length;
        const compressionRatio = originalSize > 0 ? Math.round((1 - actualSize / originalSize) * 100) : 0;



        // Generate URL path for serving (relative to storage root)
        const urlPath = `/storage/images/${subDir}/${uniqueFilename}`;

        // Store in database if it's a ticket photo
        if (context.ticketId) {
          const attachment = await prisma.attachment.create({
            data: {
              filename: photo.filename || uniqueFilename,
              path: filePath,
              mimeType,
              size: actualSize,
              ticketId: context.ticketId,
              uploadedById: context.userId,
            }
          });

          storedPhotos.push({
            id: attachment.id,
            filename: attachment.filename,
            url: urlPath,
            thumbnailUrl: urlPath, // For local storage, thumbnail is same as full image
            path: filePath,
            size: attachment.size,
            mimeType: attachment.mimeType,
            createdAt: attachment.createdAt,
          });
        } else {
          // For activity photos, return the result without database record
          storedPhotos.push({
            id: Date.now(), // Use timestamp as temporary ID
            filename: photo.filename || uniqueFilename,
            url: urlPath,
            thumbnailUrl: urlPath,
            path: filePath,
            size: actualSize,
            mimeType,
            createdAt: new Date(),
          });
        }



      } catch (error) {

        // Continue with other photos
      }
    }

    return storedPhotos;
  }

  /**
   * Get all photos for a ticket from LOCAL storage
   */
  static async getTicketPhotos(ticketId: number): Promise<StoredPhotoResult[]> {
    try {
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
        // Generate URL from path
        const urlPath = att.path.includes('\\storage\\') || att.path.includes('/storage/')
          ? `/storage/images/${att.path.split(/[\\\/]storage[\\\/]images[\\\/]/)[1]?.replace(/\\/g, '/') || ''}`
          : `/storage/images/tickets/${path.basename(att.path)}`;

        return {
          id: att.id,
          filename: att.filename,
          url: urlPath,
          thumbnailUrl: urlPath,
          path: att.path,
          size: att.size,
          mimeType: att.mimeType,
          createdAt: att.createdAt,
        };
      });
    } catch (error) {

      return [];
    }
  }

  /**
   * Legacy method: Store photos with old interface (backwards compatibility)
   */
  static async storePhotosLegacy(
    photos: PhotoData[],
    ticketId: number,
    userId: number,
    contextType: 'ticket' | 'activity' = 'ticket'
  ): Promise<StoredPhoto[]> {
    const results = await this.storePhotos(photos, {
      ticketId,
      userId,
      type: contextType === 'ticket' ? 'ticket_verification' : 'activity_verification'
    });

    return results.map(r => ({
      id: r.id,
      filename: r.filename,
      path: r.path,
      size: r.size,
      mimeType: r.mimeType,
    }));
  }

  /**
   * Retrieve photo as base64 data URL
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
}
