import { z } from "zod";
import { getMediaFromName } from "./db.server";

const allowedFileTypes = ["video/mp4", "image/png", "image/jpeg"] as const;
const allowedTypes = ["img", "vid"] as const;
const MediaValidation = z.object({
    fileType: z.enum(allowedFileTypes),
    name: z.string().min(1,"Name cannot be Empty").refine(
        async (name) => {
            const exists = await getMediaFromName(name);
            return !exists;
        },
        { message: "Media with this name already exists" }
    ),
    type: z.enum(allowedTypes)  
})


export {MediaValidation}