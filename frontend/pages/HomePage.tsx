import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Eye } from "lucide-react";
import backend from "~backend/client";

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life"];

export function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: seriesData, isLoading } = useQuery({
    queryKey: ["series", selectedGenre],
    queryFn: () => backend.series.list({ 
      genre: selectedGenre || undefined,
      limit: 20 
    }),
  });

  const filteredSeries = seriesData?.series.filter(series =>
    series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    series.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Discover Amazing Comics</h1>
        <p className="text-lg text-muted-foreground">
          Read and share manga, manhwa, manhua, and webtoons for free
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search for comics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedGenre && (
          <Button variant="outline" onClick={() => setSelectedGenre("")}>
            Clear Filter
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-0">
                <div className="aspect-[3/4] bg-muted rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSeries.map((series) => (
            <Link key={series.id} to={`/series/${series.id}`}>
              <Card className="transition-transform hover:scale-105 cursor-pointer">
                <CardHeader className="p-0">
                  <div className="aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
                    {series.coverImageUrl ? (
                      <img
                        src={series.coverImageUrl}
                        alt={series.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-2">{series.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">by {series.authorName}</p>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{series.genre}</Badge>
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{series.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {series.totalChapters} chapters
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {filteredSeries.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No comics found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedGenre
              ? "Try adjusting your search or filter criteria"
              : "Be the first to share a comic!"}
          </p>
        </div>
      )}
    </div>
  );
}
