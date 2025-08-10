import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TimelinePoint {
  date: string;
  title: string;
  description: string;
  metric?: string;
  type: 'milestone' | 'result' | 'start';
}

interface CaseStudyTimelineProps {
  studyId: string;
  clientName: string;
  timeline: string;
  points: TimelinePoint[];
  onClose: () => void;
}

export const CaseStudyTimeline: React.FC<CaseStudyTimelineProps> = ({
  clientName,
  timeline,
  points,
  onClose
}) => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{clientName} Journey</h3>
            <p className="text-gray-600">Timeline: {timeline}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          {/* Timeline points */}
          {points.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start mb-8 last:mb-0"
            >
              {/* Timeline dot */}
              <div 
                className={`
                  absolute left-8 w-4 h-4 rounded-full -translate-x-1/2 cursor-pointer
                  ${point.type === 'start' ? 'bg-primary' : ''}
                  ${point.type === 'milestone' ? 'bg-blue-500' : ''}
                  ${point.type === 'result' ? 'bg-green-500' : ''}
                  ${selectedPoint === index ? 'ring-4 ring-opacity-30' : ''}
                  ${point.type === 'start' && selectedPoint === index ? 'ring-primary' : ''}
                  ${point.type === 'milestone' && selectedPoint === index ? 'ring-blue-500' : ''}
                  ${point.type === 'result' && selectedPoint === index ? 'ring-green-500' : ''}
                `}
                onClick={() => setSelectedPoint(selectedPoint === index ? null : index)}
              />

              {/* Content */}
              <div className="ml-16 flex-1">
                <div className="text-sm text-gray-500 mb-1">{point.date}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{point.title}</h4>
                <p className="text-gray-600">{point.description}</p>
                
                {point.metric && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {point.metric}
                  </motion.div>
                )}

                {selectedPoint === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="text-sm text-gray-600">
                      {point.type === 'start' && 'This marks the beginning of our partnership.'}
                      {point.type === 'milestone' && 'A key milestone in the transformation journey.'}
                      {point.type === 'result' && 'Measurable results achieved through our strategies.'}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-gray-600">Start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Milestone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Result</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Close Timeline
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};