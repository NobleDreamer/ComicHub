import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreateCommentRequest {
  chapterId: number;
  content: string;
}

export interface Comment {
  id: number;
  chapterId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: Date;
}

// Creates a new comment on a chapter.
export const create = api<CreateCommentRequest, Comment>(
  { expose: true, method: "POST", path: "/comments", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    const comment = await db.queryRow`
      INSERT INTO comments (chapter_id, user_id, content)
      VALUES (${req.chapterId}, ${parseInt(auth.userID)}, ${req.content})
      RETURNING *
    `;

    if (!comment) {
      throw new Error("Failed to create comment");
    }

    return {
      id: comment.id,
      chapterId: comment.chapter_id,
      userId: comment.user_id,
      username: auth.username,
      content: comment.content,
      createdAt: comment.created_at,
    };
  }
);
