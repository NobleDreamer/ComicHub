import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreateSeriesRequest {
  title: string;
  description?: string;
  genre: string;
  coverImageUrl?: string;
}

export interface Series {
  id: number;
  title: string;
  description?: string;
  authorId: number;
  authorName: string;
  genre: string;
  status: string;
  coverImageUrl?: string;
  totalChapters: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new series.
export const create = api<CreateSeriesRequest, Series>(
  { expose: true, method: "POST", path: "/series", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    const series = await db.queryRow`
      INSERT INTO series (title, description, author_id, genre, cover_image_url)
      VALUES (${req.title}, ${req.description}, ${parseInt(auth.userID)}, ${req.genre}, ${req.coverImageUrl})
      RETURNING *
    `;

    if (!series) {
      throw new Error("Failed to create series");
    }

    return {
      id: series.id,
      title: series.title,
      description: series.description,
      authorId: series.author_id,
      authorName: auth.username,
      genre: series.genre,
      status: series.status,
      coverImageUrl: series.cover_image_url,
      totalChapters: series.total_chapters,
      averageRating: series.average_rating,
      totalReviews: series.total_reviews,
      createdAt: series.created_at,
      updatedAt: series.updated_at,
    };
  }
);
