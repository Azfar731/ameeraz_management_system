import { z } from "zod";

const employeeSchema = z.object({
    emp_fname: z
        .string()
        .regex(/^[A-Za-z]+$/, "First name must only contain alphabets.")
        .min(1, "First name is required."),

    emp_lname: z
        .string()
        .regex(
            /^[A-Za-z]+(?: [A-Za-z]+)*$/,
            "Last name must only contain alphabets and a single space.",
        )
        .min(1, "Last name is required."),

    emp_mobile_num: z
        .string()
        .regex(
            /^0\d{10}$/,
            "Mobile number must be 11 digits and start with 0.",
        ),
    base_salary: z
        .number()
        .int("Base salary must be an integer.")
        .min(0, "Base salary must be at least 0."),

    percentage: z
        .number()
        .int("Percentage must be an integer.")
        .min(0, "Percentage must be at least 0.")
        .max(100, "Percentage must not exceed 100."),

    emp_status: z.boolean(),
});

export { employeeSchema };
