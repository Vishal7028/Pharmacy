import { db } from "../db";
import { medications, symptoms, type Medication, type Symptom } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Checks if the database has been seeded with initial data
 */
export async function checkDatabaseSeeding(): Promise<{
  medicationCount: number;
  symptomCount: number;
}> {
  const medicationCount = await db.select({ count: sql`count(*)` }).from(medications);
  const symptomCount = await db.select({ count: sql`count(*)` }).from(symptoms);
  
  return {
    medicationCount: parseInt(medicationCount[0].count as string, 10),
    symptomCount: parseInt(symptomCount[0].count as string, 10)
  };
}

/**
 * Verifies database connection and table structures
 */
export async function verifyDatabaseStructure(): Promise<boolean> {
  try {
    // Test query to check database connectivity
    await db.select().from(medications).limit(1);
    await db.select().from(symptoms).limit(1);
    return true;
  } catch (error) {
    console.error("Database structure verification failed:", error);
    return false;
  }
}

/**
 * Performs any necessary cleanup operations for deployment
 */
export async function prepareForDeployment(): Promise<{ 
  success: boolean; 
  message: string;
  stats: {
    medications: number;
    symptoms: number;
  }
}> {
  try {
    // Verify database
    const dbVerified = await verifyDatabaseStructure();
    if (!dbVerified) {
      return { 
        success: false, 
        message: "Database structure verification failed",
        stats: { medications: 0, symptoms: 0 }
      };
    }
    
    // Check seeding
    const { medicationCount, symptomCount } = await checkDatabaseSeeding();
    
    return {
      success: true,
      message: "Application is ready for deployment",
      stats: {
        medications: medicationCount,
        symptoms: symptomCount
      }
    };
  } catch (error) {
    console.error("Deployment preparation failed:", error);
    return { 
      success: false, 
      message: `Deployment preparation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      stats: { medications: 0, symptoms: 0 }
    };
  }
}