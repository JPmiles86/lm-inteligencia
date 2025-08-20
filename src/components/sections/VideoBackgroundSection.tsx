// Full viewport video background section - no text or overlays

import React, { useEffect, useState, useRef } from 'react';

interface VideoBackgroundSectionProps {
  desktopVideoUrl?: string;
  mobileVideoUrl?: string;
}

// Global flag to prevent multiple video instances from loading simultaneously
let isVideoLoading = false;

export const VideoBackgroundSection: React.FC<VideoBackgroundSectionProps> = ({ 
  desktopVideoUrl = 'https://player.vimeo.com/video/1100417251',
  mobileVideoUrl = 'https://player.vimeo.com/video/1100417904'
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isDesktopReady, setIsDesktopReady] = useState(false);
  const [isMobileReady, setIsMobileReady] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const desktopIframeRef = useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Intersection Observer to load video when section is about to be visible
  useEffect(() => {
    const currentSection = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVideoLoading) {
            isVideoLoading = true;
            // Load immediately - video should already be preloaded
            setShouldLoadVideo(true);
          }
        });
      },
      { 
        threshold: 0.01, // Trigger earlier when just 1% is visible
        rootMargin: '200px' // Start loading 200px before the section comes into view
      }
    );

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  // Listen for Vimeo player events to detect when video is actually playing
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://player.vimeo.com') return;
      
      try {
        const data = JSON.parse(event.data);
        // Listen for play event which indicates video is actually playing
        if (data.event === 'play' || data.event === 'timeupdate') {
          // Determine which video sent the message based on player_id
          if (data.player_id === 'desktop-video') {
            setIsDesktopReady(true);
          } else if (data.player_id === 'mobile-video') {
            setIsMobileReady(true);
          }
          isVideoLoading = false;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Determine which video is ready
  const isCurrentVideoReady = isMobile ? isMobileReady : isDesktopReady;

  return (
    <section 
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black" 
      style={{ height: '85vh' }}
    >
      {/* Gradient placeholder while video loads */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"></div>
      
      {/* Loading indicator - subtle pulse */}
      {shouldLoadVideo && !isCurrentVideoReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Video Container with both videos preloaded */}
      {shouldLoadVideo && (
        <div 
          className="absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Desktop Video */}
          <iframe
            ref={desktopIframeRef}
            src={`${desktopVideoUrl}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&quality=auto&responsive=1`}
            className={`absolute transition-opacity duration-500 ${!isMobile && isDesktopReady ? 'opacity-100' : 'opacity-0'} ${isMobile ? 'pointer-events-none' : ''}`}
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              // Always fill width, height adjusts to maintain 16:9
              width: '100vw',
              height: '56.25vw', // 16:9 aspect ratio
              // But also ensure minimum height covers viewport
              minHeight: '100vh',
              minWidth: '177.77vh', // 16:9 aspect ratio
              transform: 'translate(-50%, -50%)',
              border: 'none',
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            title="Desktop background video"
            onLoad={() => {
              // Enable postMessage communication for event listening
              if (desktopIframeRef.current?.contentWindow) {
                desktopIframeRef.current.contentWindow.postMessage('{"method":"addEventListener","value":"play"}', '*');
                desktopIframeRef.current.contentWindow.postMessage('{"method":"addEventListener","value":"timeupdate"}', '*');
              }
              
              // Fallback timer in case postMessage doesn't work
              setTimeout(() => {
                if (!isDesktopReady) {
                  setIsDesktopReady(true);
                }
              }, 1500);
            }}
          />
          
          {/* Mobile Video */}
          <iframe
            ref={mobileIframeRef}
            src={`${mobileVideoUrl}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&quality=auto&responsive=1`}
            className={`absolute transition-opacity duration-500 ${isMobile && isMobileReady ? 'opacity-100' : 'opacity-0'} ${!isMobile ? 'pointer-events-none' : ''}`}
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              // Always fill width, height adjusts to maintain 16:9
              width: '100vw',
              height: '56.25vw', // 16:9 aspect ratio
              // But also ensure minimum height covers viewport
              minHeight: '100vh',
              minWidth: '177.77vh', // 16:9 aspect ratio
              transform: 'translate(-50%, -50%)',
              border: 'none',
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            title="Mobile background video"
            onLoad={() => {
              // Enable postMessage communication for event listening
              if (mobileIframeRef.current?.contentWindow) {
                mobileIframeRef.current.contentWindow.postMessage('{"method":"addEventListener","value":"play"}', '*');
                mobileIframeRef.current.contentWindow.postMessage('{"method":"addEventListener","value":"timeupdate"}', '*');
              }
              
              // Fallback timer in case postMessage doesn't work
              setTimeout(() => {
                if (!isMobileReady) {
                  setIsMobileReady(true);
                }
              }, 1500);
            }}
          />
        </div>
      )}
    </section>
  );
};