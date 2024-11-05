import { z } from "zod";

const dealSchema = z.object({
    deal_name: z
        .string()
        .regex(
            /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/,
            "Name must only contain alphanumeric characters and single spaces.",
        )
        .min(1, "Name is required."),

    deal_price: z
        .string()
        .transform((value) => parseFloat(value))
        .refine((value) => !isNaN(value) && value > 0, {
            message: "Price must be a number greater than 0.",
        }),

    services: z
        .string()
        .transform((value) => value.split("|"))
        .refine((array) => array.length > 0, {
            message: "At least one service is required.",
        }),
    activate_from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => new Date(str)),
    activate_till: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => new Date(str))
        
}).refine((data) => data.activate_from < data.activate_till, {
    message: "activate_from must be before activate_till.",
    path: ['activate_till'], // Attach the error to 'activate_till'
});

export { dealSchema };
