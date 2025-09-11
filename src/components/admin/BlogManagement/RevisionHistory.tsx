// Revision History Component - View, compare, and restore blog post revisions

import React, { useState } from 'react';
import { BlogRevision, SEOFields } from '../../../data/blogData';

interface RevisionHistoryProps {
  revisions: BlogRevision[];
  currentContent: string;
  currentTitle: string;
  currentExcerpt?: string;
  currentSeoData?: SEOFields;
  onRestoreRevision: (revision: BlogRevision) => void;
  onClose: () => void;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({
  revisions,
  currentContent,
  currentTitle,
  currentExcerpt,
  currentSeoData,
  onRestoreRevision,
  onClose
}) => {
  const [selectedRevision, setSelectedRevision] = useState<BlogRevision | null>(null);
  const [compareMode, setCompareMode] = useState<'content' | 'title' | 'excerpt' | 'seo'>('content');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeTypeIcon = (changeType: 'auto' | 'manual' | 'publish') => {
    switch (changeType) {
      case 'auto':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'manual':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'publish':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
    }
  };

  const getChangeTypeBadge = (changeType: 'auto' | 'manual' | 'publish') => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (changeType) {
      case 'auto':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'manual':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'publish':
        return `${baseClasses} bg-purple-100 text-purple-800`;
    }
  };

  const renderDiff = (oldText: string, newText: string) => {
    // Simple diff implementation - in a production app you'd use a proper diff library
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    
    // Find common subsequence and mark differences
    const diffResult = [];
    let i = 0, j = 0;
    
    while (i < oldWords.length || j < newWords.length) {
      if (i >= oldWords.length) {
        // Remaining words are additions
        diffResult.push(<span key={j} className="bg-green-200 text-green-800 px-1 rounded">+{newWords[j]}</span>);
        j++;
      } else if (j >= newWords.length) {
        // Remaining words are deletions
        diffResult.push(<span key={i} className="bg-red-200 text-red-800 px-1 rounded line-through">-{oldWords[i]}</span>);
        i++;
      } else if (oldWords[i] === newWords[j]) {
        // Words match
        diffResult.push(<span key={i}>{oldWords[i]}</span>);
        i++;
        j++;
      } else {
        // Words differ - mark as changed
        diffResult.push(
          <span key={`${i}-${j}`}>
            <span className="bg-red-200 text-red-800 px-1 rounded line-through">-{oldWords[i]}</span>{' '}
            <span className="bg-green-200 text-green-800 px-1 rounded">+{newWords[j]}</span>
          </span>
        );
        i++;
        j++;
      }
      if (i < oldWords.length || j < newWords.length) {
        diffResult.push(' ');
      }
    }
    
    return <div className="whitespace-pre-wrap">{diffResult}</div>;
  };

  const renderComparison = () => {
    if (!selectedRevision) return null;

    const getCurrentValue = () => {
      switch (compareMode) {
        case 'title': return currentTitle;
        case 'excerpt': return currentExcerpt || '';
        case 'content': return currentContent;
        case 'seo': return JSON.stringify(currentSeoData || {}, null, 2);
      }
    };

    const getRevisionValue = () => {
      switch (compareMode) {
        case 'title': return selectedRevision.title;
        case 'excerpt': return selectedRevision.excerpt || '';
        case 'content': return selectedRevision.content;
        case 'seo': return JSON.stringify(selectedRevision.seoData || {}, null, 2);
      }
    };

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Comparing {compareMode} changes
          </h4>
          <div className="flex gap-2">
            {(['content', 'title', 'excerpt', 'seo'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCompareMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  compareMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Current Version */}
          <div>
            <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Current Version
            </h5>
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {getCurrentValue()}
              </div>
            </div>
          </div>

          {/* Selected Revision */}
          <div>
            <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Revision from {formatDate(selectedRevision.timestamp)}
            </h5>
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {getRevisionValue()}
              </div>
            </div>
          </div>
        </div>

        {/* Diff View */}
        <div className="mt-6">
          <h5 className="font-semibold text-gray-700 mb-2">Differences</h5>
          <div className="bg-white border rounded-lg p-4 h-48 overflow-y-auto">
            <div className="text-sm">
              {renderDiff(getRevisionValue(), getCurrentValue())}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onRestoreRevision(selectedRevision)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Restore This Revision
          </button>
          <button
            onClick={() => setSelectedRevision(null)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Revision History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedRevision ? (
            <div className="p-6 h-full overflow-y-auto">
              {renderComparison()}
            </div>
          ) : (
            <div className="p-6">
              {revisions.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No revisions yet</h3>
                  <p className="text-gray-600">Revisions will appear here as you make changes to your post.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {revisions.length} revision{revisions.length !== 1 ? 's' : ''} found
                    </h4>
                    <p className="text-gray-600">Click on any revision to compare with the current version.</p>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {revisions.map((revision) => (
                      <div
                        key={revision.id}
                        onClick={() => setSelectedRevision(revision)}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getChangeTypeIcon(revision.changeType)}
                              <span className="font-medium text-gray-900">
                                {revision.title || 'Untitled'}
                              </span>
                              <span className={getChangeTypeBadge(revision.changeType)}>
                                {revision.changeType}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              {formatDate(revision.timestamp)}
                              {revision.author && (
                                <span className="ml-2">by {revision.author}</span>
                              )}
                            </div>
                            
                            {revision.excerpt && (
                              <p className="text-sm text-gray-700 line-clamp-2">
                                {revision.excerpt}
                              </p>
                            )}
                          </div>
                          
                          <button className="ml-4 text-purple-600 hover:text-purple-800 text-sm font-medium">
                            Compare →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};