import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface ListSeriesRequest {
  genre?: Query<string>;
  status?: Query<string>;
  authorId?: Query<number>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface SeriesListItem {
  id: number;
  title: string;
  description?: string;
  authorName: string;
  genre: string;
  status: string;
  coverImageUrl?: string;
  totalChapters: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
}

export interface ListSeriesResponse {
  series: SeriesListItem[];
  total: number;
}

// Lists all series with optional filtering.
export const list = api<ListSeriesRequest, ListSeriesResponse>(
  { expose: true, method: "GET", path: "/series" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    
    if (req.genre) {
      whereClause += ` AND s.genre = $${params.length + 1}`;
      params.push(req.genre);
    }
    
    if (req.status) {
      whereClause += ` AND s.status = $${params.length + 1}`;
      params.push(req.status);
    }
    
    if (req.authorId) {
      whereClause += ` AND s.author_id = $${params.length + 1}`;
      params.push(req.authorId);
    }

    const query = `
      SELECT s.*, u.username as author_name
      FROM series s
      JOIN users u ON s.author_id = u.id
      ${whereClause}
      ORDER BY s.updated_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    
    const series = await db.rawQueryAll(query, ...params);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM series s
      ${whereClause}
    `;
    
    const countResult = await db.rawQueryRow(countQuery, ...params.slice(0, -2));
    
    return {
      series: series.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        authorName: s.author_name,
        genre: s.genre,
        status: s.status,
        coverImageUrl: s.cover_image_url,
        totalChapters: s.total_chapters,
        averageRating: s.average_rating,
        totalReviews: s.total_reviews,
        createdAt: s.created_at,
      })),
      total: countResult?.total || 0,
    };
  }
);
