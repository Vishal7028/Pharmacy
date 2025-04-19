import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { SymptomChecker } from "@/components/dashboard/symptom-checker";
import { PrescriptionCard } from "@/components/dashboard/prescription-card";
import { PrescriptionHistory } from "@/components/dashboard/prescription-history";
import { type PrescriptionWithMedications } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  // Fetch user prescriptions to display the most recent one
  const { data: prescriptions } = useQuery<PrescriptionWithMedications[]>({
    queryKey: ['/api/prescriptions'],
    enabled: !!user, // Only fetch if user is logged in
  });
  
  // Get the most recent prescription
  const mostRecentPrescription = prescriptions && prescriptions.length > 0 
    ? prescriptions[0] 
    : null;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null; // Will redirect to login

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WelcomeSection />
          <SymptomChecker />
          
          {mostRecentPrescription && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent AI Prescription</h2>
              <PrescriptionCard prescription={mostRecentPrescription} />
            </div>
          )}
          
          <PrescriptionHistory />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
