import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
	userId: string;
	email: string;
	role: "trainer" | "client";
}

const signOptions: jwt.SignOptions = {
	expiresIn: env.JWT_EXPIRES_IN,
	algorithm: "HS256",
};

const verifyOptions: jwt.VerifyOptions = {
	algorithms: ["HS256"],
};

export function signToken(payload: JwtPayload): string {
	return jwt.sign(payload, env.JWT_SECRET, signOptions);
}

export function verifyToken(token: string): JwtPayload {
	return jwt.verify(token, env.JWT_SECRET, verifyOptions) as JwtPayload;
}
