import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full px-4 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
            <ShieldX className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          You don't have permission to access this page. Please contact your system administrator.
        </p>
        
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        
        <Button 
          onClick={() => navigate('/carrier-management')} 
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
