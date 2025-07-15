// Full viewport video background section - no text or overlays

import React, { useEffect, useState } from 'react';

interface VideoBackgroundSectionProps {
  desktopVideoUrl?: string;
  mobileVideoUrl?: string;
}

export const VideoBackgroundSection: React.FC<VideoBackgroundSectionProps> = ({ 
  desktopVideoUrl = 'https://player.vimeo.com/video/1100417251',
  mobileVideoUrl = 'https://player.vimeo.com/video/1100417904'
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Preload video for better performance
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://player.vimeo.com';
    document.head.appendChild(link);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Get the appropriate video URL
  const videoUrl = isMobile && mobileVideoUrl ? mobileVideoUrl : desktopVideoUrl;

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ height: '85vh' }}>
      {/* Placeholder while loading - matches brand colors */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-blue-900 animate-pulse" />
      )}
      
      {/* Vimeo Video Container */}
      <div 
        className="absolute inset-0"
        style={{
          // Scale container to avoid black bars
          width: '100%',
          height: '100%',
        }}
      >
        <iframe
          src={`${videoUrl}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&quality=auto&responsive=1`}
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '56.25vw', // 16:9 Aspect ratio
            minHeight: '100vh',
            minWidth: '177.77vh', // 16:9 Aspect ratio
            transform: 'translate(-50%, -50%)',
            border: 'none',
          }}
          allow="autoplay; fullscreen; picture-in-picture"
          title="Background video"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </section>
  );
};