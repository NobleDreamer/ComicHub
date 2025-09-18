import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { imagesBucket } from "../storage";

export interface UploadImageRequest {
  filename: string;
}

export interface UploadImageResponse {
  uploadUrl: string;
  imageUrl: string;
}

// Generates a signed upload URL for image uploads.
export const getUploadUrl = api<UploadImageRequest, UploadImageResponse>(
  { expose: true, method: "POST", path: "/upload/image", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const timestamp = Date.now();
    const objectName = `${auth.userID}/${timestamp}-${req.filename}`;
    
    const { url } = await imagesBucket.signedUploadUrl(objectName, {
      ttl: 3600, // 1 hour
    });
    
    const imageUrl = imagesBucket.publicUrl(objectName);
    
    return {
      uploadUrl: url,
      imageUrl,
    };
  }
);
