// Streaming Display - Real-time content display during AI generation
// Shows streaming content with typing animation and progress indicators

import React, { useEffect, useState, useRef } from 'react';
import { useAIStore } from '../../../store/aiStore';
import { 
  Loader2, 
  Zap, 
  Clock, 
  DollarSign,
  Hash,
  BarChart3,
  Pause,
  Play,
  Square,
} from 'lucide-react';

interface StreamingDisplayProps {
  content: string;
  showStats?: boolean;
}

export const StreamingDisplay: React.FC<StreamingDisplayProps> = ({
  content,
  showStats = true,
}) => {
  const { 
    streaming,
    activeProvider,
    activeModel,
    providers,
  } = useAIStore();

  const [displayContent, setDisplayContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(30); // ms per character
  const [stats, setStats] = useState({
    startTime: Date.now(),
    wordCount: 0,
    charCount: 0,
    estimatedTokens: 0,
    estimatedCost: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize stats when streaming starts
  useEffect(() => {
    if (streaming && content === '') {
      setStats({
        startTime: Date.now(),
        wordCount: 0,
        charCount: 0,
        estimatedTokens: 0,
        estimatedCost: 0,
      });
      setCurrentIndex(0);
      setDisplayContent('');
    }
  }, [streaming, content]);

  // Typing animation effect
  useEffect(() => {
    if (isPaused || currentIndex >= content.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= content.length) {
          return prev;
        }
        
        const newIndex = prev + 1;
        const newContent = content.slice(0, newIndex);
        setDisplayContent(newContent);

        // Update stats
        const words = newContent.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = newContent.length;
        const tokens = Math.ceil(chars / 4); // Rough estimation
        
        const provider = providers[activeProvider];
        const model = provider?.models?.find(m => m.id === activeModel);
        const estimatedCost = model ? (tokens * model.pricing.output) : 0;

        setStats(prev => ({
          ...prev,
          wordCount: words,
          charCount: chars,
          estimatedTokens: tokens,
          estimatedCost,
        }));

        return newIndex;
      });
    }, typingSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [content, currentIndex, isPaused, typingSpeed, activeProvider, activeModel, providers]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayContent]);

  // Handle typing speed control
  const handleSpeedChange = (speed: number) => {
    setTypingSpeed(speed);
  };

  // Toggle pause/play
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Skip to end
  const skipToEnd = () => {
    setCurrentIndex(content.length);
    setDisplayContent(content);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Calculate elapsed time
  const elapsedTime = Math.floor((Date.now() - stats.startTime) / 1000);
  const wordsPerMinute = stats.wordCount > 0 ? Math.round((stats.wordCount / elapsedTime) * 60) : 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Streaming Header */}
      {showStats && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                Generating Content
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-blue-700 dark:text-blue-200">
              <Zap className="h-3 w-3" />
              <span className="capitalize">{activeProvider}</span>
              <span>•</span>
              <span>{activeModel}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-2">
            {/* Speed Control */}
            <select
              value={typingSpeed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            >
              <option value={10}>Fast</option>
              <option value={30}>Normal</option>
              <option value={60}>Slow</option>
            </select>

            {/* Pause/Play */}
            <button
              onClick={togglePause}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>

            {/* Skip to End */}
            <button
              onClick={skipToEnd}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
              title="Skip to end"
            >
              <Square className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {showStats && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{elapsedTime}s</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3" />
              <span>{stats.wordCount} words</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Hash className="h-3 w-3" />
              <span>~{stats.estimatedTokens} tokens</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3" />
              <span>${stats.estimatedCost.toFixed(4)}</span>
            </div>
            
            {wordsPerMinute > 0 && (
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>{wordsPerMinute} wpm</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${content.length > 0 ? (currentIndex / content.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span>{content.length > 0 ? Math.round((currentIndex / content.length) * 100) : 0}%</span>
          </div>
        </div>
      )}

      {/* Content Display */}
      <div
        ref={contentRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed"
      >
        {displayContent ? (
          <div className="prose dark:prose-invert max-w-none">
            <div
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
            
            {/* Typing Cursor */}
            {streaming && currentIndex < content.length && !isPaused && (
              <span className="inline-block w-0.5 h-5 bg-blue-600 dark:bg-blue-400 ml-1 animate-pulse" />
            )}
          </div>
        ) : (
          // Initial loading state
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Starting Generation...</p>
              <p className="text-sm">Connecting to {activeProvider}</p>
              
              {/* Loading animation */}
              <div className="flex items-center justify-center mt-4 space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {streaming && showStats && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Streaming active</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isPaused ? 'Paused' : 'Live streaming'}
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        .animate-bounce {
          animation: bounce 1.4s infinite both;
        }
        
        .animate-bounce:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .animate-bounce:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};