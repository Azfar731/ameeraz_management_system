import { z } from "zod";
import { PaymentModes } from "../types";
import { getPaymentOptions } from "../functions";
const validPaymentModes: PaymentModes[] = getPaymentOptions();

const clientTransactionFetchSchema = z.object({
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
).superRefine((data) => {
    if (
        !(data.start_date || data.end_date || data.mobile_num ||
            data.payment_options)
    ) {
        data.start_date = new Date();
        data.start_date.setHours(0, 0, 0, 0);
    }
});

const clientTransactionSchema = (maxAmount: number) =>
    z.object({
        amount_paid: z
            .string()
            .transform((amount) => parseInt(amount))
            .refine((amount) => amount > 0, {
                message: "Amount paid must be greater than 0",
            })
            .refine((amount) => amount <= maxAmount, {
                message:
                    `Amount paid can not be greater than Pending Amount. Pending amount is ${maxAmount}`,
            }),
        mode_of_payment: z
            .string()
            .refine(
                (mode) => validPaymentModes.includes(mode as PaymentModes),
                {
                    message: "Invalid payment mode",
                },
            )
            .transform((mode) => mode as PaymentModes),
    });

export { clientTransactionFetchSchema, clientTransactionSchema };
