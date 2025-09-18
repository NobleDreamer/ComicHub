import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface ListChaptersRequest {
  seriesId: Query<number>;
}

export interface ChapterListItem {
  id: number;
  title: string;
  chapterNumber: number;
  totalPages: number;
  createdAt: Date;
}

export interface ListChaptersResponse {
  chapters: ChapterListItem[];
}

// Lists all chapters for a series.
export const list = api<ListChaptersRequest, ListChaptersResponse>(
  { expose: true, method: "GET", path: "/chapters" },
  async (req) => {
    const chapters = await db.queryAll`
      SELECT id, title, chapter_number, total_pages, created_at
      FROM chapters
      WHERE series_id = ${req.seriesId}
      ORDER BY chapter_number ASC
    `;

    return {
      chapters: chapters.map(c => ({
        id: c.id,
        title: c.title,
        chapterNumber: c.chapter_number,
        totalPages: c.total_pages,
        createdAt: c.created_at,
      })),
    };
  }
);
