import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X } from "lucide-react";
import { useAuth, useBackend } from "../contexts/AuthContext";

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life"];

export function CreateSeriesPage() {
  const { user } = useAuth();
  const authenticatedBackend = useBackend();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const createSeriesMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      genre: string;
      coverImageUrl?: string;
    }) => authenticatedBackend.series.create(data),
    onSuccess: (series) => {
      toast({ title: "Series created successfully!" });
      navigate(`/series/${series.id}`);
    },
    onError: (error) => {
      console.error("Failed to create series:", error);
      toast({ title: "Failed to create series", variant: "destructive" });
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const { uploadUrl, imageUrl } = await authenticatedBackend.upload.getUploadUrl({
        filename: file.name,
      });
      
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });
      
      setCoverImageUrl(imageUrl);
      toast({ title: "Cover image uploaded successfully!" });
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      handleImageUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to create a series", variant: "destructive" });
      return;
    }
    
    createSeriesMutation.mutate({
      title,
      description: description || undefined,
      genre,
      coverImageUrl: coverImageUrl || undefined,
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Please login to create a new series.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Series</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Select value={genre} onValueChange={setGenre} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              {coverImageUrl ? (
                <div className="relative w-48 h-64 mx-auto">
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setCoverImageUrl("");
                      setCoverImage(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a cover image (optional)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="cover-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={uploading}
                  >
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      {uploading ? "Uploading..." : "Choose File"}
                    </label>
                  </Button>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createSeriesMutation.isPending || !title || !genre}
            >
              {createSeriesMutation.isPending ? "Creating..." : "Create Series"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
