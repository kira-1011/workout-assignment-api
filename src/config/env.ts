import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z.string(),
	JWT_SECRET: z.string().min(32),
	JWT_EXPIRES_IN: z.coerce.number().default(7 * 24 * 60 * 60 * 1000), // Added coerce
});

export const env = envSchema.parse(process.env);
