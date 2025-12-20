import { beforeEach } from "vitest";
import { type DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "../../../generated/prisma/client";

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Reset mocks before each test
beforeEach(() => {
	mockReset(prismaMock);
});

export type MockPrismaClient = DeepMockProxy<PrismaClient>;
