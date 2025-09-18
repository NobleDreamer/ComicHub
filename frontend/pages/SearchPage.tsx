import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, Search } from "lucide-react";
import backend from "~backend/client";

export function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: seriesData, isLoading } = useQuery({
    queryKey: ["search", debouncedSearchTerm],
    queryFn: () => backend.series.list({ limit: 50 }),
    enabled: true,
  });

  const filteredSeries = seriesData?.series.filter(series =>
    series.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    series.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    series.authorName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    series.genre.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-white">Search Comics</h1>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by title, author, or genre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      {!debouncedSearchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-white">Start searching</h3>
          <p className="text-gray-400">Enter a title, author, or genre to find comics</p>
        </div>
      )}

      {debouncedSearchTerm && isLoading && (
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
      )}

      {debouncedSearchTerm && !isLoading && (
        <>
          <p className="text-gray-400 text-sm">
            {filteredSeries.length} result{filteredSeries.length !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {filteredSeries.map((series) => (
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
                    <p className="text-xs text-gray-400 mb-1">by {series.authorName}</p>
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                        {series.genre}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-300">{series.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{series.totalChapters} chapters</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredSeries.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No results found</h3>
              <p className="text-gray-400">Try different keywords or check your spelling</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}