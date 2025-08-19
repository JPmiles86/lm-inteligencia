// Video preloader hook for Vimeo videos

import { useEffect } from 'react';

// Type for Network Information API
interface NetworkInformation extends EventTarget {
  saveData: boolean;
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export const useVideoPreloader = () => {
  useEffect(() => {
    // Preconnect to Vimeo
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = 'https://player.vimeo.com';
    document.head.appendChild(preconnectLink);

    // DNS prefetch for Vimeo domains
    const dnsPrefetchLink = document.createElement('link');
    dnsPrefetchLink.rel = 'dns-prefetch';
    dnsPrefetchLink.href = 'https://vimeo.com';
    document.head.appendChild(dnsPrefetchLink);

    // Preload Vimeo player script
    const preloadScript = document.createElement('link');
    preloadScript.rel = 'preload';
    preloadScript.as = 'script';
    preloadScript.href = 'https://player.vimeo.com/api/player.js';
    document.head.appendChild(preloadScript);

    // Desktop and mobile video URLs for all industries (currently the same)
    const videoUrls = [
      'https://player.vimeo.com/video/1100417251', // Desktop
      'https://player.vimeo.com/video/1100417904', // Mobile
    ];

    // Create invisible iframes to start loading videos
    const iframes: HTMLIFrameElement[] = [];
    
    // Only preload if we're not on a slow connection
    if ('connection' in navigator && (navigator as NavigatorWithConnection).connection) {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection && (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
        return; // Skip preloading on slow connections
      }
    }

    // Start preloading immediately - videos will be needed soon
    const timeoutId = setTimeout(() => {
      videoUrls.forEach((url) => {
        const iframe = document.createElement('iframe');
        // Use same parameters as actual video component for cache efficiency
        iframe.src = `${url}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&quality=auto&responsive=1`;
        iframe.style.position = 'absolute';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.visibility = 'hidden';
        iframe.setAttribute('aria-hidden', 'true');
        iframe.setAttribute('tabindex', '-1');
        document.body.appendChild(iframe);
        iframes.push(iframe);
      });
    }, 100); // Start preloading almost immediately

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      
      if (document.head.contains(preconnectLink)) {
        document.head.removeChild(preconnectLink);
      }
      if (document.head.contains(dnsPrefetchLink)) {
        document.head.removeChild(dnsPrefetchLink);
      }
      if (document.head.contains(preloadScript)) {
        document.head.removeChild(preloadScript);
      }
      
      // Remove preload iframes
      iframes.forEach(iframe => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      });
    };
  }, []);
};