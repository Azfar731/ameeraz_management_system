import {z} from "zod";

const TemplateSchema = z.object({
    name: z.string().min(1).regex(
        /^[A-Za-z0-9_]+$/,
        "Template name must only contain alphanumeric character and underscore.",
    ),
    header_type: z.enum(["none", "image", "text", "video"]),
    header_var_name: z.string().min(1).regex(
        /^[A-Za-z0-9_]+$/,
        "Header variable name must only contain alphanumeric character and underscore.",
    ),
    variables: z.array(
        z.object({
            name: z.string().min(1, "Variable name cannot be empty"),
            type: z.enum(["text", "currency","date_time"], {
                errorMap: () => ({ message: "Type must be either 'text' or 'currency'." })
            }),
            input_required: z.enum(["true", "false"], {
                errorMap: () => ({ message: "Input Required must be either 'true' or 'false'." })
            })
        })
    ).optional() // Allows an empty array
});



export {TemplateSchema}