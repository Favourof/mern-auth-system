import { Request } from "express";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  refreshToken?: string;
  createdAt: Date;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TokenPayload {
  id: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: IUserResponse;
}
