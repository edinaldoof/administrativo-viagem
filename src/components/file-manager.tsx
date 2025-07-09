"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, X, File as FileIcon } from 'lucide-react';
import { type DocumentFile } from '@/types';
import { Button } from '@/components/ui/button';

interface FileManagerProps {
  files: DocumentFile[];
  onFilesChange: (files: DocumentFile[]) => void;
}

export function FileManager({ files, onFilesChange }: FileManagerProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: DocumentFile[] = acceptedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // for potential previews
      fileObject: file,
    }));
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const removeFile = (fileName: string) => {
    const newFiles = files.filter(file => file.name !== fileName);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : ''
        }`}
      >
        <div className="text-center">
          <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
            >
              <span>Upload files</span>
              <input {...getInputProps()} className="sr-only" />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">Images, PDF, etc. up to 10MB</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map(file => (
            <div key={file.name} className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <p className="text-sm truncate">{file.name}</p>
                </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file.name)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
