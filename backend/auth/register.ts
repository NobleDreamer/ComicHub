import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface RegisterRequest {
  email: string;
  username: string;
  displayName: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  username: string;
  displayName: string;
  token: string;
}

// Registers a new user account.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    // Check if user already exists
    const existingUser = await db.queryRow`
      SELECT id FROM users 
      WHERE email = ${req.email} OR username = ${req.username}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("user with this email or username already exists");
    }

    // Create new user
    const user = await db.queryRow`
      INSERT INTO users (email, username, display_name)
      VALUES (${req.email}, ${req.username}, ${req.displayName})
      RETURNING id, email, username, display_name
    `;

    if (!user) {
      throw APIError.internal("failed to create user");
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
