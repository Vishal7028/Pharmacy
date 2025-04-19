import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type Medication } from "@shared/schema";

export default function Medicines() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  // Fetch medications
  const { data: medications, isLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
    enabled: !!user, // Only fetch if user is logged in
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null; // Will redirect to login

  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search medicines..." className="pl-8" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="h-40 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications?.map((medication) => (
                <Card key={medication.id} className="overflow-hidden flex flex-col h-full">
                  <div className="bg-gray-100 h-48 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-full shadow-sm">
                      <ShoppingCart className="h-12 w-12 text-primary-400" />
                    </div>
                  </div>
                  <CardContent className="pt-6 flex-grow">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{medication.name}</h2>
                    <p className="text-gray-600 mb-4">{medication.description}</p>
                    <p className="text-sm text-gray-500 italic">{medication.dosage}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center border-t">
                    <p className="font-semibold text-lg">{formatPrice(medication.price)}</p>
                    <Button className="bg-primary-100 text-primary-600 hover:bg-primary-200 border-primary-100">
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
