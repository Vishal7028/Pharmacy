import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PrescriptionCard } from "@/components/dashboard/prescription-card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { type PrescriptionWithMedications } from "@shared/schema";

export default function Prescriptions() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  // Fetch user prescriptions
  const { data: prescriptions, isLoading } = useQuery<PrescriptionWithMedications[]>({
    queryKey: ['/api/prescriptions'],
    enabled: !!user, // Only fetch if user is logged in
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null; // Will redirect to login

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Prescriptions</h1>

          {isLoading ? (
            // Loading state
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : prescriptions && prescriptions.length > 0 ? (
            // Display prescriptions
            <div className="space-y-6">
              {prescriptions.map((prescription) => (
                <PrescriptionCard 
                  key={prescription.id}
                  prescription={prescription}
                />
              ))}
            </div>
          ) : (
            // Empty state
            <Card>
              <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
                <p className="text-gray-500 max-w-md">
                  You haven't generated any prescriptions yet. Go to the dashboard and use the symptom checker to get AI-powered prescription recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
