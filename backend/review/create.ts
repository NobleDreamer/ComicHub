import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreateReviewRequest {
  seriesId: number;
  rating: number;
  content?: string;
}

export interface Review {
  id: number;
  seriesId: number;
  userId: number;
  username: string;
  rating: number;
  content?: string;
  createdAt: Date;
}

// Creates or updates a review for a series.
export const create = api<CreateReviewRequest, Review>(
  { expose: true, method: "POST", path: "/reviews", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    if (req.rating < 1 || req.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const review = await db.queryRow`
      INSERT INTO reviews (series_id, user_id, rating, content)
      VALUES (${req.seriesId}, ${parseInt(auth.userID)}, ${req.rating}, ${req.content})
      ON CONFLICT (series_id, user_id)
      DO UPDATE SET rating = ${req.rating}, content = ${req.content}, created_at = NOW()
      RETURNING *
    `;

    if (!review) {
      throw new Error("Failed to create review");
    }

    // Update series average rating
    const stats = await db.queryRow`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE series_id = ${req.seriesId}
    `;

    await db.exec`
      UPDATE series 
      SET average_rating = ${stats?.avg_rating || 0}, total_reviews = ${stats?.total_reviews || 0}
      WHERE id = ${req.seriesId}
    `;

    return {
      id: review.id,
      seriesId: review.series_id,
      userId: review.user_id,
      username: auth.username,
      rating: review.rating,
      content: review.content,
      createdAt: review.created_at,
    };
  }
);
