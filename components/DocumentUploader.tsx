'use client';

import { useState, useRef } from 'react';
import { processDocument, ExtractedTransactionData } from '@/lib/documentProcessor';
import { useLanguage } from '@/lib/i18n';
import { Upload, Loader2, AlertCircle } from 'lucide-react';

interface DocumentUploaderProps {
  onDataExtracted: (data: ExtractedTransactionData) => void;
  onError: (error: string) => void;
}

export default function DocumentUploader({ onDataExtracted, onError }: DocumentUploaderProps) {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  const handleFileSelect = async (file: File) => {
    if (!supportedFormats.includes(file.type)) {
      onError(t('supportedFormats'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('[v0] Processing document:', file.name, file.type);
      const extractedData = await processDocument(file);
      console.log('[v0] Extracted data:', extractedData);
      onDataExtracted(extractedData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
      console.error('[v0] Document processing error:', error);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition mb-4"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('processing')}
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              {t('selectFile')}
            </>
          )}
        </button>

        <p className="text-sm text-gray-600">{t('dragDrop')}</p>
        <p className="text-xs text-gray-500 mt-2">{t('supportedFormats')}</p>
      </div>
    </div>
  );
}
