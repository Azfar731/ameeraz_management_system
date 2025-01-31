import { z } from "zod";

const WhatsappTemplateDataValidation = z.object({
    template_name: z.string().min(1).regex(
        /^[A-Za-z0-9_]+$/,
        "Template name must only contain alphanumeric character and underscore.",
    ),
    header_type: z.enum(["none", "image", "text", "video"]),
    header_value: z.string().min(1).optional(),
    variables_array: z.array(
        z.object({
            key: z.string().min(1, "Variable key(name) cannot be empty"),
            value: z.string().min(1, "Variable value cannot be empty"),
        }),
    ).optional(), // Allows an empty array
    client_batch: z.string()
        .transform((str) => Number(str)) // Convert string to number
        .refine((num) => !isNaN(num) && num > 0, {
            message: "Client batch must be a valid number greater than 0",
        }),
});

export { WhatsappTemplateDataValidation };
