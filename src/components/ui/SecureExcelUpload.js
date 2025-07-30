/**
 * @fileoverview Secure Excel file upload component with client-side validation
 * @module components/ui/SecureExcelUpload
 */

import React, { useState, useCallback, useRef } from 'react';
import { FILE_SECURITY } from '../../config/security';

const SecureExcelUpload = ({ 
  onUploadSuccess, 
  onUploadError,
  maxFileSize = FILE_SECURITY.maxFileSize,
  allowedExtensions = FILE_SECURITY.allowedExtensions,
  className = '',
  showProgress = true,
  autoUpload = true
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Client-side file validation
  const validateFile = useCallback((file) => {
    const errors = [];
    const warnings = [];

    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxFileSize / 1024 / 1024).toFixed(0)}MB)`);
    }

    // Check file extension
    const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (!ext || !allowedExtensions.includes(ext)) {
      errors.push(`File type "${ext || 'unknown'}" is not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
    }

    // Check MIME type
    const validMimeTypes = FILE_SECURITY.allowedMimeTypes;
    if (!validMimeTypes.includes(file.type) && file.type !== '') {
      warnings.push('File MIME type may not be compatible');
    }

    // Check for suspicious filename patterns
    const suspiciousPatterns = [
      /\.\./g, // Directory traversal
      /<script/i, // Script injection
      /[<>:"|?*]/g, // Invalid filename characters
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        errors.push('Filename contains invalid or suspicious characters');
        break;
      }
    }

    // Warn about macro-enabled files
    if (ext === '.xlsm' || ext === '.xlsb') {
      warnings.push('This file may contain macros which will be disabled for security');
    }

    return { errors, warnings };
  }, [maxFileSize, allowedExtensions]);

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setValidationWarnings([]);

    // Validate file
    const { errors, warnings } = validateFile(selectedFile);
    
    if (errors.length > 0) {
      setError(errors.join('. '));
      setFile(null);
      event.target.value = ''; // Reset input
      return;
    }

    setFile(selectedFile);
    setValidationWarnings(warnings);

    if (autoUpload && errors.length === 0) {
      handleUpload(selectedFile);
    }
  }, [validateFile, autoUpload]);

  // Handle file upload
  const handleUpload = useCallback(async (fileToUpload = file) => {
    if (!fileToUpload) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      // Add security metadata
      formData.append('clientValidation', JSON.stringify({
        fileSize: fileToUpload.size,
        fileName: fileToUpload.name,
        mimeType: fileToUpload.type,
        timestamp: Date.now()
      }));

      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
        // Track upload progress if supported
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadProgress(100);
        onUploadSuccess?.(result.file);
        
        // Clear file input
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message);
        onUploadError?.(error);
      }
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
    }
  }, [file, onUploadSuccess, onUploadError]);

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Retry upload
  const retryUpload = useCallback(() => {
    if (file) {
      handleUpload(file);
    }
  }, [file, handleUpload]);

  return (
    <div className={`secure-excel-upload ${className}`}>
      {/* File Input */}
      <div className="upload-input-container">
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedExtensions.join(',')}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="excel-file-input"
        />
        
        <label
          htmlFor="excel-file-input"
          className={`upload-button ${uploading ? 'disabled' : ''}`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {file ? 'Change File' : 'Select Excel File'}
        </label>
      </div>

      {/* File Info */}
      {file && !uploading && (
        <div className="file-info">
          <div className="file-details">
            <span className="file-name">{file.name}</span>
            <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
          
          {!autoUpload && (
            <button
              onClick={() => handleUpload()}
              className="upload-action-button"
            >
              Upload
            </button>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && showProgress && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="progress-info">
            <span>{uploadProgress}%</span>
            <button onClick={cancelUpload} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <div className="validation-warnings">
          {validationWarnings.map((warning, index) => (
            <div key={index} className="warning-item">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-container">
          <div className="error-message">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
          {file && (
            <button onClick={retryUpload} className="retry-button">
              Retry
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .secure-excel-upload {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .upload-button {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background-color: #1e3a8a;
          color: white;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-button:hover:not(.disabled) {
          background-color: #1e40af;
        }

        .upload-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .file-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background-color: #f3f4f6;
          border-radius: 0.375rem;
        }

        .file-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .file-name {
          font-weight: 500;
          color: #1f2937;
        }

        .file-size {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .progress-bar {
          width: 100%;
          height: 0.5rem;
          background-color: #e5e7eb;
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #0d9488;
          transition: width 0.3s ease;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .cancel-button {
          color: #ef4444;
          text-decoration: underline;
          cursor: pointer;
        }

        .validation-warnings {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .warning-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background-color: #fef3c7;
          color: #92400e;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .error-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background-color: #fee2e2;
          border-radius: 0.375rem;
        }

        .error-message {
          display: flex;
          align-items: center;
          color: #991b1b;
          font-size: 0.875rem;
        }

        .retry-button {
          color: #dc2626;
          text-decoration: underline;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .upload-action-button {
          padding: 0.5rem 1rem;
          background-color: #0d9488;
          color: white;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-action-button:hover {
          background-color: #0f766e;
        }
      `}</style>
    </div>
  );
};

export default SecureExcelUpload;