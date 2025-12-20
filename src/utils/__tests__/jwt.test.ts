import { describe, expect, it } from "vitest";
import { type JwtPayload, signToken, verifyToken } from "../jwt";

describe("JWT Utility", () => {
	const mockPayload: JwtPayload = {
		userId: "test-user-id-123",
		email: "test@example.com",
		role: "trainer",
	};

	describe("signToken", () => {
		it("should generate a valid JWT token string", () => {
			const token = signToken(mockPayload);

			expect(token).toBeDefined();
			expect(typeof token).toBe("string");
			// JWT tokens have 3 parts separated by dots
			expect(token.split(".")).toHaveLength(3);
		});
	});

	describe("verifyToken", () => {
		it("should verify and decode a valid token", () => {
			const token = signToken(mockPayload);
			const decoded = verifyToken(token);

			expect(decoded.userId).toBe(mockPayload.userId);
			expect(decoded.email).toBe(mockPayload.email);
			expect(decoded.role).toBe(mockPayload.role);
		});

		it("should throw an error for invalid token", () => {
			expect(() => verifyToken("invalid-token")).toThrow();
		});
	});
});
