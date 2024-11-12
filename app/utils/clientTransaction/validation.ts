import { z } from "zod";
import { PaymentModes } from "../types";
import { getPaymentOptions } from "../functions";
const validPaymentModes: PaymentModes[] = getPaymentOptions();

const clientTransactionFetchSchema = z.object({
    start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => new Date(str))
        .optional(),

    end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
        .transform((str) => new Date(str))
        .optional(),

    mobile_num: z
        .string()
        .regex(
            /^0\d{10}$/,
            "Mobile number must be 11 digits and start with 0.",
        )
        .optional(),

    payment_options: z
        .string()
        .transform((val) => val.split("|") as PaymentModes[])
        .refine((array) => array.length > 0, {
            message: "At least one payment method is required.",
        })
        .refine(
            (array): array is PaymentModes[] =>
                array.every((val) => validPaymentModes.includes(val)),
            {
                message: "Invalid payment option provided.",
            },
        )
        .optional(),
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
). superRefine((data) => {
    if(!(data.start_date ||data.end_date || data.mobile_num || data.payment_options)){
        data.start_date = new Date()
    }
})
export { clientTransactionFetchSchema };
