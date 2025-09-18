import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, ArrowUp, ArrowDown } from "lucide-react";
import { useAuth, useBackend } from "../contexts/AuthContext";
import backend from "~backend/client";

interface UploadedImage {
  file: File;
  url: string;
  uploading: boolean;
}

export function CreateChapterPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const { user } = useAuth();
  const authenticatedBackend = useBackend();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const { data: series } = useQuery({
    queryKey: ["series", seriesId],
    queryFn: () => backend.series.get({ id: parseInt(seriesId!) }),
    enabled: !!seriesId,
  });

  const { data: chapters } = useQuery({
    queryKey: ["chapters", seriesId],
    queryFn: () => backend.chapter.list({ seriesId: parseInt(seriesId!) }),
    enabled: !!seriesId,
  });

  // Set chapter number when chapters data is loaded
  useEffect(() => {
    if (chapters && chapters.chapters && chapters.chapters.length > 0) {
      const maxChapter = Math.max(...chapters.chapters.map((c: any) => c.chapterNumber));
      setChapterNumber(maxChapter + 1);
    }
  }, [chapters]);

  const createChapterMutation = useMutation({
    mutationFn: (data: {
      seriesId: number;
      title: string;
      chapterNumber: number;
      imageUrls: string[];
    }) => authenticatedBackend.chapter.create(data),
    onSuccess: (chapter) => {
      toast({ title: "Chapter created successfully!" });
      navigate(`/chapter/${chapter.id}`);
    },
    onError: (error) => {
      console.error("Failed to create chapter:", error);
      toast({ title: "Failed to create chapter", variant: "destructive" });
    },
  });

  const handleImageUpload = async (files: FileList) => {
    if (!user) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newImage: UploadedImage = {
        file,
        url: "",
        uploading: true,
      };
      
      setImages(prev => [...prev, newImage]);
      
      try {
        const { uploadUrl, imageUrl } = await authenticatedBackend.upload.getUploadUrl({
          filename: file.name,
        });
        
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
        });
        
        setImages(prev => 
          prev.map(img => 
            img.file === file 
              ? { ...img, url: imageUrl, uploading: false }
              : img
          )
        );
      } catch (error) {
        console.error("Failed to upload image:", error);
        setImages(prev => prev.filter(img => img.file !== file));
        toast({ title: "Failed to upload image", variant: "destructive" });
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setImages(prev => {
      const newImages = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newImages.length) {
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      }
      return newImages;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !seriesId) {
      toast({ title: "Invalid request", variant: "destructive" });
      return;
    }
    
    const imageUrls = images.filter(img => !img.uploading).map(img => img.url);
    
    if (imageUrls.length === 0) {
      toast({ title: "Please upload at least one image", variant: "destructive" });
      return;
    }
    
    createChapterMutation.mutate({
      seriesId: parseInt(seriesId),
      title,
      chapterNumber,
      imageUrls,
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Please login to create a new chapter.</p>
        </CardContent>
      </Card>
    );
  }

  if (!series) {
    return <div>Loading...</div>;
  }

  const isUploading = images.some(img => img.uploading);
  const allImagesUploaded = images.length > 0 && images.every(img => !img.uploading);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Chapter to "{series.title}"</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Chapter Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Chapter Number *</Label>
                <Input
                  id="number"
                  type="number"
                  min="1"
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Chapter Pages *</Label>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload chapter pages (multiple images allowed)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="images-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={isUploading}
                >
                  <label htmlFor="images-upload" className="cursor-pointer">
                    {isUploading ? "Uploading..." : "Choose Files"}
                  </label>
                </Button>
              </div>

              {images.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Pages will be displayed in this order:
                  </p>
                  <div className="space-y-2">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <span className="text-sm font-medium w-12">
                          Page {index + 1}
                        </span>
                        
                        {image.url && (
                          <img
                            src={image.url}
                            alt={`Page ${index + 1}`}
                            className="w-16 h-20 object-cover rounded"
                          />
                        )}
                        
                        <div className="flex-1">
                          <p className="text-sm font-medium">{image.file.name}</p>
                          {image.uploading && (
                            <p className="text-xs text-muted-foreground">Uploading...</p>
                          )}
                        </div>
                        
                        {!image.uploading && (
                          <div className="flex space-x-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => moveImage(index, "up")}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => moveImage(index, "down")}
                              disabled={index === images.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                createChapterMutation.isPending || 
                !title || 
                !allImagesUploaded ||
                isUploading
              }
            >
              {createChapterMutation.isPending ? "Creating..." : "Create Chapter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
