import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, PillBottle, Stethoscope, Calendar, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type PrescriptionWithMedications } from "@shared/schema";

export function PrescriptionHistory() {
  // Fetch user prescriptions
  const { data: prescriptions, isLoading } = useQuery<PrescriptionWithMedications[]>({
    queryKey: ['/api/prescriptions'],
  });
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Prescription History</h2>
        <Link href="/prescriptions">
          <Button variant="link" className="text-primary-500 hover:text-primary-700 p-0">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="divide-y divide-gray-200">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full mr-3" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <Skeleton className="h-4 w-24 mt-2 sm:mt-0 sm:mr-6" />
                    <Skeleton className="h-4 w-24 mt-2 sm:mt-0" />
                  </div>
                  <Skeleton className="h-4 w-20 mt-2 sm:mt-0" />
                </div>
              </div>
            ))}
          </div>
        ) : prescriptions && prescriptions.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {prescriptions.slice(0, 2).map((prescription) => (
              <li key={prescription.id}>
                <Link href={`/prescriptions/${prescription.id}`}>
                  <div className="block hover:bg-gray-50 cursor-pointer">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-primary-100 rounded-full p-2 mr-3">
                            <PillBottle className="text-primary-600 h-4 w-4" />
                          </div>
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {prescription.diagnosis}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {prescription.isAiGenerated ? (
                              <>
                                <Stethoscope className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                AI Generated
                              </>
                            ) : (
                              <>
                                <UserRound className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                Doctor Prescribed
                              </>
                            )}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <PillBottle className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {prescription.medications.length} medications
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>{formatDate(prescription.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-6 text-center text-gray-500">
            <PillBottle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p>No prescription history found.</p>
            <p className="text-sm">Use the symptom checker to generate your first prescription.</p>
          </div>
        )}
      </div>
    </div>
  );
}
