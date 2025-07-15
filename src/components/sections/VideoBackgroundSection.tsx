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
  const [isMobile, setIsMobile] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Intersection Observer to load video only when section is visible
  useEffect(() => {
    const currentSection = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVideoLoading) {
            isVideoLoading = true;
            // Delay to allow preloader to finish
            setTimeout(() => {
              setShouldLoadVideo(true);
            }, 500);
          }
        });
      },
      { threshold: 0.1 }
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
          setIsVideoReady(true);
          isVideoLoading = false;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Get the appropriate video URL
  const videoUrl = isMobile && mobileVideoUrl ? mobileVideoUrl : desktopVideoUrl;

  return (
    <section 
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black" 
      style={{ height: '85vh' }}
    >
      {/* Static background while video loads - will be replaced with first frame screenshot later */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Vimeo Video Container - Only load when visible and ready */}
      {shouldLoadVideo && (
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
          style={{
            // Scale container to avoid black bars
            width: '100%',
            height: '100%',
          }}
        >
          <iframe
            ref={iframeRef}
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
            onLoad={() => {
              // Enable postMessage communication for event listening
              if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage('{"method":"addEventListener","value":"play"}', '*');
                iframeRef.current.contentWindow.postMessage('{"method":"addEventListener","value":"timeupdate"}', '*');
              }
              
              // Fallback timer in case postMessage doesn't work
              setTimeout(() => {
                if (!isVideoReady) {
                  setIsVideoReady(true);
                  isVideoLoading = false;
                }
              }, 4000);
            }}
          />
        </div>
      )}
    </section>
  );
};