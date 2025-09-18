import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface GetSeriesRequest {
  id: number;
}

export interface SeriesDetails {
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

// Gets details for a specific series.
export const get = api<GetSeriesRequest, SeriesDetails>(
  { expose: true, method: "GET", path: "/series/:id" },
  async (req) => {
    const series = await db.queryRow`
      SELECT s.*, u.username as author_name
      FROM series s
      JOIN users u ON s.author_id = u.id
      WHERE s.id = ${req.id}
    `;

    if (!series) {
      throw APIError.notFound("series not found");
    }

    return {
      id: series.id,
      title: series.title,
      description: series.description,
      authorId: series.author_id,
      authorName: series.author_name,
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
