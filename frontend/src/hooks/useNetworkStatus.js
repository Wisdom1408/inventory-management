import { useState, useEffect, useCallback } from 'react';
import Toast from '../components/common/Toast'; // Changed from named to default import

const SPEED_CHECK_INTERVAL = 30000; // 30 seconds
const SPEED_THRESHOLDS = {
  GOOD: 500,
  FAIR: 1000
};

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  // Improved connection quality check
  const checkConnectionSpeed = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      const startTime = performance.now();
      const response = await fetch('/api/health/ping', { 
        method: 'GET',
        cache: 'no-cache'
      });
      const endTime = performance.now();
      
      if (response.ok) {
        const speed = endTime - startTime;
        setConnectionSpeed(speed);
        setLastChecked(new Date());
        
        if (speed > SPEED_THRESHOLDS.FAIR) {
          Toast.warning('Slow internet connection detected');
        }
      }
    } catch (error) {
      console.warn('Connection check failed:', error);
      setConnectionSpeed(null);
    }
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      Toast.success('Connection restored');
      checkConnectionSpeed();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionSpeed(null);
      setLastChecked(null);
      Toast.error('Connection lost');
    };

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnectionSpeed();

    // Periodic checks
    const intervalId = setInterval(checkConnectionSpeed, SPEED_CHECK_INTERVAL);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkConnectionSpeed]);

  return {
    isOnline,
    connectionSpeed,
    lastChecked,
    connectionQuality: getConnectionQuality(connectionSpeed),
    isGoodConnection: connectionSpeed ? connectionSpeed < SPEED_THRESHOLDS.GOOD : null
  };
};

// Helper function to determine connection quality
const getConnectionQuality = (speed) => {
  if (!speed) return null;
  if (speed < SPEED_THRESHOLDS.GOOD) return 'good';
  if (speed < SPEED_THRESHOLDS.FAIR) return 'fair';
  return 'poor';
};

export default useNetworkStatus;