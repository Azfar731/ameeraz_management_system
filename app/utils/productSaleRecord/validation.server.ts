import { TransactionType } from "@prisma/client";
import { z } from "zod";
import { getTransactionOptions } from "../functions";

const validTransactionTypes: TransactionType[] = getTransactionOptions();

const productSaleRecordFetchSchema = z.object({
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
            date.setHours(24, 59, 59, 999);
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

    vendor_mobile_num: z
        .string()
        .regex(
            /^0\d{10}$/,
            "Mobile number must be 11 digits and start with 0.",
        )
        .optional(),

    transaction_types: z
        .string()
        .transform((val) => val.split("|") as TransactionType[])
        .refine((array) => array.length > 0, {
            message: "Transaction type can't be an empty string",
        })
        .refine(
            (array): array is TransactionType[] => {
                if (array) {
                    return array.every((val) =>
                        validTransactionTypes.includes(val as TransactionType)
                    );
                } else {
                    return true;
                }
            },
            {
                message: "Invalid Transaction Type provided",
            },
        )
        .optional(),

    products: z
        .string()
        .transform((val) => val.split("|"))
        .refine((array) => array.length > 0, {
            message: "Products can't be an empty string ",
        })
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
        !(data.start_date || data.end_date || data.products ||
            data.transaction_types || data.client_mobile_num ||
            data.vendor_mobile_num)
    ) {
        data.start_date = new Date();
        data.start_date.setHours(0, 0, 0, 0);
    }
});

const productSaleRecordSchema = z.object({
    amount_charged: z.number().nonnegative(),
    amount_paid: z.number().nonnegative(),
    mobile_num: z
        .string()
        .regex(/^0\d{10}$/, "Mobile number must be 11 digits and start with 0."),
    transaction_type: z.enum(["sold", "bought", "returned"]),

    products_quantity: z.array(
        z.object({
            product_id: z.string(),
            quantity: z.number().positive(),
        }),
    ),

    mode_of_payment: z.enum(["cash", "bank_transfer", "card"]),
});

export { productSaleRecordFetchSchema, productSaleRecordSchema };
