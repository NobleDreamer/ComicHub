import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Star, Plus, BookOpen } from "lucide-react";
import { useAuth, useBackend } from "../contexts/AuthContext";
import backend from "~backend/client";

export function SeriesPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const authenticatedBackend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState<number>(5);

  const { data: series, isLoading: seriesLoading } = useQuery({
    queryKey: ["series", id],
    queryFn: () => backend.series.get({ id: parseInt(id!) }),
    enabled: !!id,
  });

  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ["chapters", id],
    queryFn: () => backend.chapter.list({ seriesId: parseInt(id!) }),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => backend.review.list({ seriesId: parseInt(id!) }),
    enabled: !!id,
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: { rating: number; content?: string }) =>
      authenticatedBackend.review.create({
        seriesId: parseInt(id!),
        rating: data.rating,
        content: data.content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["series", id] });
      setReviewContent("");
      setRating(5);
      toast({ title: "Review submitted successfully!" });
    },
    onError: (error) => {
      console.error("Failed to submit review:", error);
      toast({ title: "Failed to submit review", variant: "destructive" });
    },
  });

  const handleSubmitReview = () => {
    if (!user) {
      toast({ title: "Please login to submit a review", variant: "destructive" });
      return;
    }
    createReviewMutation.mutate({ rating, content: reviewContent });
  };

  if (seriesLoading || chaptersLoading) {
    return <div className="animate-pulse space-y-6">Loading...</div>;
  }

  if (!series) {
    return <div>Series not found</div>;
  }

  const isAuthor = user?.id === series.authorId;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
            {series.coverImageUrl ? (
              <img
                src={series.coverImageUrl}
                alt={series.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
            <p className="text-lg text-muted-foreground">by {series.authorName}</p>
            <div className="flex items-center space-x-4 mt-4">
              <Badge variant="secondary">{series.genre}</Badge>
              <Badge variant={series.status === "completed" ? "default" : "outline"}>
                {series.status}
              </Badge>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{series.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({series.totalReviews} reviews)</span>
              </div>
            </div>
          </div>

          {series.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{series.description}</p>
            </div>
          )}

          <div className="flex gap-4">
            {isAuthor && (
              <Button asChild>
                <Link to={`/create-chapter/${series.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chapter
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Chapters ({series.totalChapters})</h2>
        {chapters?.chapters.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No chapters available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {chapters?.chapters.map((chapter) => (
              <Link key={chapter.id} to={`/chapter/${chapter.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Chapter {chapter.chapterNumber}: {chapter.title}</h3>
                      <p className="text-sm text-muted-foreground">{chapter.totalPages} pages</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(chapter.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        
        {user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rating</label>
                <Select value={rating.toString()} onValueChange={(value) => setRating(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Star{num > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Write your review..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
              <Button onClick={handleSubmitReview} disabled={createReviewMutation.isPending}>
                Submit Review
              </Button>
            </CardContent>
          </Card>
        )}

        {reviews?.reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews?.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{review.username}</span>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.content && <p className="text-muted-foreground">{review.content}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
