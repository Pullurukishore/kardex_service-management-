'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { apiClient } from '@/lib/api/api-client';

type ReportType = 'COMPLETION' | 'CLOSURE' | 'SUMMARY';

interface ReportUploadProps {
  activityId: number;
  activityType: string;
  reportType?: ReportType;
  required?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReportUpload({
  activityId,
  activityType,
  reportType = 'COMPLETION',
  required = true,
  onSuccess,
  onCancel
}: ReportUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If required and no file selected, show error
    if (required && !selectedFile) {
      toast({
        title: 'File Required',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    // If not required and no file, skip upload and call onSuccess
    if (!required && !selectedFile) {
      toast({
        title: 'No Report',
        description: 'Proceeding without report upload.',
      });
      if (onSuccess) {
        onSuccess();
      }
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append('reports', selectedFile); // Backend expects 'reports' array
    }
    if (notes) {
      formData.append('description', notes); // Backend expects 'description'
    }
    formData.append('reportType', reportType);

    try {
      setIsUploading(true);
      
      await apiClient.post(`/activities/${activityId}/reports`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Report Uploaded',
        description: 'Your report has been uploaded successfully.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="report-file">
          {required ? 'Report File (Required)' : 'Report File (Optional)'}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="report-file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            className="cursor-pointer"
            disabled={isUploading}
          />
          {selectedFile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {selectedFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="truncate">{selectedFile.name}</span>
            <span className="text-xs opacity-70">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="report-notes">Notes</Label>
        <textarea
          id="report-notes"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Add any additional notes about this report..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isUploading}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        {!required && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit}
            disabled={isUploading}
          >
            Skip Report
          </Button>
        )}
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isUploading || (required && !selectedFile) || (!required && !selectedFile)}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? 'Upload Report' : (required ? 'Select File First' : 'Skip')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
