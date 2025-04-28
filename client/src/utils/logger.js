/**
 * Client-side logger utility
 */
const logger = {
    info: (message, data) => {
      if (process.env.NODE_ENV !== 'production') {
        if (data) {
          console.info(`[INFO] ${message}`, data);
        } else {
          console.info(`[INFO] ${message}`);
        }
      }
    },
    
    error: (message, error) => {
      if (process.env.NODE_ENV !== 'production') {
        if (error) {
          console.error(`[ERROR] ${message}`, error);
        } else {
          console.error(`[ERROR] ${message}`);
        }
      }
      
      // In production, you might want to send errors to a monitoring service
      if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_ERROR_TRACKING_ENABLED) {
        // Example: Send to error tracking service 
        // errorTrackingService.captureError(message, error);
      }
    },
    
    warn: (message, data) => {
      if (process.env.NODE_ENV !== 'production') {
        if (data) {
          console.warn(`[WARN] ${message}`, data);
        } else {
          console.warn(`[WARN] ${message}`);
        }
      }
    },
    
    debug: (message, data) => {
      if (process.env.NODE_ENV === 'development') {
        if (data) {
          console.debug(`[DEBUG] ${message}`, data);
        } else {
          console.debug(`[DEBUG] ${message}`);
        }
      }
    }
  };
  
  export default logger;  