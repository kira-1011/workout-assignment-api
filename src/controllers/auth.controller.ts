import type { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { loginUser, registerUser } from "../services/auth.service.js";

export async function register(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		// Validate input
		const data = registerSchema.parse(req.body);

		// Register user
		const result = await registerUser(data);

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			data: result,
		});
	} catch (error) {
		next(error);
	}
}

export async function login(req: Request, res: Response, next: NextFunction) {
	try {
		// Validate input
		const data = loginSchema.parse(req.body);

		// Login user
		const result = await loginUser(data);

		res.status(200).json({
			success: true,
			message: "Login successful",
			data: result,
		});
	} catch (error) {
		next(error);
	}
}
