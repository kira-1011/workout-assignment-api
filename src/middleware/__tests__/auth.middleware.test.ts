import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { prismaMock } from "../../lib/__mocks__/prisma";
import { authenticate, authorize, isClient, isTrainer } from "../auth.middleware";
import * as jwt from "../../utils/jwt";

// Mock the jwt module
vi.mock("../../utils/jwt", () => ({
	verifyToken: vi.fn(),
}));

// Helper to create mock Request
const mockRequest = (overrides: Partial<Request> = {}): Request =>
	({
		headers: {},
		user: undefined,
		...overrides,
	}) as Request;

// Helper to create mock Response
const mockResponse = (): Response => {
	const res = {} as Response;
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	return res;
};

describe("Auth Middleware", () => {
	let req: Request;
	let res: Response;
	let next: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();
		req = mockRequest();
		res = mockResponse();
		next = vi.fn();
	});

	// ==========================================
	// authenticate Tests
	// ==========================================
	describe("authenticate", () => {
		it("should return 401 if no token is provided", async () => {
			await authenticate(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Access denied. No token provided.",
			});
			expect(next).not.toHaveBeenCalled();
		});

		it("should return 401 if token is invalid", async () => {
			req = mockRequest({
				headers: { authorization: "Bearer invalid-token" },
			});
			vi.mocked(jwt.verifyToken).mockImplementation(() => {
				throw new Error("Invalid token");
			});

			await authenticate(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid or expired token.",
			});
			expect(next).not.toHaveBeenCalled();
		});

		it("should return 401 if user does not exist in database", async () => {
			req = mockRequest({
				headers: { authorization: "Bearer valid-token" },
			});
			vi.mocked(jwt.verifyToken).mockReturnValue({
				userId: "user-123",
				email: "test@test.com",
				role: "trainer",
			});
			prismaMock.user.findUnique.mockResolvedValue(null);

			await authenticate(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Unauthorized! User does not exist.",
			});
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next() and attach user to request on valid token", async () => {
			const mockPayload = {
				userId: "user-123",
				email: "test@test.com",
				role: "trainer" as const,
			};
			req = mockRequest({
				headers: { authorization: "Bearer valid-token" },
			});
			vi.mocked(jwt.verifyToken).mockReturnValue(mockPayload);
			prismaMock.user.findUnique.mockResolvedValue({
				id: "user-123",
				email: "test@test.com",
				role: "trainer",
			} as never);

			await authenticate(req, res, next);

			expect(req.user).toEqual(mockPayload);
			expect(next).toHaveBeenCalled();
			expect(res.status).not.toHaveBeenCalled();
		});

		it("should accept x-access-token header", async () => {
			const mockPayload = {
				userId: "user-123",
				email: "test@test.com",
				role: "client" as const,
			};
			req = mockRequest({
				headers: { "x-access-token": "valid-token" },
			});
			vi.mocked(jwt.verifyToken).mockReturnValue(mockPayload);
			prismaMock.user.findUnique.mockResolvedValue({
				id: "user-123",
				email: "test@test.com",
				role: "client",
			} as never);

			await authenticate(req, res, next);

			expect(next).toHaveBeenCalled();
		});
	});

	// ==========================================
	// isTrainer Tests
	// ==========================================
	describe("isTrainer", () => {
		it("should return 401 if no user on request", () => {
			isTrainer(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Authentication required.",
			});
			expect(next).not.toHaveBeenCalled();
		});

		it("should return 403 if user is not a trainer", () => {
			req.user = { userId: "user-123", email: "test@test.com", role: "client" };

			isTrainer(req, res, next);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Access denied. Trainer role required.",
			});
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next() if user is a trainer", () => {
			req.user = { userId: "user-123", email: "test@test.com", role: "trainer" };

			isTrainer(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(res.status).not.toHaveBeenCalled();
		});
	});

	// ==========================================
	// isClient Tests
	// ==========================================
	describe("isClient", () => {
		it("should return 401 if no user on request", () => {
			isClient(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(next).not.toHaveBeenCalled();
		});

		it("should return 403 if user is not a client", () => {
			req.user = { userId: "user-123", email: "test@test.com", role: "trainer" };

			isClient(req, res, next);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Access denied. Client role required.",
			});
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next() if user is a client", () => {
			req.user = { userId: "user-123", email: "test@test.com", role: "client" };

			isClient(req, res, next);

			expect(next).toHaveBeenCalled();
		});
	});

	// ==========================================
	// authorize Tests
	// ==========================================
	describe("authorize", () => {
		it("should return 401 if no user on request", () => {
			const middleware = authorize("trainer");

			middleware(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(next).not.toHaveBeenCalled();
		});

		it("should return 403 if role is not allowed", () => {
			req.user = { userId: "user-123", email: "test@test.com", role: "client" };
			const middleware = authorize("trainer");

			middleware(req, res, next);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Access denied. Requires trainer role.",
			});
		});

		it("should call next() if role is allowed", () => {
			req.user = { userId: "user-123", email: "test@test.com", role: "trainer" };
			const middleware = authorize("trainer", "client");

			middleware(req, res, next);

			expect(next).toHaveBeenCalled();
		});

		it("should work with multiple allowed roles", () => {
			req.user = { userId: "user-123", email: "test@test.com", role: "client" };
			const middleware = authorize("trainer", "client");

			middleware(req, res, next);

			expect(next).toHaveBeenCalled();
		});
	});
});

