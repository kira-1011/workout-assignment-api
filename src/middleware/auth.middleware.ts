import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { type JwtPayload, verifyToken } from "../utils/jwt";

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}

/**
 * Middleware to verify JWT token
 * Accepts token from Authorization header (Bearer) or x-access-token header
 */
export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Support both Authorization: Bearer <token> and x-access-token header
	const authHeader = req.headers.authorization;
	const xAccessToken = req.headers["x-access-token"];
	let token: string | undefined =
		(Array.isArray(xAccessToken) ? xAccessToken[0] : xAccessToken) ||
		authHeader;

	if (!token) {
		res.status(401).json({
			success: false,
			message: "Access denied. No token provided.",
		});
		return;
	}
	token = token.replace("Bearer ", "");

	try {
		const decoded = verifyToken(token);

		// Optionally verify user still exists in database
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: { id: true, email: true, role: true },
		});

		if (!user) {
			res.status(401).json({
				success: false,
				message: "Unauthorized! User does not exist.",
			});
			return;
		}

		// Attach user payload to request
		req.user = decoded;
		next();
	} catch (_) {
		res.status(401).json({
			success: false,
			message: "Invalid or expired token.",
		});
	}
};

/**
 * Middleware to check if user is a trainer
 * Must be used after authenticate middleware
 */
export const isTrainer = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		res.status(401).json({
			success: false,
			message: "Authentication required.",
		});
		return;
	}

	if (req.user.role !== "trainer") {
		res.status(403).json({
			success: false,
			message: "Access denied. Trainer role required.",
		});
		return;
	}

	next();
};

/**
 * Middleware to check if user is a client
 * Must be used after authenticate middleware
 */
export const isClient = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		res.status(401).json({
			success: false,
			message: "Authentication required.",
		});
		return;
	}

	if (req.user.role !== "client") {
		res.status(403).json({
			success: false,
			message: "Access denied. Client role required.",
		});
		return;
	}

	next();
};

/**
 * Middleware factory for flexible role checking
 * @param allowedRoles - Array of roles that can access the route
 */
export const authorize = (...allowedRoles: ("trainer" | "client")[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Authentication required.",
			});
			return;
		}

		if (!allowedRoles.includes(req.user.role)) {
			res.status(403).json({
				success: false,
				message: `Access denied. Requires ${allowedRoles.join(" or ")} role.`,
			});
			return;
		}

		next();
	};
};
