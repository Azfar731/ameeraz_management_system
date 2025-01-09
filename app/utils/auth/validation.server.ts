import {z} from "zod";



const auth_schema = z.object({
    username: z.string().min(1, "Username is required."),
    password: z.string().min(1, "Password is required."),
});

export {auth_schema};