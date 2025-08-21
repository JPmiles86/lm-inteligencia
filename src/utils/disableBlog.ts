// Utility to disable blog visibility
export const disableBlogVisibility = () => {
  const settings = {
    showStaffSection: true,
    showBlog: false
  };
  
  localStorage.setItem('admin_settings', JSON.stringify(settings));
  
  // Dispatch custom event to update any listening components
  window.dispatchEvent(new Event('adminSettingsUpdated'));
  
  console.log('Blog visibility disabled');
};

// Run this function to disable blog
disableBlogVisibility();