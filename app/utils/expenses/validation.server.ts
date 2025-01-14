import { z } from "zod";

//this schema is also used by all-transactions route loader
const expensesFetchSchema = z.object({
    start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => new Date(str))
        .optional(),

    end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => new Date(str))
        .optional(),
}).refine(
    (data) => {
        // Only perform the comparison if both dates are defined
        if (data.start_date && data.end_date) {
            return data.end_date >= data.start_date;
        }
        // If one or both dates are undefined, consider it valid
        return true;
    },
    {
        message: "End date must be greater than start date",
        path: ["end_date"],
    },
).superRefine((data) => {
    if (!(data.start_date || data.end_date)) {
        data.start_date = new Date();
        data.start_date.setHours(0,0,0,0)
    }

    if (data.end_date) {
        data.end_date.setHours(23, 59, 59, 999);
    }
});

const expensesSchema = z.object({
    amount_paid: z
        .string()
        .transform((amount) => parseInt(amount))
        .refine((amount) => !isNaN(amount) && amount > 0, {
            message: "Amount paid must be greater than 0",
        }),

    description: z
        .string()
        .min(1, "Description must be provided"),
});

export { expensesFetchSchema, expensesSchema };
