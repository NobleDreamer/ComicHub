import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./pages/HomePage";
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
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/series/:id" element={<SeriesPage />} />
                <Route path="/chapter/:id" element={<ChapterPage />} />
                <Route path="/create-series" element={<CreateSeriesPage />} />
                <Route path="/create-chapter/:seriesId" element={<CreateChapterPage />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
