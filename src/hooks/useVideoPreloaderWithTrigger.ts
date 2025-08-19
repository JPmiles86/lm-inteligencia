// Enhanced video preloader hook that can be triggered after landing area loads
import { useEffect, useRef } from 'react';

interface NetworkInformation extends EventTarget {
  saveData: boolean;
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export const useVideoPreloaderWithTrigger = (shouldPreload: boolean = false) => {
  const iframesRef = useRef<HTMLIFrameElement[]>([]);
  const hasPreloadedRef = useRef(false);

  useEffect(() => {
    // Only proceed if shouldPreload is true and we haven't already preloaded
    if (!shouldPreload || hasPreloadedRef.current) return;

    // Check connection speed
    if ('connection' in navigator && (navigator as NavigatorWithConnection).connection) {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection && (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
        return; // Skip preloading on slow connections
      }
    }

    // Mark as preloaded
    hasPreloadedRef.current = true;

    // Preconnect to Vimeo immediately
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = 'https://player.vimeo.com';
    preconnectLink.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectLink);

    // DNS prefetch for Vimeo domains
    const dnsPrefetchLinks = [
      'https://vimeo.com',
      'https://f.vimeocdn.com',
      'https://i.vimeocdn.com'
    ];
    
    const dnsLinks = dnsPrefetchLinks.map(href => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      return link;
    });
    
    dnsLinks.forEach(link => document.head.appendChild(link));

    // Preload Vimeo player script
    const preloadScript = document.createElement('link');
    preloadScript.rel = 'preload';
    preloadScript.as = 'script';
    preloadScript.href = 'https://player.vimeo.com/api/player.js';
    document.head.appendChild(preloadScript);

    // Video URLs
    const videoUrls = [
      'https://player.vimeo.com/video/1100417251', // Desktop
      'https://player.vimeo.com/video/1100417904', // Mobile
    ];

    // Create invisible iframes to start loading videos immediately
    videoUrls.forEach((url) => {
      const iframe = document.createElement('iframe');
      // Use exact same parameters as actual video component for cache efficiency
      iframe.src = `${url}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&quality=auto&responsive=1`;
      iframe.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        left: -9999px;
        top: -9999px;
        visibility: hidden;
        pointer-events: none;
      `;
      iframe.setAttribute('aria-hidden', 'true');
      iframe.setAttribute('tabindex', '-1');
      iframe.loading = 'eager'; // Force eager loading
      document.body.appendChild(iframe);
      iframesRef.current.push(iframe);
    });

    // Cleanup function
    return () => {
      // Remove preconnect/prefetch links
      if (document.head.contains(preconnectLink)) {
        document.head.removeChild(preconnectLink);
      }
      dnsLinks.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
      if (document.head.contains(preloadScript)) {
        document.head.removeChild(preloadScript);
      }
      
      // Remove preload iframes
      iframesRef.current.forEach(iframe => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      });
      iframesRef.current = [];
    };
  }, [shouldPreload]);

  return { isPreloading: hasPreloadedRef.current };
};