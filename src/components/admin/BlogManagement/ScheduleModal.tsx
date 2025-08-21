// Schedule Modal - Handle post scheduling with date/time picker

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, X, Check } from 'lucide-react';
import { format, isAfter, isBefore, addMinutes } from 'date-fns';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: Date, status: 'published' | 'scheduled') => void;
  currentDate?: Date;
  currentStatus?: 'draft' | 'published' | 'scheduled';
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  currentDate,
  currentStatus = 'draft'
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(
    currentDate || addMinutes(new Date(), 30)
  );
  const [selectedStatus, setSelectedStatus] = useState<'published' | 'scheduled'>(
    currentStatus === 'published' ? 'published' : 'scheduled'
  );

  if (!isOpen) return null;

  const now = new Date();
  const isPastDate = isBefore(selectedDate, now);
  const isNearFuture = isAfter(selectedDate, now) && isBefore(selectedDate, addMinutes(now, 5));

  const handleSubmit = () => {
    if (isPastDate || isNearFuture) {
      // If date is in the past or very near future, publish immediately
      onSchedule(selectedDate, 'published');
    } else {
      // Schedule for future
      onSchedule(selectedDate, selectedStatus);
    }
    onClose();
  };

  const getStatusMessage = () => {
    if (isPastDate) {
      return "This date is in the past. The post will be published immediately.";
    } else if (isNearFuture) {
      return "This date is too close. The post will be published immediately.";
    } else if (selectedStatus === 'published') {
      return "The post will be published immediately.";
    } else {
      return `The post will be scheduled to publish on ${format(selectedDate, 'PPpp')}.`;
    }
  };

  const getStatusColor = () => {
    if (isPastDate || isNearFuture) {
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    } else if (selectedStatus === 'published') {
      return "text-green-700 bg-green-50 border-green-200";
    } else {
      return "text-blue-700 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule Post</h2>
              <p className="text-sm text-gray-600">Set publication date and time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Publication Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="published"
                  checked={selectedStatus === 'published'}
                  onChange={(e) => setSelectedStatus(e.target.value as 'published')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Publish Now</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="scheduled"
                  checked={selectedStatus === 'scheduled'}
                  onChange={(e) => setSelectedStatus(e.target.value as 'scheduled')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Schedule for Later</span>
              </label>
            </div>
          </div>

          {/* Date/Time Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedStatus === 'published' ? 'Publication Date' : 'Scheduled Date & Time'}
            </label>
            
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => date && setSelectedDate(date)}
                showTimeSelect
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                disabled={selectedStatus === 'published'}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            {selectedStatus === 'published' && (
              <p className="text-xs text-gray-500 mt-2">
                Date is for reference only when publishing immediately
              </p>
            )}
          </div>

          {/* Status Message */}
          <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {selectedStatus === 'published' || isPastDate || isNearFuture ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div className="text-sm">
                {getStatusMessage()}
              </div>
            </div>
          </div>

          {/* Quick Options */}
          {selectedStatus === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Schedule Options
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate(addMinutes(now, 60))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  In 1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date(now.getTime() + 24 * 60 * 60 * 1000))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Next Week
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextMonday = new Date(now);
                    const daysUntilMonday = (8 - now.getDay()) % 7;
                    nextMonday.setDate(now.getDate() + daysUntilMonday);
                    nextMonday.setHours(9, 0, 0, 0);
                    setSelectedDate(nextMonday);
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Monday 9AM
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {selectedStatus === 'published' || isPastDate || isNearFuture ? (
                <>
                  <Check size={16} />
                  Publish Now
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  Schedule Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};