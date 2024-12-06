import { z } from "zod";
import { findClientByMobile } from "../client/db.server";

//  deal_ids,
// employee_ids,
// category_ids,
// client_mobile_num,
// start_date,
// end_date,

const ServiceSaleRecordFetchSchema = z.object({
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

    client_mobile_num: z
        .string()
        .regex(
            /^0\d{10}$/,
            "Mobile number must be 11 digits and start with 0.",
        )
        .optional(),

    category_ids: z.array(z.string()).optional(),
    employee_ids: z.array(z.string()).optional(),
    deal_ids: z.array(z.string()).optional(),
}).refine(
    (data) => {
        // Only perform the comparison if both dates are defined
        if (data.start_date && data.end_date) {
            return data.end_date >= data.start_date;
        }
        // If one or both dates are undefined, consider it valid
        return true;
    },
    {
        message: "End date must be greater than start date",
        path: ["end_date"],
    },
).refine(async (data) => {
    if (data.client_mobile_num) {
        return await findClientByMobile(data.client_mobile_num);
    }
    return true;
}, {
    message: "No client found with this mobile number",
    path: ["client_mobile_num"],
}).refine((data) => {
    if (data.end_date) {
        const currentDate = new Date();
        currentDate.setHours(23, 59, 59, 999);
        return data.end_date <= currentDate;
    }
    return true;
}, {
    message: "End date can't be greater than Today's Date",
    path: ["end_date"],
}).superRefine((data) => {
    if (
        !(data.start_date || data.end_date || data.client_mobile_num ||
            data.category_ids || data.employee_ids || data.deal_ids)
    ) {
        data.start_date = new Date();
        data.start_date.setHours(0, 0, 0, 0);
    }
});

export { ServiceSaleRecordFetchSchema };
