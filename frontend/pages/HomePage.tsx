import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, TrendingUp, Clock } from "lucide-react";
import backend from "~backend/client";

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life"];

export function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: seriesData, isLoading } = useQuery({
    queryKey: ["series", selectedGenre],
    queryFn: () => backend.series.list({ 
      genre: selectedGenre === "all" ? undefined : selectedGenre,
      limit: 20 
    }),
  });

  const filteredSeries = seriesData?.series.filter(series =>
    series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    series.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 space-y-6">
        <div className="text-center space-y-4 py-8">
          <h1 className="text-3xl font-bold text-white">ComicHub</h1>
          <p className="text-gray-400">
            Discover amazing comics, manga, manhwa & webtoons
          </p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Search for comics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedGenre !== "all" && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedGenre("all")}
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Clear Filter
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">
              {selectedGenre === "all" ? "All Comics" : selectedGenre}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse bg-gray-800 border-gray-700">
                  <CardHeader className="p-0">
                    <div className="aspect-[3/4] bg-gray-700 rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    <div className="h-4 bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-700 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredSeries.map((series) => (
                <Link key={series.id} to={`/series/${series.id}`}>
                  <Card className="transition-transform hover:scale-105 cursor-pointer bg-gray-800 border-gray-700 hover:bg-gray-750">
                    <CardHeader className="p-0">
                      <div className="aspect-[3/4] bg-gray-700 rounded-t-lg overflow-hidden relative">
                        {series.coverImageUrl ? (
                          <img
                            src={series.coverImageUrl}
                            alt={series.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                            {series.genre}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <h3 className="font-semibold mb-1 line-clamp-2 text-white text-sm">{series.title}</h3>
                      <p className="text-xs text-gray-400 mb-2">by {series.authorName}</p>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1 text-xs">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-300">{series.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{series.totalChapters} ch</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {filteredSeries.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No comics found</h3>
              <p className="text-gray-400">
                {searchTerm || selectedGenre !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Be the first to share a comic!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}