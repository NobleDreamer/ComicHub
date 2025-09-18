import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useAuth, useBackend } from "../contexts/AuthContext";
import backend from "~backend/client";

export function ChapterPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const authenticatedBackend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [commentContent, setCommentContent] = useState("");

  const { data: chapter, isLoading: chapterLoading } = useQuery({
    queryKey: ["chapter", id],
    queryFn: () => backend.chapter.get({ id: parseInt(id!) }),
    enabled: !!id,
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => backend.comment.list({ chapterId: parseInt(id!) }),
    enabled: !!id,
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) =>
      authenticatedBackend.comment.create({
        chapterId: parseInt(id!),
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setCommentContent("");
      toast({ title: "Comment posted successfully!" });
    },
    onError: (error) => {
      console.error("Failed to post comment:", error);
      toast({ title: "Failed to post comment", variant: "destructive" });
    },
  });

  const handleSubmitComment = () => {
    if (!user) {
      toast({ title: "Please login to post a comment", variant: "destructive" });
      return;
    }
    if (!commentContent.trim()) return;
    createCommentMutation.mutate(commentContent);
  };

  const handleKeyNavigation = (e: KeyboardEvent) => {
    if (!chapter) return;
    if (e.key === "ArrowLeft" && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (e.key === "ArrowRight" && currentPage < chapter.totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyNavigation);
    return () => window.removeEventListener("keydown", handleKeyNavigation);
  }, [currentPage, chapter]);

  if (chapterLoading) {
    return <div className="animate-pulse space-y-6">Loading...</div>;
  }

  if (!chapter) {
    return <div>Chapter not found</div>;
  }

  const currentImage = chapter.images[currentPage];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to={`/series/${chapter.seriesId}`}
            className="text-muted-foreground hover:text-foreground"
          >
            {chapter.seriesTitle}
          </Link>
          <h1 className="text-2xl font-bold">
            Chapter {chapter.chapterNumber}: {chapter.title}
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {chapter.totalPages}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="relative">
          {currentImage && (
            <img
              src={currentImage.imageUrl}
              alt={`Page ${currentPage + 1}`}
              className="w-full h-auto max-h-screen object-contain"
              onClick={() => {
                if (currentPage < chapter.totalPages - 1) {
                  setCurrentPage(currentPage + 1);
                }
              }}
            />
          )}
          
          {currentPage > 0 && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2"
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          {currentPage < chapter.totalPages - 1 && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={currentPage === chapter.totalPages - 1}
          onClick={() => setCurrentPage(Math.min(chapter.totalPages - 1, currentPage + 1))}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments ({comments?.comments.length || 0})
        </h2>
        
        {user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add a Comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What did you think of this chapter?"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <Button 
                onClick={handleSubmitComment} 
                disabled={createCommentMutation.isPending || !commentContent.trim()}
              >
                Post Comment
              </Button>
            </CardContent>
          </Card>
        )}

        {comments?.comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments?.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{comment.username}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
