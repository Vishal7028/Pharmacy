import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  symptomCheckerSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import session from 'express-session';
import MemoryStore from 'memorystore';
import { prepareForDeployment } from "./services/deployment";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create memory store for sessions
  const SessionStore = MemoryStore(session);
  
  // Configure sessions
  app.use(session({
    secret: process.env.SESSION_SECRET || 'e-pharmacy-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // Cleanup expired sessions (24h)
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Middleware for checking authentication
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized: Please login to continue' });
    }
    next();
  };

  // AUTH ROUTES
  
  // Register a new user
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Set session
      req.session.userId = newUser.id;
      
      // Return user info (omit password)
      const { password, ...userResponse } = newUser;
      res.status(201).json(userResponse);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid user data' });
    }
  });
  
  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.validateCredentials(credentials);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user info (omit password)
      const { password, ...userResponse } = user;
      res.status(200).json(userResponse);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid login data' });
    }
  });
  
  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user
  app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) {
      return res.status(200).json(null);
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(200).json(null);
    }
    
    // Return user info (omit password)
    const { password, ...userResponse } = user;
    res.status(200).json(userResponse);
  });
  
  // USER ROUTES
  
  // Get user by ID
  app.get('/api/users/:id', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow users to view their own profile (or admins)
      if (req.session.userId !== userId) {
        const currentUser = await storage.getUser(req.session.userId!);
        if (!currentUser?.isAdmin) {
          return res.status(403).json({ message: 'Forbidden: You cannot access this user' });
        }
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user info (omit password)
      const { password, ...userResponse } = user;
      res.status(200).json(userResponse);
    } catch (error) {
      res.status(400).json({ message: 'Invalid user ID' });
    }
  });
  
  // SYMPTOM ROUTES
  
  // Get all symptoms
  app.get('/api/symptoms', async (req, res) => {
    const symptoms = await storage.getSymptoms();
    res.status(200).json(symptoms);
  });
  
  // MEDICATION ROUTES
  
  // Get all medications
  app.get('/api/medications', async (req, res) => {
    const medications = await storage.getMedications();
    res.status(200).json(medications);
  });
  
  // Get medication by ID
  app.get('/api/medications/:id', async (req, res) => {
    try {
      const medicationId = parseInt(req.params.id);
      const medication = await storage.getMedication(medicationId);
      
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      res.status(200).json(medication);
    } catch (error) {
      res.status(400).json({ message: 'Invalid medication ID' });
    }
  });
  
  // PRESCRIPTION ROUTES
  
  // Get user prescriptions
  app.get('/api/prescriptions', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const prescriptions = await storage.getUserPrescriptions(userId);
      res.status(200).json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching prescriptions' });
    }
  });
  
  // Get prescription by ID
  app.get('/api/prescriptions/:id', requireAuth, async (req, res) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      const prescription = await storage.getPrescription(prescriptionId);
      
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
      
      // Only allow users to view their own prescriptions (or admins)
      if (prescription.userId !== req.session.userId) {
        const currentUser = await storage.getUser(req.session.userId!);
        if (!currentUser?.isAdmin) {
          return res.status(403).json({ message: 'Forbidden: You cannot access this prescription' });
        }
      }
      
      const medications = await storage.getPrescriptionMedications(prescriptionId);
      
      res.status(200).json({
        ...prescription,
        medications
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid prescription ID' });
    }
  });
  
  // Generate AI prescription
  app.post('/api/prescriptions/generate', requireAuth, async (req, res) => {
    try {
      const symptomsData = symptomCheckerSchema.parse(req.body);
      const userId = req.session.userId!;
      
      const prescription = await storage.generateAIPrescription(userId, symptomsData);
      
      res.status(201).json(prescription);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid symptom data' });
    }
  });
  
  // ORDER ROUTES
  
  // Create a new order
  app.post('/api/orders', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId
      });
      
      const newOrder = await storage.createOrder(orderData);
      
      // Add items to the order
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const orderItemData = insertOrderItemSchema.parse({
            ...item,
            orderId: newOrder.id
          });
          
          await storage.addItemToOrder(orderItemData);
        }
      }
      
      const orderWithItems = {
        ...newOrder,
        items: await storage.getOrderItems(newOrder.id)
      };
      
      res.status(201).json(orderWithItems);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid order data' });
    }
  });
  
  // Get user orders
  app.get('/api/orders', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const orders = await storage.getUserOrders(userId);
      
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        return {
          ...order,
          items
        };
      }));
      
      res.status(200).json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
    }
  });
  
  // Get order by ID
  app.get('/api/orders/:id', requireAuth, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Only allow users to view their own orders (or admins)
      if (order.userId !== req.session.userId) {
        const currentUser = await storage.getUser(req.session.userId!);
        if (!currentUser?.isAdmin) {
          return res.status(403).json({ message: 'Forbidden: You cannot access this order' });
        }
      }
      
      const items = await storage.getOrderItems(orderId);
      
      res.status(200).json({
        ...order,
        items
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid order ID' });
    }
  });

  // DEPLOYMENT AND SYSTEM ROUTES
  
  // Check deployment readiness
  app.get('/api/system/deployment-check', async (req, res) => {
    try {
      const deploymentStatus = await prepareForDeployment();
      res.status(200).json(deploymentStatus);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Deployment check failed',
        stats: { medications: 0, symptoms: 0 }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
