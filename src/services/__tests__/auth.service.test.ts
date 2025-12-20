import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../lib/__mocks__/prisma";
import { AuthError, loginUser, registerUser } from "../auth.service";

vi.mock("bcryptjs", () => ({
	default: {
		hash: vi.fn(),
		compare: vi.fn(),
	},
}));

describe("Auth Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ==========================================
	// registerUser Tests
	// ==========================================
	describe("registerUser", () => {
		const mockInput = {
			email: "test@example.com",
			password: "password123",
			role: "trainer" as const,
		};

		it("should register a new user successfully", async () => {
			// Arrange: Set up mock responses
			const mockUser = {
				id: "user-123",
				email: mockInput.email,
				password: "hashed-password",
				role: mockInput.role,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			prismaMock.user.findUnique.mockResolvedValue(null); // No existing user
			vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
			prismaMock.user.create.mockResolvedValue(mockUser);

			const result = await registerUser(mockInput);

			expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
				where: { email: mockInput.email },
			});
			expect(bcrypt.hash).toHaveBeenCalledWith(mockInput.password, 12);
			expect(prismaMock.user.create).toHaveBeenCalledWith({
				data: {
					email: mockInput.email,
					password: "hashed-password",
					role: mockInput.role,
				},
			});
			expect(result.user.email).toBe(mockInput.email);
			expect(result.user.role).toBe(mockInput.role);
			expect(result.token).toBeDefined();
			expect(typeof result.token).toBe("string");
		});

		it("should throw AuthError (409) if user already exists", async () => {
			// Arrange
			const existingUser = {
				id: "existing-user",
				email: mockInput.email,
				password: "hashed",
				role: "trainer" as const,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			prismaMock.user.findUnique.mockResolvedValue(existingUser);

			await expect(registerUser(mockInput)).rejects.toThrow(AuthError);
			await expect(registerUser(mockInput)).rejects.toThrow(
				"User with this email already exists",
			);

			expect(prismaMock.user.create).not.toHaveBeenCalled();
		});
	});

	// ==========================================
	// loginUser Tests
	// ==========================================
	describe("loginUser", () => {
		const mockInput = {
			email: "test@example.com",
			password: "password123",
		};

		const mockUser = {
			id: "user-123",
			email: mockInput.email,
			password: "hashed-password",
			role: "trainer" as const,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		it("should login successfully with valid credentials", async () => {
			prismaMock.user.findUnique.mockResolvedValue(mockUser);
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			const result = await loginUser(mockInput);

			expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
				where: { email: mockInput.email },
			});
			expect(bcrypt.compare).toHaveBeenCalledWith(
				mockInput.password,
				mockUser.password,
			);
			expect(result.user.email).toBe(mockInput.email);
			expect(result.token).toBeDefined();
		});

		it("should throw AuthError (401) if user not found", async () => {
			prismaMock.user.findUnique.mockResolvedValue(null);

			await expect(loginUser(mockInput)).rejects.toThrow(AuthError);
			await expect(loginUser(mockInput)).rejects.toThrow(
				"Invalid email or password",
			);

			expect(bcrypt.compare).not.toHaveBeenCalled();
		});

		it("should throw AuthError (401) if password is invalid", async () => {
			prismaMock.user.findUnique.mockResolvedValue(mockUser);
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			await expect(loginUser(mockInput)).rejects.toThrow(AuthError);
			await expect(loginUser(mockInput)).rejects.toThrow(
				"Invalid email or password",
			);
		});
	});
});
