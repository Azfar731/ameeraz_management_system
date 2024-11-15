import { z } from "zod";

const vendorSchema = z.object({
  vendor_fname: z
    .string()
    .regex(/^[A-Za-z]+$/, "First name must only contain alphabets.")
    .min(1, "First name is required."),

  vendor_lname: z
    .string()
    .regex(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      "Last name must only contain alphabets and a single space."
    )
    .min(1, "Last name is required."),

  vendor_mobile_num: z
    .string()
    .regex(/^0\d{10}$/, "Mobile number must be 11 digits and start with 0."),
});

const fetchVendorSchema = z
  .object({
    vendor_fname: z
      .string()
      .regex(/^[A-Za-z]+$/, "First name must only contain alphabets.")
      .optional(),

    vendor_lname: z
      .string()
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        "Last name must only contain alphabets and a single space."
      )
      .optional(),

    vendor_mobile_num: z
      .string()
      .regex(/^0\d{10}$/, "Mobile number must be 11 digits and start with 0.")
      .optional(),
  })
  


export { vendorSchema, fetchVendorSchema };
