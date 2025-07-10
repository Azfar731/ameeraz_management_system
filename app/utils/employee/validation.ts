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


const employeeDashboardSchema = z.object({
      start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => {
            const date = new Date(str);
            date.setHours(0, 0, 0, 0);
            return date;
        })
        .optional(),

    end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => {
            const date = new Date(str);
            date.setHours(23, 59, 59, 999);
            return date;
        })
        .optional(),
    selected_active_emp: z
        .array(z.string()),
        
    selected_inActive_emp: z
        .array(z.string()),
        
}).refine((data) => {
    if ((data.start_date && !data.end_date) || (!data.start_date && data.end_date)) {
        return false;
    }
    return true;
}, {
    message: "Both start date and end date must be provided together.",
    path: [ "end_date"],
}).superRefine(data => {
    if (!data.start_date && !data.end_date) {
    const now = new Date();
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    data.start_date = firstDayPrevMonth;
    data.end_date = lastDayPrevMonth;
    }
});


export { employeeSchema, employeeDashboardSchema };
