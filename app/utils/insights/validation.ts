import { z } from "zod";

const InsightValidation = z.object({
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
});

const ClientInsightValidation = InsightValidation.refine(
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
).refine((data) => {
    if (data.end_date && !data.start_date) {
        return false;
    }
    return true;
}, {
    message: "Start date is required if end date is provided",
    path: ["start_date"],
}).superRefine((data) => {
    if (
        !data.start_date
    ) {
        const now = new Date();
        data.start_date = new Date(now.getFullYear(), now.getMonth(), 1);
        data.start_date.setHours(0, 0, 0, 0);
    }
    if (!data.end_date) {
        data.end_date = new Date();
        data.end_date.setHours(23, 59, 59, 999);
    }
});

const DealsInsightValidation = InsightValidation.extend({
    get_all: z.string().transform((val) => val === "true"),
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
).refine((data) => {
    if (data.end_date && !data.start_date) {
        return false;
    }
    return true;
}, {
    message: "Start date is required if end date is provided",
    path: ["start_date"],
}).superRefine((data) => {
    if (
        !data.start_date && !data.end_date
    ) {
        const now = new Date();
        data.start_date = new Date(now.getFullYear(), now.getMonth(), 1);
        data.start_date.setHours(0, 0, 0, 0);
        data.end_date = new Date();
        data.end_date.setHours(23, 59, 59, 999);
    }
});

export { ClientInsightValidation, DealsInsightValidation };
