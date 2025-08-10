// CSV Import Component for Admin Interface

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SimpleCSVService } from '../../services/simpleCSVService';
import type { CSVImportResult } from '../../types/Content';

interface CSVImporterProps {
  tenantId: string;
  onImportComplete?: (result: CSVImportResult) => void;
}

export const CSVImporter: React.FC<CSVImporterProps> = ({ 
  tenantId, 
  onImportComplete 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile: File): void => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }
    
    setFile(selectedFile);
    setResult(null);
  };

  const handleDrag = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async (): Promise<void> => {
    if (!file) return;

    setImporting(true);
    try {
      // Parse CSV file
      const csvData = await SimpleCSVService.parseCSV(file);
      
      // Validate structure
      const validation = SimpleCSVService.validateCSVStructure(csvData);
      if (!validation.success) {
        setResult(validation);
        setImporting(false);
        return;
      }

      // Transform to simple configurations
      const configs = SimpleCSVService.transformCSVToConfigs(csvData);
      
      // Store configurations in localStorage for now
      localStorage.setItem(`inteligencia_csv_import_${tenantId}`, JSON.stringify(configs));
      
      const successResult: CSVImportResult = {
        success: true,
        totalRows: csvData.length,
        processedRows: csvData.length,
        errors: []
      };
      
      setResult(successResult);
      onImportComplete?.(successResult);
      
    } catch (error) {
      const errorResult: CSVImportResult = {
        success: false,
        totalRows: 0,
        processedRows: 0,
        errors: [{ 
          row: 0, 
          field: 'general', 
          error: error instanceof Error ? error.message : 'Import failed' 
        }]
      };
      
      setResult(errorResult);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (): void => {
    // Create a sample CSV template
    const templateData = [
      ['section', 'field', 'content_type', 'hotels_content', 'restaurants_content', 'dental_content', 'sports_content', 'description', 'image_description'],
      ['hero', 'main_title', 'text', 'Transform Your Hotel Business', 'Fill Every Table Every Night', 'Grow Your Practice', 'Build Your Community', 'Main headline', 'N/A'],
      ['hero', 'subtitle', 'text', 'Drive direct bookings with proven strategies', 'Drive foot traffic with restaurant marketing', 'Attract quality patients', 'Grow memberships and engagement', 'Supporting headline', 'N/A']
    ];
    
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inteligencia_content_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          CSV Content Import
        </h2>
        <p className="text-gray-600">
          Import content for all industries from a CSV file. Use our template to ensure proper formatting.
        </p>
      </div>

      {/* Template Download */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Need a template?</h3>
            <p className="text-sm text-blue-700">Download our CSV template to get started</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download Template
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-4xl">📄</div>
              <div>
                <div className="font-medium text-gray-900">{file.name}</div>
                <div className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove file
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl text-gray-400">📁</div>
              <div>
                <div className="text-lg font-medium text-gray-900 mb-2">
                  Drop your CSV file here
                </div>
                <div className="text-gray-500 mb-4">
                  or click to browse
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  Choose File
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Button */}
      {file && (
        <div className="mb-6">
          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {importing ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Importing...
              </div>
            ) : (
              'Import Content'
            )}
          </button>
        </div>
      )}

      {/* Import Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-center mb-3">
            <div className={`text-2xl mr-3 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? '✅' : '❌'}
            </div>
            <div>
              <div className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? 'Import Successful!' : 'Import Failed'}
              </div>
              <div className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                Processed {result.processedRows} of {result.totalRows} rows
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <div className="font-medium text-red-900 mb-2">Errors:</div>
              <div className="space-y-1">
                {result.errors.slice(0, 10).map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    Row {error.row}: {error.field} - {error.error}
                  </div>
                ))}
                {result.errors.length > 10 && (
                  <div className="text-sm text-red-600">
                    ... and {result.errors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {result.success && (
            <div className="mt-4 text-sm text-green-700">
              ✓ Content imported for all industries<br />
              ✓ Configurations updated in local storage<br />
              ✓ Ready for preview and editing
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};