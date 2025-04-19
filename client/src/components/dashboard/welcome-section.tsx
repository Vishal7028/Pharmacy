import { useAuth } from "@/lib/auth";

export function WelcomeSection() {
  const { user } = useAuth();
  
  const firstName = user?.fullName?.split(' ')[0] || 'Guest';
  
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Hello, {firstName}</h1>
      <p className="text-gray-600">How are you feeling today?</p>
    </div>
  );
}
