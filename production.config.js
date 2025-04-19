/**
 * E-Pharmacy Application Production Configuration
 * 
 * This file contains production-specific settings and optimizations
 * for the e-Pharmacy application deployment.
 */

module.exports = {
  app: {
    name: "E-Pharmacy",
    version: "1.0.0",
    environment: "production",
    port: process.env.PORT || 5000,
  },
  
  database: {
    // Database configuration is handled via DATABASE_URL environment variable
    maxConnections: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  security: {
    cookieSecure: true,
    sessionMaxAge: 24 * 60 * 60 * 1000, // 24 hours
    csrfProtection: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
  
  ai: {
    // AI prescription generation settings
    usePerplexity: false, // Set to true when PERPLEXITY_API_KEY is available
    fallbackToRules: true, // Use rule-based system when AI is unavailable
  },
  
  optimization: {
    compression: true,
    caching: true,
    minify: true,
  },
  
  logging: {
    level: "info", // 'debug', 'info', 'warn', 'error'
    format: "json",
    storage: "database", // 'database', 'file', 'external'
  },
};