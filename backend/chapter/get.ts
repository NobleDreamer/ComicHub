import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface GetChapterRequest {
  id: number;
}

export interface ChapterImage {
  id: number;
  imageUrl: string;
  pageNumber: number;
}

export interface ChapterDetails {
  id: number;
  seriesId: number;
  seriesTitle: string;
  title: string;
  chapterNumber: number;
  totalPages: number;
  images: ChapterImage[];
  createdAt: Date;
}

// Gets details and images for a specific chapter.
export const get = api<GetChapterRequest, ChapterDetails>(
  { expose: true, method: "GET", path: "/chapters/:id" },
  async (req) => {
    const chapter = await db.queryRow`
      SELECT c.*, s.title as series_title
      FROM chapters c
      JOIN series s ON c.series_id = s.id
      WHERE c.id = ${req.id}
    `;

    if (!chapter) {
      throw APIError.notFound("chapter not found");
    }

    const images = await db.queryAll`
      SELECT id, image_url, page_number
      FROM chapter_images
      WHERE chapter_id = ${req.id}
      ORDER BY page_number ASC
    `;

    return {
      id: chapter.id,
      seriesId: chapter.series_id,
      seriesTitle: chapter.series_title,
      title: chapter.title,
      chapterNumber: chapter.chapter_number,
      totalPages: chapter.total_pages,
      images: images.map(img => ({
        id: img.id,
        imageUrl: img.image_url,
        pageNumber: img.page_number,
      })),
      createdAt: chapter.created_at,
    };
  }
);
