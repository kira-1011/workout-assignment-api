import type { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { loginUser, registerUser } from "../services/auth.service";
import type { AuthResponse } from "../types/api.type";

/**
 * POST /auth/register - Register a new user
 * @returns {AuthResponse}
 */
export async function register(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const data = registerSchema.parse(req.body);
		const result = await registerUser(data);

		const response: AuthResponse = {
			success: true,
			message: "User registered successfully",
			data: result,
		};
		res.status(201).json(response);
	} catch (error) {
		next(error);
	}
}

/**
 * POST /auth/login - Login and receive JWT token
 * @returns {AuthResponse}
 */
export async function login(req: Request, res: Response, next: NextFunction) {
	try {
		const data = loginSchema.parse(req.body);
		const result = await loginUser(data);

		const response: AuthResponse = {
			success: true,
			message: "Login successful",
			data: result,
		};
		res.status(200).json(response);
	} catch (error) {
		next(error);
	}
}
