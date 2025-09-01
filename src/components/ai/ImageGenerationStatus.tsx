import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Image, RefreshCw, Clock, DollarSign, Zap } from 'lucide-react';
import { GenerationResult } from '@/services/ai/ImageGenerationPipeline';

interface ImageGenerationStatusProps {
  results: GenerationResult[];
  onRetry?: (failed: GenerationResult[]) => void;
  onComplete?: () => void;
  isGenerating?: boolean;
}

export const ImageGenerationStatus: React.FC<ImageGenerationStatusProps> = ({
  results,
  onRetry,
  onComplete,
  isGenerating = false
}) => {
  const [isComplete, setIsComplete] = useState(false);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);
  const avgTime = results.length > 0 
    ? results.reduce((sum, r) => sum + (r.generationTime || 0), 0) / results.length 
    : 0;
  
  // Group by provider for provider stats
  const providerStats = results.reduce((acc, r) => {
    if (r.provider) {
      if (!acc[r.provider]) {
        acc[r.provider] = { count: 0, cost: 0, success: 0 };
      }
      acc[r.provider].count++;
      acc[r.provider].cost += r.cost || 0;
      if (r.success) acc[r.provider].success++;
    }
    return acc;
  }, {} as Record<string, { count: number; cost: number; success: number }>);
  
  useEffect(() => {
    if (results.length > 0 && !isGenerating && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [results, isGenerating, isComplete, onComplete]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Image Generation Status</h3>
        {isGenerating && (
          <div className="flex items-center text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Generating...</span>
          </div>
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
            <div className="text-2xl font-bold text-green-600">
              {successful.length}
            </div>
          </div>
          <div className="text-sm text-gray-500">Successful</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <XCircle className="h-5 w-5 text-red-600 mr-1" />
            <div className="text-2xl font-bold text-red-600">
              {failed.length}
            </div>
          </div>
          <div className="text-sm text-gray-500">Failed</div>
        </div>
        
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="h-5 w-5 text-blue-600 mr-1" />
            <div className="text-2xl font-bold text-blue-600">
              ${totalCost.toFixed(2)}
            </div>
          </div>
          <div className="text-sm text-gray-500">Total Cost</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-5 w-5 text-purple-600 mr-1" />
            <div className="text-2xl font-bold text-purple-600">
              {(avgTime / 1000).toFixed(1)}s
            </div>
          </div>
          <div className="text-sm text-gray-500">Avg Time</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {results.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{successful.length} / {results.length}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div 
                className="bg-green-600 transition-all duration-300"
                style={{ width: `${(successful.length / results.length) * 100}%` }}
              />
              <div 
                className="bg-red-600 transition-all duration-300"
                style={{ width: `${(failed.length / results.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Provider Statistics */}
      {Object.keys(providerStats).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Provider Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(providerStats).map(([provider, stats]) => (
              <div 
                key={provider}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{provider}</span>
                  <span className="text-sm text-gray-500">
                    {stats.success}/{stats.count}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Success: {((stats.success / stats.count) * 100).toFixed(1)}%</span>
                  <span>Cost: ${stats.cost.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h4 className="text-sm font-medium mb-3">Generation Results</h4>
          {results.map((result, index) => (
            <div 
              key={result.promptId}
              className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                result.success 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">
                    Image #{index + 1}
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.provider && (
                      <span className="capitalize">{result.provider}</span>
                    )}
                    {result.generationTime && (
                      <>
                        {result.provider && ' • '}
                        {(result.generationTime / 1000).toFixed(1)}s
                      </>
                    )}
                    {result.cost && (
                      <>
                        {(result.provider || result.generationTime) && ' • '}
                        ${result.cost.toFixed(2)}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {result.storedImage && (
                  <img 
                    src={result.storedImage.thumbnailUrl || result.storedImage.url}
                    alt=""
                    className="h-12 w-12 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                
                {!result.success && result.error && (
                  <div className="text-sm text-red-600 max-w-xs truncate">
                    {result.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500">
          {results.length > 0 && (
            <span>
              {successful.length} successful, {failed.length} failed
            </span>
          )}
        </div>
        
        <div className="flex space-x-3">
          {failed.length > 0 && onRetry && (
            <button
              onClick={() => onRetry(failed)}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Retry Failed ({failed.length})</span>
            </button>
          )}
          
          {results.length === 0 && isGenerating && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Starting generation...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationStatus;