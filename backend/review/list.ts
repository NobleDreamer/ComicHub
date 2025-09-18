import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface ListReviewsRequest {
  seriesId: Query<number>;
}

export interface ReviewItem {
  id: number;
  userId: number;
  username: string;
  rating: number;
  content?: string;
  createdAt: Date;
}

export interface ListReviewsResponse {
  reviews: ReviewItem[];
}

// Lists all reviews for a series.
export const list = api<ListReviewsRequest, ListReviewsResponse>(
  { expose: true, method: "GET", path: "/reviews" },
  async (req) => {
    const reviews = await db.queryAll`
      SELECT r.*, u.username
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.series_id = ${req.seriesId}
      ORDER BY r.created_at DESC
    `;

    return {
      reviews: reviews.map(r => ({
        id: r.id,
        userId: r.user_id,
        username: r.username,
        rating: r.rating,
        content: r.content,
        createdAt: r.created_at,
      })),
    };
  }
);
