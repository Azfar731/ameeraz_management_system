import {z} from "zod"



const categorySchema = z.object({
    
    cat_name: z
      .string()
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        "Name must only contain alphabets and a single space."
      )
      .min(1, "Name is required."),
  
    
  });
  
export {categorySchema}