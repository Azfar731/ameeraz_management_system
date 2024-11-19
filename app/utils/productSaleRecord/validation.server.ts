import { TransactionType } from "@prisma/client";
import { z } from "zod";
import { getTransactionOptions } from "../functions";

const validTransactionTypes: TransactionType[] = getTransactionOptions();

const productSaleRecordFetchSchema = z.object({
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

    transaction_type: z
        .array(z.string())
        .transform((arr) => {
            const filtered = arr.filter((item) => item.trim() !== "");
            return filtered.length > 0 ? filtered : undefined;
        })
        .optional(),

    products: z
        .array(z.string())
        .transform((arr) => {
            const filtered = arr.filter((item) => item.trim() !== "");
            return filtered.length > 0 ? filtered : undefined;
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
);


// .refine(
//     (array): array is TransactionType[] => array?.every((val) => validTransactionTypes.includes(val)),
//     {
//         message: "Invalid Transaction Type provided"
//     } 
// )


export { productSaleRecordFetchSchema };
