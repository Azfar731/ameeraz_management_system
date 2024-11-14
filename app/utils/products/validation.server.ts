import { z } from "zod";

const ProductSchema = z.object({
    prod_name: z
        .string()
        .regex(
            /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/,
            "Name must only contain alphanumeric characters and single spaces.",
        )
        .min(1, "Name is required."),

    quantity: z
        .string()
        .transform((str) => parseInt(str))
        .refine((value) => !isNaN(value) && value > 0, {
            message: "Quantity must be greater than 0",
        }),
});

export { ProductSchema };
