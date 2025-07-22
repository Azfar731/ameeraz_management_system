import { z } from "zod";

export const balance_transaction_schema  = z.object({
    amount: z
        .string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), {
            message: "Amount must be a valid number",
        })
        .refine((value) => value >= 0, {
            message: "Amount must be a positive number",
        }),
    type: z.enum(["add", "subtract"]) 
});