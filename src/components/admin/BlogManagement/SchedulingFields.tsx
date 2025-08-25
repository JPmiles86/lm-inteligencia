// Scheduling Fields Component - Content scheduling with timezone support

import React, { useState, useEffect } from 'react';

interface SchedulingFieldsProps {
  status: 'draft' | 'scheduled' | 'published';
  scheduledPublishDate?: Date;
  timezone?: string;
  publishedDate?: string;
  onStatusChange: (status: 'draft' | 'scheduled' | 'published') => void;
  onScheduledDateChange: (date: Date | undefined) => void;
  onTimezoneChange: (timezone: string) => void;
  errors?: Record<string, string>;
}

export const SchedulingFields: React.FC<SchedulingFieldsProps> = ({
  status,
  scheduledPublishDate,
  timezone,
  publishedDate,
  onStatusChange,
  onScheduledDateChange,
  onTimezoneChange,
  errors = {}
}) => {
  const [localDatetime, setLocalDatetime] = useState('');
  
  // Common timezones list
  const commonTimezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'UTC'
  ];

  // Get user's current timezone as default
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (scheduledPublishDate) {
      // Convert Date to local datetime string for input
      const date = new Date(scheduledPublishDate);
      const localString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setLocalDatetime(localString);
    }
  }, [scheduledPublishDate]);

  const handleDateTimeChange = (datetimeString: string) => {
    setLocalDatetime(datetimeString);
    
    if (datetimeString) {
      // Convert local datetime string to Date object
      const date = new Date(datetimeString);
      onScheduledDateChange(date);
      
      // Automatically set status to scheduled if date is in the future
      if (date > new Date() && status === 'draft') {
        onStatusChange('scheduled');
      }
    } else {
      onScheduledDateChange(undefined);
    }
  };

  const handleStatusChange = (newStatus: 'draft' | 'scheduled' | 'published') => {
    onStatusChange(newStatus);
    
    // Clear scheduled date if changing away from scheduled
    if (newStatus !== 'scheduled') {
      onScheduledDateChange(undefined);
      setLocalDatetime('');
    }
    
    // Set current date if publishing immediately
    if (newStatus === 'published' && !publishedDate) {
      onScheduledDateChange(new Date());
    }
  };

  const getStatusBadge = (currentStatus: 'draft' | 'scheduled' | 'published') => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (currentStatus) {
      case 'draft':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'published':
        return `${baseClasses} bg-green-100 text-green-800`;
    }
  };

  const formatScheduledTime = () => {
    if (!scheduledPublishDate) return null;
    
    const date = new Date(scheduledPublishDate);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    let timeText = '';
    if (diffMs < 0) {
      timeText = 'Past due';
    } else if (diffDays > 0) {
      timeText = `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      timeText = `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      timeText = `In ${Math.max(1, diffMinutes)} minute${diffMinutes !== 1 ? 's' : ''}`;
    }
    
    return (
      <span className={`text-xs ${diffMs < 0 ? 'text-red-600' : 'text-gray-500'}`}>
        {timeText} • {date.toLocaleString('en-US', {
          timeZone: timezone,
          dateStyle: 'medium',
          timeStyle: 'short'
        })}
        {timezone && timezone !== userTimezone && (
          <span className="ml-1">({timezone})</span>
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Publishing Schedule
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Control when your blog post goes live
        </p>
      </div>

      {/* Current Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Current Status:</span>
          <span className={getStatusBadge(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        {status === 'scheduled' && formatScheduledTime() && (
          <div>{formatScheduledTime()}</div>
        )}
      </div>

      {/* Status Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Publishing Status
        </label>
        <div className="space-y-3">
          {/* Draft */}
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => handleStatusChange('draft')}
              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <div className="font-medium text-gray-900">Save as Draft</div>
              <div className="text-sm text-gray-600">
                Keep working on this post. It won't be visible to readers.
              </div>
            </div>
          </label>

          {/* Scheduled */}
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="scheduled"
              checked={status === 'scheduled'}
              onChange={() => handleStatusChange('scheduled')}
              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Schedule for Later</div>
              <div className="text-sm text-gray-600 mb-3">
                Choose when this post should go live automatically.
              </div>
              
              {status === 'scheduled' && (
                <div className="space-y-3">
                  {/* Date/Time Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Publish Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={localDatetime}
                      onChange={(e) => handleDateTimeChange(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.scheduledPublishDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.scheduledPublishDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.scheduledPublishDate}</p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={timezone || userTimezone}
                      onChange={(e) => onTimezoneChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value={userTimezone}>
                        {userTimezone} (Your timezone)
                      </option>
                      {commonTimezones
                        .filter(tz => tz !== userTimezone)
                        .map(tz => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )}
            </div>
          </label>

          {/* Publish Now */}
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === 'published'}
              onChange={() => handleStatusChange('published')}
              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <div className="font-medium text-gray-900">Publish Immediately</div>
              <div className="text-sm text-gray-600">
                Make this post live right away for all readers to see.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Published Date Info */}
      {status === 'published' && publishedDate && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Published on {new Date(publishedDate).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short'
              })}
            </span>
          </div>
        </div>
      )}

      {/* Scheduling Tips */}
      {status === 'scheduled' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            📅 Scheduling Tips
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Posts will automatically publish at the scheduled time</li>
            <li>• You can edit scheduled posts until they go live</li>
            <li>• Consider your audience's timezone when scheduling</li>
            <li>• Peak engagement times are usually 9-11 AM and 2-4 PM</li>
          </ul>
        </div>
      )}
    </div>
  );
};