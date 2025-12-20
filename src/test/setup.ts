import { vi } from "vitest";
import { prismaMock } from "../lib/__mocks__/prisma";

// Mock the prisma module globally
vi.mock("../lib/prisma", async () => {
	return {
		prisma: prismaMock,
	};
});
