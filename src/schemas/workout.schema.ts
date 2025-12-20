import { z } from "zod";

export const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export const assignWorkoutSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type AssignWorkoutInput = z.infer<typeof assignWorkoutSchema>;