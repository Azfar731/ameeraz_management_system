import { z } from "zod";

export const fetchLogsSchema = z.object({
    start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => {
            const date = new Date(str);
            date.setHours(0, 0, 0, 0);
            return date;
        })
        .optional(),
    end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => {
            const date = new Date(str);
            date.setHours(23, 59, 59, 999);
            return date;
        })
        .optional(),
    userId: z.string().optional(),
    userName: z.string().regex(
        /^[A-Za-z0-9]+$/,
        "User name must only contain alphabets and digits.",
    ).optional(),
    log_type: z.array(z.enum([
        "loggedIn",
        "loggedOut",
        "create",
        "read",
        "update",
        "delete",
    ])).optional(),
}).refine(
    (data) => {
        // Only perform the comparison if both dates are defined
        if (data.start_date && data.end_date) {
            return data.end_date >= data.start_date;
        }
        // If one or both dates are undefined, consider it valid
        return true;
    },
).superRefine((data) => {
    if (
        !(data.start_date || data.end_date || data.userId || data.userName ||
            data.log_type)
    ) {
        data.start_date = new Date();
        data.start_date.setHours(0, 0, 0, 0);
    }
});
