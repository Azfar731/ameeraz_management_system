import {z} from "zod"



const clientSchema = z.object({
    client_fname: z
      .string()
      .regex(/^[A-Za-z]+$/, "First name must only contain alphabets.")
      .min(1, "First name is required."),
  
    client_lname: z
      .string()
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        "Last name must only contain alphabets and a single space."
      )
      .min(1, "Last name is required."),
  
    client_mobile_num: z
      .string()
      .regex(/^0\d{10}$/, "Mobile number must be 11 digits and start with 0."),
  
    client_area: z.string().min(1, "Area is required."),
    subscribed: z.enum(["true","false"])
  });

const partialClientSchema = clientSchema.omit({ client_area: true }).partial()
  
const fetchClientSchema = partialClientSchema.extend({
  client_areas: z.array(z.string()).optional()
})

export {clientSchema, fetchClientSchema}