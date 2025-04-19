/**
 * Configuration loader for the e-Pharmacy application
 */

let config: any;

/**
 * Loads the appropriate configuration based on NODE_ENV
 */
export function loadConfig(): any {
  if (config) return config;
  
  try {
    // Load production config if in production mode
    if (process.env.NODE_ENV === 'production') {
      config = require('../production.config.js');
    } else {
      // Default development config
      config = {
        app: {
          name: "E-Pharmacy (Development)",
          version: "1.0.0",
          environment: "development",
          port: process.env.PORT || 5000,
        },
        
        database: {
          maxConnections: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
        
        security: {
          cookieSecure: false,
          sessionMaxAge: 24 * 60 * 60 * 1000, // 24 hours
          csrfProtection: false,
        },
        
        ai: {
          usePerplexity: false,
          fallbackToRules: true,
        },
        
        optimization: {
          compression: false,
          caching: false,
          minify: false,
        },
        
        logging: {
          level: "debug",
          format: "text",
          storage: "console",
        },
      };
    }
    
    return config;
  } catch (error) {
    console.error("Error loading configuration:", error);
    throw error;
  }
}

/**
 * Gets the current configuration
 */
export function getConfig(): any {
  if (!config) {
    return loadConfig();
  }
  return config;
}