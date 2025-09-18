import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  username: string;
  displayName: string;
  token: string;
}

// Logs in a user with email.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const user = await db.queryRow`
      SELECT id, email, username, display_name
      FROM users 
      WHERE email = ${req.email}
    `;

    if (!user) {
      throw APIError.notFound("user not found");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      token: user.id.toString(), // Simple token for demo
    };
  }
);
