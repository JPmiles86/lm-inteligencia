// Case Studies Page - Showcase client results with timeline presentation

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIndustryContext } from '../../contexts/IndustryContext';
import { getIndustryName, CaseStudyContent, IndustryConfig } from '../../types/Industry';
import { CaseStudyTimeline } from '../CaseStudyTimeline';
// Removed unused universalContent import
import { defaultIndustryConfigs } from '../../config/industry-configs';

export const CaseStudiesPage: React.FC = () => {
  const { config, industryKey } = useIndustryContext();
  const currentIndustryName = getIndustryName(config.industry);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(currentIndustryName);
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Removed unused industryName variable
  
  // Collect all case studies from all industries
  const allCaseStudies: CaseStudyContent[] = [];
  Object.values(defaultIndustryConfigs).forEach((industryConfig: IndustryConfig) => {
    const studies = industryConfig.content?.caseStudies || [];
    allCaseStudies.push(...studies);
  });
  
  const caseStudiesData = allCaseStudies;
  
  // Debug logging removed
  
  const pageHero = {
    title: 'Client Success Stories',
    subtitle: 'Real results from real businesses. See how Inteligencia transforms challenges into success stories.'
  };
  
  
  // Get all unique tags from case studies
  // Removed unused allTags variable
  
  const industries = ['all', 'Hotels & Hospitality', 'Restaurants & Food Service', 'Healthcare', 'Sports & Recreation'];
  
  // Filter case studies based on selected filters
  const filteredCaseStudies = caseStudiesData.filter(study => {
    const industryMatch = selectedIndustry === 'all' || study.industry === selectedIndustry;
    const tagMatch = selectedTags.length === 0 || selectedTags.some(tag => study.tags.includes(tag));
    return industryMatch && tagMatch;
  });

  // Generate timeline data for a case study
  const generateTimelineData = (study: typeof caseStudiesData[0]) => {
    const timelinePoints = [
      {
        date: 'Day 1',
        title: 'Partnership Begins',
        description: 'Initial audit and strategy development',
        type: 'start' as const
      },
      {
        date: 'Month 1',
        title: 'Implementation Phase',
        description: study.solution.substring(0, 100) + '...',
        type: 'milestone' as const
      },
      {
        date: 'Month 3',
        title: 'First Results',
        description: study.results[0] ? `${study.results[0].metric}: ${study.results[0].value}` : 'Initial results achieved',
        metric: study.results[0]?.value || '',
        type: 'result' as const
      },
      {
        date: '6 months',
        title: 'Full Results Achieved',
        description: study.results.slice(1, 3).map((r) => `${r.metric}: ${r.value}`).join(', '),
        metric: study.results[2]?.value || study.results[1]?.value || '',
        type: 'result' as const
      }
    ];
    return timelinePoints;
  };


  const renderTimelineView = () => (
    <div className="relative">
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-300 h-full hidden lg:block"></div>
      {filteredCaseStudies.map((study, index) => (
        <motion.div
          key={study.id}
          initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          viewport={{ once: true }}
          className={`relative flex flex-col lg:flex-row items-center mb-16 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
        >
          <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'} mb-8 lg:mb-0`}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Case Study Image */}
              {study.image && (
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={study.image} 
                    alt={study.client}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {study.industry}
                  </span>
                  <span className="text-sm text-gray-500">6 months</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{study.client}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                  <p className="text-gray-600 text-sm">{study.challenge}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                  <p className="text-gray-600 text-sm">{study.solution}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  {study.results.map((result, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xl font-bold text-primary mb-1">{result.value}</div>
                      <div className="text-xs text-gray-600">{result.metric}</div>
                    </div>
                  ))}
                </div>

                {/* Timeline button */}
                <button
                  onClick={() => setSelectedTimeline(study.id)}
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Journey Timeline
                </button>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {study.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg hidden lg:block"></div>
          
          <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'}`}>
            <div className="bg-gray-100 rounded-xl p-6">
              <blockquote className="text-gray-700 italic mb-4">
                "{study.testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {study.testimonial.author.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{study.testimonial.author}</div>
                  <div className="text-sm text-gray-600">{study.testimonial.position}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );




  // Render logging removed
  
  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              {pageHero.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {pageHero.subtitle}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">4</div>
                <div className="text-gray-300">Industries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">100+</div>
                <div className="text-gray-300">Success Stories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">$2.8M</div>
                <div className="text-gray-300">Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">95%</div>
                <div className="text-gray-300">Client Retention</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Controls */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Industry Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Industry:</span>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Filters:</span>
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 cursor-pointer hover:bg-primary/90"
                    onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                  >
                    {tag}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                ))}
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderTimelineView()}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#371657] via-[#9123d1] to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Become Our Next Success Story?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join the businesses that have transformed their marketing and achieved remarkable results with Inteligencia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                Get Your Free Analysis
              </a>
              <a
                href="/services"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                View Our Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Modal */}
      {selectedTimeline && (
        <CaseStudyTimeline
          studyId={selectedTimeline}
          clientName={filteredCaseStudies.find(s => s.id === selectedTimeline)?.client || ''}
          timeline='6 months'
          points={generateTimelineData(filteredCaseStudies.find(s => s.id === selectedTimeline)!)}
          onClose={() => setSelectedTimeline(null)}
        />
      )}

    </div>
  );
};