import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";
import { signToken } from "../utils/jwt.js";

export async function registerUser(data: RegisterInput) {
	// Check if user already exists
	const existingUser = await prisma.user.findUnique({
		where: { email: data.email },
	});

	if (existingUser) {
		throw new AuthError("User with this email already exists", 409);
	}

	// Hash password (salt rounds = 12 for security)
	const hashedPassword = await bcrypt.hash(data.password, 12);

	// Create user
	const user = await prisma.user.create({
		data: {
			email: data.email,
			password: hashedPassword,
			role: data.role,
		},
	});

	// Generate JWT token
	const token = signToken({
		userId: user.id,
		email: user.email,
		role: user.role,
	});

	return {
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
		},
		token,
	};
}

export async function loginUser(data: LoginInput) {
	// Find user by email
	const user = await prisma.user.findUnique({
		where: { email: data.email },
	});

	if (!user) {
		throw new AuthError("Invalid email or password", 401);
	}

	// Verify password
	const isValidPassword = await bcrypt.compare(data.password, user.password);

	if (!isValidPassword) {
		throw new AuthError("Invalid email or password", 401);
	}

	// Generate JWT token
	const token = signToken({
		userId: user.id,
		email: user.email,
		role: user.role,
	});

	return {
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
		},
		token,
	};
}

// Custom error class for auth errors
export class AuthError extends Error {
	constructor(
		message: string,
		public statusCode: number,
	) {
		super(message);
		this.name = "AuthError";
	}
}
