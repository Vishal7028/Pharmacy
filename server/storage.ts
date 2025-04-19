import { 
  users, type User, type InsertUser, 
  symptoms, type Symptom, type InsertSymptom,
  medications, type Medication, type InsertMedication,
  prescriptions, type Prescription, type InsertPrescription,
  prescriptionMedications, type PrescriptionMedication, type InsertPrescriptionMedication,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  type LoginCredentials, type PrescriptionWithMedications,
  type SymptomCheckerData
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  verifyEmail(token: string): Promise<boolean>;
  setVerificationToken(userId: number, token: string, expires: Date): Promise<boolean>;
  setResetToken(userId: number, token: string, expires: Date): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  // Symptom methods
  getSymptoms(): Promise<Symptom[]>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;

  // Medication methods
  getMedications(): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;

  // Prescription methods
  getPrescription(id: number): Promise<Prescription | undefined>;
  getUserPrescriptions(userId: number): Promise<PrescriptionWithMedications[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  generateAIPrescription(userId: number, symptoms: SymptomCheckerData): Promise<PrescriptionWithMedications>;

  // Prescription medication methods
  addMedicationToPrescription(prescriptionMedication: InsertPrescriptionMedication): Promise<PrescriptionMedication>;
  getPrescriptionMedications(prescriptionId: number): Promise<(PrescriptionMedication & { medication: Medication })[]>;

  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;

  // Order item methods
  addItemToOrder(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<(OrderItem & { medication: Medication })[]>;

  // Auth methods
  validateCredentials(credentials: LoginCredentials): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private symptoms: Map<number, Symptom>;
  private medications: Map<number, Medication>;
  private prescriptions: Map<number, Prescription>;
  private prescriptionMedications: Map<number, PrescriptionMedication>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;

  private userId: number;
  private symptomId: number;
  private medicationId: number;
  private prescriptionId: number;
  private prescriptionMedicationId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.symptoms = new Map();
    this.medications = new Map();
    this.prescriptions = new Map();
    this.prescriptionMedications = new Map();
    this.orders = new Map();
    this.orderItems = new Map();

    this.userId = 1;
    this.symptomId = 1;
    this.medicationId = 1;
    this.prescriptionId = 1;
    this.prescriptionMedicationId = 1;
    this.orderId = 1;
    this.orderItemId = 1;

    // Initialize with some medication data
    this.initializeMedications();
    this.initializeSymptoms();
  }

  private initializeSymptoms(): void {
    const commonSymptoms = [
      "Headache",
      "Fever",
      "Cough",
      "Sore throat",
      "Body ache",
      "Fatigue",
      "Nausea",
      "Runny nose",
      "Sneezing",
      "Congestion",
      "Dizziness",
      "Vomiting",
      "Diarrhea"
    ];

    commonSymptoms.forEach(name => {
      const symptom: Symptom = {
        id: this.symptomId++,
        name
      };
      this.symptoms.set(symptom.id, symptom);
    });
  }

  private initializeMedications(): void {
    const commonMedications = [
      {
        name: "Acetaminophen 500mg",
        description: "Pain reliever and fever reducer",
        dosage: "Take 1 tablet every 6 hours as needed for fever or pain",
        price: 799, // $7.99
        stock: 100
      },
      {
        name: "Phenylephrine Nasal Spray",
        description: "Nasal decongestant",
        dosage: "Use 1-2 sprays in each nostril every 4 hours as needed for congestion",
        price: 1299, // $12.99
        stock: 50
      },
      {
        name: "Ibuprofen 200mg",
        description: "NSAID pain reliever and anti-inflammatory",
        dosage: "Take 1-2 tablets every 4-6 hours as needed for pain or inflammation",
        price: 899, // $8.99
        stock: 75
      },
      {
        name: "Loratadine 10mg",
        description: "Non-drowsy antihistamine for allergy relief",
        dosage: "Take 1 tablet daily for allergy symptoms",
        price: 1499, // $14.99
        stock: 60
      },
      {
        name: "Dextromethorphan Cough Syrup",
        description: "Cough suppressant",
        dosage: "Take 1-2 teaspoons every 4 hours as needed for cough",
        price: 1099, // $10.99
        stock: 40
      }
    ];

    commonMedications.forEach(med => {
      const medication: Medication = {
        id: this.medicationId++,
        ...med
      };
      this.medications.set(medication.id, medication);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token && user.verificationExpires && user.verificationExpires > new Date()
    );
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetPasswordToken === token && user.resetPasswordExpires && user.resetPasswordExpires > new Date()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const newUser: User = { 
      ...user, 
      id, 
      createdAt, 
      isAdmin: false,
      isVerified: false,
      verificationToken: null,
      verificationExpires: null,
      resetPasswordToken: null,
      resetPasswordExpires: null
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.getUserByVerificationToken(token);
    if (!user) return false;
    
    const updatedUser = { 
      ...user, 
      isVerified: true, 
      verificationToken: null, 
      verificationExpires: null 
    };
    
    this.users.set(user.id, updatedUser);
    return true;
  }
  
  async setVerificationToken(userId: number, token: string, expires: Date): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    const updatedUser = { 
      ...user, 
      verificationToken: token, 
      verificationExpires: expires 
    };
    
    this.users.set(userId, updatedUser);
    return true;
  }
  
  async setResetToken(userId: number, token: string, expires: Date): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    const updatedUser = { 
      ...user, 
      resetPasswordToken: token, 
      resetPasswordExpires: expires 
    };
    
    this.users.set(userId, updatedUser);
    return true;
  }
  
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByResetToken(token);
    if (!user) return false;
    
    const updatedUser = { 
      ...user, 
      password: newPassword, 
      resetPasswordToken: null, 
      resetPasswordExpires: null 
    };
    
    this.users.set(user.id, updatedUser);
    return true;
  }

  // Symptom methods
  async getSymptoms(): Promise<Symptom[]> {
    return Array.from(this.symptoms.values());
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const id = this.symptomId++;
    const newSymptom: Symptom = { ...symptom, id };
    this.symptoms.set(id, newSymptom);
    return newSymptom;
  }

  // Medication methods
  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const id = this.medicationId++;
    // Ensure stock is set to default 100 if not provided
    const stock = medication.stock !== undefined ? medication.stock : 100;
    const newMedication: Medication = { ...medication, id, stock };
    this.medications.set(id, newMedication);
    return newMedication;
  }

  // Prescription methods
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async getUserPrescriptions(userId: number): Promise<PrescriptionWithMedications[]> {
    const userPrescriptions = Array.from(this.prescriptions.values())
      .filter(prescription => prescription.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const prescriptionsWithMedications: PrescriptionWithMedications[] = [];

    for (const prescription of userPrescriptions) {
      const medications = await this.getPrescriptionMedications(prescription.id);
      prescriptionsWithMedications.push({
        ...prescription,
        medications
      });
    }

    return prescriptionsWithMedications;
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const id = this.prescriptionId++;
    const createdAt = new Date();
    // Set default values if not provided
    const status = prescription.status || 'active';
    const isAiGenerated = prescription.isAiGenerated !== undefined ? prescription.isAiGenerated : true;
    const newPrescription: Prescription = { 
      ...prescription, 
      id, 
      createdAt, 
      status,
      isAiGenerated 
    };
    this.prescriptions.set(id, newPrescription);
    return newPrescription;
  }

  async generateAIPrescription(userId: number, symptomData: SymptomCheckerData): Promise<PrescriptionWithMedications> {
    // Simple AI logic to generate a prescription based on symptoms
    let diagnosis = "";
    let recommendations: string[] = [];
    let recommendedMedications: { medication: Medication, instructions: string, quantity: number }[] = [];

    // Logic based on main symptom
    switch (symptomData.mainSymptom) {
      case "Headache":
        diagnosis = "Tension headache";
        recommendations = [
          "Rest in a quiet, dark room",
          "Apply cold or warm compress to the forehead",
          "Stay hydrated"
        ];
        recommendedMedications.push({
          medication: Array.from(this.medications.values()).find(m => m.name.includes("Acetaminophen")) as Medication,
          instructions: "Take 1 tablet every 6 hours as needed for pain",
          quantity: 1
        });
        break;
      case "Fever":
        diagnosis = "Viral fever";
        recommendations = [
          "Rest and stay hydrated",
          "Use a light blanket if chills occur",
          "Take lukewarm baths to reduce fever"
        ];
        recommendedMedications.push({
          medication: Array.from(this.medications.values()).find(m => m.name.includes("Acetaminophen")) as Medication,
          instructions: "Take 1 tablet every 4-6 hours as needed for fever",
          quantity: 1
        });
        break;
      case "Cough":
        diagnosis = "Acute bronchitis";
        recommendations = [
          "Stay hydrated",
          "Use a humidifier",
          "Avoid irritants like smoke"
        ];
        recommendedMedications.push({
          medication: Array.from(this.medications.values()).find(m => m.name.includes("Dextromethorphan")) as Medication,
          instructions: "Take 1-2 teaspoons every 4 hours as needed for cough",
          quantity: 1
        });
        break;
      case "Sore throat":
        diagnosis = "Pharyngitis";
        recommendations = [
          "Gargle with warm salt water",
          "Stay hydrated",
          "Rest your voice"
        ];
        recommendedMedications.push({
          medication: Array.from(this.medications.values()).find(m => m.name.includes("Ibuprofen")) as Medication,
          instructions: "Take 1 tablet every 6-8 hours with food as needed for pain",
          quantity: 1
        });
        break;
      case "Runny nose":
      case "Sneezing":
        diagnosis = "Allergic rhinitis";
        recommendations = [
          "Avoid allergens when possible",
          "Use a nasal saline spray",
          "Keep indoor air clean"
        ];
        recommendedMedications.push({
          medication: Array.from(this.medications.values()).find(m => m.name.includes("Loratadine")) as Medication,
          instructions: "Take 1 tablet daily for allergy symptoms",
          quantity: 1
        });
        break;
      case "Congestion":
        diagnosis = "Nasal congestion";
        recommendations = [
          "Use a humidifier",
          "Stay hydrated",
          "Apply a warm compress to your face"
        ];
        recommendedMedications.push({
          medication: Array.from(this.medications.values()).find(m => m.name.includes("Phenylephrine")) as Medication,
          instructions: "Use 1-2 sprays in each nostril every 4 hours as needed for congestion",
          quantity: 1
        });
        break;
      default:
        diagnosis = "Common cold";
        recommendations = [
          "Rest and stay hydrated",
          "Use a humidifier if available",
          "Gargle with warm salt water for sore throat relief"
        ];
        recommendedMedications.push({
          medication: Array.from(this.medications.values()).find(m => m.name.includes("Acetaminophen")) as Medication,
          instructions: "Take 1 tablet every 6 hours as needed for fever or pain",
          quantity: 1
        });
        recommendedMedications.push({
          medication: Array.from(this.medications.values()).find(m => m.name.includes("Phenylephrine")) as Medication,
          instructions: "Use 1-2 sprays in each nostril every 4 hours as needed for congestion",
          quantity: 1
        });
    }

    // Add duration to diagnosis
    const durationMap: Record<string, string> = {
      "Less than 24 hours": "acute",
      "1-3 days": "short-term",
      "4-7 days": "persistent",
      "1-2 weeks": "prolonged",
      "More than 2 weeks": "chronic"
    };
    
    const durationDesc = durationMap[symptomData.duration] || "";
    if (durationDesc) {
      diagnosis = `${durationDesc} ${diagnosis}`;
    }

    // Adjust based on severity
    if (symptomData.severity >= 8) {
      diagnosis = `Severe ${diagnosis}`;
      recommendations.push("Consider consulting with a healthcare provider if symptoms worsen");
    } else if (symptomData.severity <= 3) {
      diagnosis = `Mild ${diagnosis}`;
    }

    // Additional symptoms considerations
    if (symptomData.additionalSymptoms && symptomData.additionalSymptoms.length > 0) {
      diagnosis += " with ";
      if (symptomData.additionalSymptoms.includes("Runny nose") || 
          symptomData.additionalSymptoms.includes("Congestion")) {
        diagnosis += "nasal congestion";
      }
      if (symptomData.additionalSymptoms.includes("Fatigue")) {
        recommendations.push("Get plenty of rest and limit activities");
      }
    }

    // Create the prescription
    const prescriptionData: InsertPrescription = {
      userId,
      diagnosis,
      additionalRecommendations: recommendations.join(". ") + ".",
      isAiGenerated: true,
      status: "active"
    };

    const prescription = await this.createPrescription(prescriptionData);

    // Add medications to the prescription
    const prescriptionMeds: (PrescriptionMedication & { medication: Medication })[] = [];

    for (const recMed of recommendedMedications) {
      const prescMed: InsertPrescriptionMedication = {
        prescriptionId: prescription.id,
        medicationId: recMed.medication.id,
        instructions: recMed.instructions,
        quantity: recMed.quantity
      };

      const addedPrescMed = await this.addMedicationToPrescription(prescMed);
      prescriptionMeds.push({
        ...addedPrescMed,
        medication: recMed.medication
      });
    }

    return {
      ...prescription,
      medications: prescriptionMeds
    };
  }

  // Prescription medication methods
  async addMedicationToPrescription(prescriptionMedication: InsertPrescriptionMedication): Promise<PrescriptionMedication> {
    const id = this.prescriptionMedicationId++;
    const newPrescriptionMedication: PrescriptionMedication = { ...prescriptionMedication, id };
    this.prescriptionMedications.set(id, newPrescriptionMedication);
    return newPrescriptionMedication;
  }

  async getPrescriptionMedications(prescriptionId: number): Promise<(PrescriptionMedication & { medication: Medication })[]> {
    const prescriptionMeds = Array.from(this.prescriptionMedications.values())
      .filter(pm => pm.prescriptionId === prescriptionId);

    return Promise.all(prescriptionMeds.map(async pm => {
      const medication = await this.getMedication(pm.medicationId);
      return {
        ...pm,
        medication: medication!
      };
    }));
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const createdAt = new Date();
    const status = order.status || 'pending';
    const prescriptionId = order.prescriptionId !== undefined ? order.prescriptionId : null;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt, 
      status,
      prescriptionId
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  // Order item methods
  async addItemToOrder(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  async getOrderItems(orderId: number): Promise<(OrderItem & { medication: Medication })[]> {
    const orderItems = Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);

    return Promise.all(orderItems.map(async item => {
      const medication = await this.getMedication(item.medicationId);
      return {
        ...item,
        medication: medication!
      };
    }));
  }

  // Auth methods
  async validateCredentials(credentials: LoginCredentials): Promise<User | undefined> {
    const user = await this.getUserByUsername(credentials.username);
    if (user && user.password === credentials.password) {
      return user;
    }
    return undefined;
  }
}

// Database storage implementation
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({ ...user, isAdmin: false })
      .returning();
    return newUser;
  }

  async getSymptoms(): Promise<Symptom[]> {
    return db.select().from(symptoms);
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const [newSymptom] = await db
      .insert(symptoms)
      .values(symptom)
      .returning();
    return newSymptom;
  }

  async getMedications(): Promise<Medication[]> {
    return db.select().from(medications);
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    const [medication] = await db.select().from(medications).where(eq(medications.id, id));
    return medication;
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db
      .insert(medications)
      .values(medication)
      .returning();
    return newMedication;
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    return prescription;
  }

  async getUserPrescriptions(userId: number): Promise<PrescriptionWithMedications[]> {
    const userPrescriptions = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId))
      .orderBy(desc(prescriptions.createdAt));
    
    // Get medications for each prescription
    const prescriptionsWithMedications: PrescriptionWithMedications[] = [];
    
    for (const prescription of userPrescriptions) {
      const prescriptionMeds = await this.getPrescriptionMedications(prescription.id);
      prescriptionsWithMedications.push({
        ...prescription,
        medications: prescriptionMeds
      });
    }
    
    return prescriptionsWithMedications;
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const [newPrescription] = await db
      .insert(prescriptions)
      .values(prescription)
      .returning();
    return newPrescription;
  }

  async generateAIPrescription(userId: number, symptomData: SymptomCheckerData): Promise<PrescriptionWithMedications> {
    // This functionality could be enhanced with an actual AI/ML model or external API
    // For now, we'll use a rule-based approach to generate prescriptions
    
    // Generate a basic diagnosis based on the symptoms
    let diagnosis = "";
    let recommendedMedications: { medication: Medication, instructions: string, quantity: number }[] = [];
    let recommendations = "";
    
    const allMeds = await this.getMedications();
    
    // Simplified rule-based diagnosis logic
    if (symptomData.mainSymptom.includes("Headache")) {
      diagnosis = "Tension Headache";
      
      // Find pain relievers in our medication database
      const painRelievers = allMeds.filter(med => 
        med.name.includes("Paracetamol") || 
        med.name.includes("Ibuprofen")
      );
      
      if (painRelievers.length > 0) {
        recommendedMedications.push({
          medication: painRelievers[0],
          instructions: "Take 1 tablet every 6 hours as needed for pain",
          quantity: 20
        });
      }
      
      recommendations = "Rest in a quiet, dark room. Stay hydrated. Apply a cold compress to your forehead. Avoid screens and bright lights";
    } 
    else if (symptomData.mainSymptom.includes("Fever")) {
      diagnosis = "acute Viral fever";
      
      // Find fever reducers
      const feverReducers = allMeds.filter(med => 
        med.name.includes("Paracetamol") || 
        med.name.includes("Ibuprofen")
      );
      
      if (feverReducers.length > 0) {
        recommendedMedications.push({
          medication: feverReducers[0],
          instructions: "Take 1 tablet every 6 hours to reduce fever",
          quantity: 20
        });
      }
      
      // Add vitamin C
      const vitaminC = allMeds.find(med => med.name.includes("Vitamin C"));
      if (vitaminC) {
        recommendedMedications.push({
          medication: vitaminC,
          instructions: "Take 1 tablet daily to support immune function",
          quantity: 30
        });
      }
      
      recommendations = "Rest and stay hydrated. Take lukewarm baths. Use lightweight clothing and bedding. If fever persists for more than 3 days, consult a doctor";
    }
    else if (symptomData.mainSymptom.includes("Cough")) {
      diagnosis = "Upper Respiratory Tract Infection";
      
      // Find cough syrup
      const coughSyrup = allMeds.find(med => med.name.includes("Cough"));
      if (coughSyrup) {
        recommendedMedications.push({
          medication: coughSyrup,
          instructions: "Take 10ml three times daily",
          quantity: 1
        });
      }
      
      // Find lozenges
      const lozenges = allMeds.find(med => med.name.includes("Lozenge"));
      if (lozenges) {
        recommendedMedications.push({
          medication: lozenges,
          instructions: "Dissolve 1 lozenge in mouth every 2-3 hours as needed",
          quantity: 24
        });
      }
      
      recommendations = "Stay hydrated. Use a humidifier if available. Gargle with salt water. Avoid smoking and irritants";
    }
    else {
      // Default diagnosis for other symptoms
      diagnosis = "General Discomfort";
      
      // Recommend general multivitamin
      const multivitamin = allMeds.find(med => med.name.includes("Multivitamin"));
      if (multivitamin) {
        recommendedMedications.push({
          medication: multivitamin,
          instructions: "Take 1 tablet daily with food",
          quantity: 30
        });
      }
      
      recommendations = "Rest and monitor your symptoms. If symptoms persist or worsen, consult a doctor";
    }
    
    // Add severity information to diagnosis
    if (symptomData.severity >= 8) {
      diagnosis = "Severe " + diagnosis;
      recommendations += ". Due to the severity of your symptoms, consider consulting a doctor soon if symptoms don't improve within 24 hours";
    } else if (symptomData.severity >= 5) {
      diagnosis = "Moderate " + diagnosis;
    } else {
      diagnosis = "Mild " + diagnosis;
    }
    
    // Create the prescription
    const prescriptionData: InsertPrescription = {
      userId,
      diagnosis,
      additionalRecommendations: recommendations,
      status: "active",
      isAiGenerated: true
    };
    
    const newPrescription = await this.createPrescription(prescriptionData);
    
    // Add medications to the prescription
    const prescriptionMeds: (PrescriptionMedication & { medication: Medication })[] = [];
    
    for (const recMed of recommendedMedications) {
      const prescMed: InsertPrescriptionMedication = {
        prescriptionId: newPrescription.id,
        medicationId: recMed.medication.id,
        quantity: recMed.quantity,
        instructions: recMed.instructions
      };
      
      const newPrescMed = await this.addMedicationToPrescription(prescMed);
      prescriptionMeds.push({
        ...newPrescMed,
        medication: recMed.medication
      });
    }
    
    return {
      ...newPrescription,
      medications: prescriptionMeds
    };
  }

  async addMedicationToPrescription(prescriptionMedication: InsertPrescriptionMedication): Promise<PrescriptionMedication> {
    const [newPrescriptionMedication] = await db
      .insert(prescriptionMedications)
      .values(prescriptionMedication)
      .returning();
    return newPrescriptionMedication;
  }

  async getPrescriptionMedications(prescriptionId: number): Promise<(PrescriptionMedication & { medication: Medication })[]> {
    const prescrMeds = await db
      .select()
      .from(prescriptionMedications)
      .where(eq(prescriptionMedications.prescriptionId, prescriptionId));
    
    const medsWithDetails = [];
    
    for (const prescrMed of prescrMeds) {
      const medication = await this.getMedication(prescrMed.medicationId);
      if (medication) {
        medsWithDetails.push({
          ...prescrMed,
          medication
        });
      }
    }
    
    return medsWithDetails;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async addItemToOrder(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return newOrderItem;
  }

  async getOrderItems(orderId: number): Promise<(OrderItem & { medication: Medication })[]> {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
    
    const itemsWithDetails = [];
    
    for (const item of items) {
      const medication = await this.getMedication(item.medicationId);
      if (medication) {
        itemsWithDetails.push({
          ...item,
          medication
        });
      }
    }
    
    return itemsWithDetails;
  }

  async validateCredentials(credentials: LoginCredentials): Promise<User | undefined> {
    const user = await this.getUserByUsername(credentials.username);
    
    if (user && user.password === credentials.password) {
      return user;
    }
    
    return undefined;
  }
}

// Use the database storage instead of memory storage
export const storage = new DatabaseStorage();
