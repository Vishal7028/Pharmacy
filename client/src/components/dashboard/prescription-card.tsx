import { CheckCircle, Download, Share2, CalendarPlus, ShoppingCart } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type PrescriptionWithMedications } from "@shared/schema";

interface PrescriptionCardProps {
  prescription: PrescriptionWithMedications;
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  const { toast } = useToast();
  
  // Format date
  const formattedDate = new Date(prescription.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  
  // Parse recommendations from string to array
  const recommendations = prescription.additionalRecommendations.split(". ").filter(Boolean);
  
  // Create order mutation
  const createOrder = useMutation({
    mutationFn: async () => {
      // Calculate total price
      const total = prescription.medications.reduce(
        (sum, med) => sum + med.medication.price * med.quantity,
        0
      );
      
      // Create payload
      const orderData = {
        userId: prescription.userId,
        prescriptionId: prescription.id,
        total,
        items: prescription.medications.map(med => ({
          medicationId: med.medication.id,
          quantity: med.quantity,
          price: med.medication.price,
        })),
      };
      
      const res = await apiRequest("POST", "/api/orders", orderData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order created",
        description: "Your medications have been ordered successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating order",
        description: error instanceof Error ? error.message : "Please try again",
      });
    },
  });
  
  return (
    <Card className="mb-8">
      <CardHeader className="border-b border-gray-200 bg-secondary-50 flex justify-between items-center">
        <div>
          <Badge variant="success" className="mb-1 flex items-center w-fit">
            <CheckCircle className="mr-1 h-3 w-3" />
            AI Generated
          </Badge>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
        <div className="flex">
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4 text-secondary-500" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4 text-secondary-500" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5">
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-900 mb-1">Diagnosis</h3>
          <p className="text-gray-600">{prescription.diagnosis}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-900 mb-2">Recommended Medications</h3>
          {prescription.medications.map((med) => (
            <div key={med.id} className="border border-gray-200 rounded-md p-3 mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{med.medication.name}</h4>
                  <p className="text-sm text-gray-500">{med.instructions}</p>
                </div>
                <Button 
                  variant="outline"
                  className="bg-primary-100 text-primary-600 hover:bg-primary-200 border-primary-100"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-900 mb-1">Additional Recommendations</h3>
          <ul className="list-disc pl-5 text-gray-600">
            {recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" className="flex items-center">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Schedule Doctor Visit
        </Button>
        <Button 
          variant="default" 
          className="bg-secondary-500 hover:bg-secondary-600 flex items-center"
          onClick={() => createOrder.mutate()}
          disabled={createOrder.isPending}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {createOrder.isPending ? "Processing..." : "Order All Medications"}
        </Button>
      </CardFooter>
    </Card>
  );
}
