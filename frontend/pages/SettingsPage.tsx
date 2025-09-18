import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, BookOpen, Info } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      
      {user ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Username</label>
              <p className="text-white">{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Email</label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Display Name</label>
              <p className="text-white">{user.displayName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Account Status</label>
              <div className="mt-1">
                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Not Logged In</h3>
            <p className="text-gray-400 mb-4">Login to access your profile and settings</p>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Info className="h-5 w-5 mr-2" />
            About ComicHub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-300 text-sm">
            ComicHub is a free platform for reading and sharing comics, manga, manhwa, manhua, and webtoons.
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Version</span>
              <span className="text-gray-300 text-sm">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Platform</span>
              <span className="text-gray-300 text-sm">Web App</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h4 className="font-semibold mb-2 text-white">Features</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Browse comics by genre</li>
              <li>• Search and discover new series</li>
              <li>• Upload your own comics</li>
              <li>• Read with optimized viewer</li>
              <li>• Comment and review series</li>
              <li>• Track your reading progress</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}