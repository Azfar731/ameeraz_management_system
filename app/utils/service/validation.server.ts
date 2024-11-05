import { z } from "zod";

const serviceSchema = z.object({
    serv_name: z
        .string()
        .regex(
            /^[A-Za-z]+(?: [A-Za-z]+)*$/,
            "Name must only contain alphabets and a single space.",
        )
        .min(1, "Name is required."),

    serv_price: z
        .number()
        .int("Price must be an integer.")
        .min(0, "Price must be at least 0."),

    serv_category: z
        .string()
        .min(1, "Category id is required"),

    serv_status: z
        .boolean(),
});

export { serviceSchema };
