import React, { useState } from 'react';
import type { IndustryType } from '../../types/Industry';

export const UnifiedInteligenciaAppDebug: React.FC = () => {
  const [phase, setPhase] = useState<'selection' | 'transitioning' | 'industry'>('selection');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | null>(null);

  const handleIndustryClick = async (industry: IndustryType) => {
    // Industry click tracking removed
    setPhase('transitioning');
    setSelectedIndustry(industry);
    
    setTimeout(() => {
      // Transitioning to industry phase
      setPhase('industry');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl mb-8">Phase: {phase}</h1>
        <h2 className="text-2xl mb-8">Selected: {selectedIndustry || 'none'}</h2>
        
        {phase === 'selection' && (
          <div className="flex gap-8">
            <button 
              onClick={() => handleIndustryClick('hospitality')}
              className="px-6 py-3 bg-blue-500 text-white rounded"
            >
              Hotels
            </button>
            <button 
              onClick={() => handleIndustryClick('foodservice')}
              className="px-6 py-3 bg-pink-500 text-white rounded"
            >
              Food Service
            </button>
          </div>
        )}
        
        {phase === 'transitioning' && (
          <p className="text-xl">Transitioning...</p>
        )}
        
        {phase === 'industry' && (
          <div>
            <p className="text-xl">Welcome to {selectedIndustry}</p>
            <div className="mt-8 p-8 bg-gray-100">
              <p>Content would load here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};