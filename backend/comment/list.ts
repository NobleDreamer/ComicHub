import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface ListCommentsRequest {
  chapterId: Query<number>;
}

export interface CommentItem {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: Date;
}

export interface ListCommentsResponse {
  comments: CommentItem[];
}

// Lists all comments for a chapter.
export const list = api<ListCommentsRequest, ListCommentsResponse>(
  { expose: true, method: "GET", path: "/comments" },
  async (req) => {
    const comments = await db.queryAll`
      SELECT c.*, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.chapter_id = ${req.chapterId}
      ORDER BY c.created_at DESC
    `;

    return {
      comments: comments.map(c => ({
        id: c.id,
        userId: c.user_id,
        username: c.username,
        content: c.content,
        createdAt: c.created_at,
      })),
    };
  }
);
