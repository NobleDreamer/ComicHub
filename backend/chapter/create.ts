import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreateChapterRequest {
  seriesId: number;
  title: string;
  chapterNumber: number;
  imageUrls: string[];
}

export interface Chapter {
  id: number;
  seriesId: number;
  title: string;
  chapterNumber: number;
  totalPages: number;
  createdAt: Date;
}

// Creates a new chapter with images.
export const create = api<CreateChapterRequest, Chapter>(
  { expose: true, method: "POST", path: "/chapters", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    // Verify user owns the series
    const series = await db.queryRow`
      SELECT id FROM series WHERE id = ${req.seriesId} AND author_id = ${parseInt(auth.userID)}
    `;
    
    if (!series) {
      throw new Error("Series not found or access denied");
    }

    const tx = await db.begin();
    try {
      // Create chapter
      const chapter = await tx.queryRow`
        INSERT INTO chapters (series_id, title, chapter_number, total_pages)
        VALUES (${req.seriesId}, ${req.title}, ${req.chapterNumber}, ${req.imageUrls.length})
        RETURNING *
      `;

      if (!chapter) {
        throw new Error("Failed to create chapter");
      }

      // Add images
      for (let i = 0; i < req.imageUrls.length; i++) {
        await tx.exec`
          INSERT INTO chapter_images (chapter_id, image_url, page_number)
          VALUES (${chapter.id}, ${req.imageUrls[i]}, ${i + 1})
        `;
      }

      // Update series chapter count
      await tx.exec`
        UPDATE series 
        SET total_chapters = total_chapters + 1, updated_at = NOW()
        WHERE id = ${req.seriesId}
      `;
      
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    const chapter = await db.queryRow`
      SELECT * FROM chapters 
      WHERE series_id = ${req.seriesId} AND chapter_number = ${req.chapterNumber}
    `;

    return {
      id: chapter!.id,
      seriesId: chapter!.series_id,
      title: chapter!.title,
      chapterNumber: chapter!.chapter_number,
      totalPages: chapter!.total_pages,
      createdAt: chapter!.created_at,
    };
  }
);
