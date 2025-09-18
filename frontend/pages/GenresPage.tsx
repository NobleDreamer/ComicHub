import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Eye } from "lucide-react";
import backend from "~backend/client";

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life"];

export function GenresPage() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const { data: seriesData, isLoading } = useQuery({
    queryKey: ["series", selectedGenre],
    queryFn: () => backend.series.list({ 
      genre: selectedGenre || undefined,
      limit: 20 
    }),
  });

  if (selectedGenre) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{selectedGenre}</h1>
          <button
            onClick={() => setSelectedGenre(null)}
            className="text-blue-400 hover:text-blue-300"
          >
            Back to Genres
          </button>
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
            {seriesData?.series.map((series) => (
              <Link key={series.id} to={`/series/${series.id}`}>
                <Card className="transition-transform hover:scale-105 cursor-pointer bg-gray-800 border-gray-700 hover:bg-gray-750">
                  <CardHeader className="p-0">
                    <div className="aspect-[3/4] bg-gray-700 rounded-t-lg overflow-hidden">
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
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <h3 className="font-semibold mb-1 line-clamp-2 text-white text-sm">{series.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">by {series.authorName}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-300">{series.averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-400">{series.totalChapters} ch</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {seriesData?.series.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">No comics found in {selectedGenre}</h3>
            <p className="text-gray-400">Try another genre or be the first to upload!</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-white">Browse by Genre</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white mb-2">{genre}</h3>
            <p className="text-sm text-gray-400">Explore {genre.toLowerCase()} comics</p>
          </button>
        ))}
      </div>
    </div>
  );
}