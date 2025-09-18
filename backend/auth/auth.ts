import { authHandler } from "encore.dev/auth";
import { Header, APIError } from "encore.dev/api";
import db from "../db";

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  username: string;
  email: string;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const token = params.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    // Simple token-based auth - in production, use proper JWT validation
    const user = await db.queryRow`
      SELECT id, username, email 
      FROM users 
      WHERE id = ${parseInt(token)}
    `;

    if (!user) {
      throw APIError.unauthenticated("invalid token");
    }

    return {
      userID: user.id.toString(),
      username: user.username,
      email: user.email,
    };
  }
);
