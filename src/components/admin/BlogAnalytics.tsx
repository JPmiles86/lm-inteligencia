// Blog Analytics Dashboard Component

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { blogService, BlogStats } from '../../services/blogService';

interface AnalyticsData {
  stats: BlogStats;
  recentActivity: {
    date: string;
    action: string;
    postTitle: string;
    author: string;
  }[];
  topCategories: {
    name: string;
    count: number;
    percentage: number;
  }[];
  topTags: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

export const BlogAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = await blogService.getStats();
      
      // Process categories data
      const totalCategoryPosts = Object.values(stats.categoryCounts).reduce((sum, count) => sum + count, 0);
      const topCategories = Object.entries(stats.categoryCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalCategoryPosts > 0 ? (count / totalCategoryPosts) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process tags data
      const totalTagUsage = Object.values(stats.tagCounts).reduce((sum, count) => sum + count, 0);
      const topTags = Object.entries(stats.tagCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalTagUsage > 0 ? (count / totalTagUsage) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Simulate recent activity (in a real app, this would come from an activity log API)
      const recentActivity = [
        {
          date: new Date().toISOString(),
          action: 'Published',
          postTitle: 'Latest Marketing Insights',
          author: 'Laurie Meiring'
        },
        {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          action: 'Updated',
          postTitle: 'SEO Best Practices 2024',
          author: 'Laurie Meiring'
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          action: 'Created Draft',
          postTitle: 'Social Media Trends',
          author: 'Laurie Meiring'
        }
      ];

      setAnalytics({
        stats,
        recentActivity,
        topCategories,
        topTags
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPublishRate = () => {
    if (!analytics) return 0;
    const { stats } = analytics;
    const totalDrafts = stats.draftPosts;
    const totalPublished = stats.publishedPosts;
    const total = totalDrafts + totalPublished;
    return total > 0 ? (totalPublished / total) * 100 : 0;
  };

  const getEngagementColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833-.23 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { stats, recentActivity, topCategories, topTags } = analytics;
  const publishRate = getPublishRate();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Analytics</h1>
          <p className="text-gray-600 mt-2">Track your blog performance and content insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.publishedPosts} published, {stats.draftPosts} drafts
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Publish Rate</p>
              <p className="text-2xl font-bold text-gray-900">{publishRate.toFixed(0)}%</p>
              <p className="text-xs text-gray-500 mt-1">
                Published vs total content
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.featuredPosts}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.publishedPosts > 0 ? ((stats.featuredPosts / stats.publishedPosts) * 100).toFixed(0) : 0}% of published
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tags</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.tagCounts).length}</p>
              <p className="text-xs text-gray-500 mt-1">
                Across all content
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full bg-blue-${(index + 1) * 100}`}></div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{category.count} posts</span>
                  <span className="text-xs text-gray-400">({category.percentage.toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.action === 'Published' ? 'bg-green-500' :
                  activity.action === 'Updated' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span>{' '}
                    <span className="truncate">{activity.postTitle}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.date)} by {activity.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {topTags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {tag.name}
              <span className="ml-1 text-xs text-gray-500">({tag.count})</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${getEngagementColor(publishRate)}`}>
            <h4 className="font-medium">Publish Rate</h4>
            <p className="text-2xl font-bold">{publishRate.toFixed(0)}%</p>
            <p className="text-sm opacity-80">
              {publishRate >= 75 ? 'Excellent' : publishRate >= 50 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-100 text-purple-800">
            <h4 className="font-medium">Featured Content</h4>
            <p className="text-2xl font-bold">{stats.featuredPosts}</p>
            <p className="text-sm opacity-80">Posts highlighted</p>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-100 text-blue-800">
            <h4 className="font-medium">Content Diversity</h4>
            <p className="text-2xl font-bold">{Object.keys(stats.categoryCounts).length}</p>
            <p className="text-sm opacity-80">Categories covered</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};