import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-white">Upload Content</h1>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Login Required</h3>
            <p className="text-gray-400 mb-4">You need to login to upload comics and chapters</p>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-white">Upload Content</h1>
      
      <div className="space-y-4">
        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Plus className="h-5 w-5 mr-2" />
              Create New Series
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Start a new comic series. Add title, description, cover image, and genre.
            </p>
            <Button 
              onClick={() => navigate("/create-series")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Create Series
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Tips for Uploading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-300">
              <h4 className="font-semibold mb-1">Series Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Choose a clear, descriptive title</li>
                <li>Write an engaging description</li>
                <li>Upload a high-quality cover image</li>
                <li>Select the most appropriate genre</li>
              </ul>
            </div>
            
            <div className="text-sm text-gray-300">
              <h4 className="font-semibold mb-1">Chapter Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Upload images in order</li>
                <li>Use high-resolution images for best quality</li>
                <li>Number chapters sequentially</li>
                <li>Give each chapter a descriptive title</li>
              </ul>
            </div>

            <div className="text-sm text-gray-300">
              <h4 className="font-semibold mb-1">Supported Formats:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Images: JPG, PNG, WebP</li>
                <li>Recommended size: 1080px width or higher</li>
                <li>File size: Up to 10MB per image</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}