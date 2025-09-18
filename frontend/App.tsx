import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { BottomNavigation } from "./components/BottomNavigation";
import { HomePage } from "./pages/HomePage";
import { GenresPage } from "./pages/GenresPage";
import { SearchPage } from "./pages/SearchPage";
import { UploadPage } from "./pages/UploadPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SeriesPage } from "./pages/SeriesPage";
import { ChapterPage } from "./pages/ChapterPage";
import { CreateSeriesPage } from "./pages/CreateSeriesPage";
import { CreateChapterPage } from "./pages/CreateChapterPage";
import { LoginPage } from "./pages/LoginPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="dark min-h-screen bg-black text-white">
            <main className="pb-20 min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/genres" element={<GenresPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/series/:id" element={<SeriesPage />} />
                <Route path="/chapter/:id" element={<ChapterPage />} />
                <Route path="/create-series" element={<CreateSeriesPage />} />
                <Route path="/create-chapter/:seriesId" element={<CreateChapterPage />} />
              </Routes>
            </main>
            <BottomNavigation />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}