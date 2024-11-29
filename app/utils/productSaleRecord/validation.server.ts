import { Product_Sale_Record, TransactionType } from "@prisma/client";
import { z } from "zod";
import { getTransactionOptions } from "../functions";
import { findClientByMobile } from "../client/db.server";
import { findVendorByMobileNumber } from "../vendors/db.server";
import { prisma_client } from "~/.server/db";
import { getProductFromId } from "../products/db.server";
import { ProductSaleRecordWithRelations } from "./types";
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
        .regex(
            /^0\d{10}$/,
            "Mobile number must be 11 digits and start with 0.",
        ),
    transaction_type: z.enum(["sold", "bought", "returned"]),

    products_quantity: z.array(
        z.object({
            product_id: z.string(),
            quantity: z.number().positive(),
        }),
    ),

    mode_of_payment: z.enum(["cash", "bank_transfer", "card"]),
})
    .refine((data) => data.amount_paid <= data.amount_charged, {
        message: "Amount paid must be less than or equal to amount charged",
        path: ["amount_paid"],
    });

const ProductSaleRecordUpdateSchema = (old_product_sale_record: ProductSaleRecordWithRelations) => {
    return z.object({
    id: z.string().min(1),
    total_amount: z
        .string()
        .transform((val) => parseInt(val))
        .refine((val) => !isNaN(val) && val >= 0, {
            message: "Total amount must be a non-negative number",
        }),
    mobile_num: z
        .string()
        .regex(
            /^0\d{10}$/,
            "Mobile number must be 11 digits and start with 0.",
        ),
    transaction_type: z.enum(["sold", "bought", "returned"]),

    products_quantity: z.array(
        z.object({
            product_id: z.string(),
            quantity: z.number().positive(),
        }),
    ).min(1),
    isClient: z.boolean(),
}).refine(async (data) => {
    if (data.isClient) {
        return await findClientByMobile(data.mobile_num);
    } else {
        return await findVendorByMobileNumber(data.mobile_num);
    }
}, {
    message: `Invalid mobile number`,
    path: ["mobile_num"],
}).refine(
    (data) =>
        data.isClient
            ? data.transaction_type === "sold" ||
                data.transaction_type === "returned"
            : data.transaction_type === "bought" ||
                data.transaction_type === "returned",
    {
        message: "Invalid transaction type",
        path: ["transaction_type"],
    },
).refine((data) => {
    const {transactions} = old_product_sale_record
    //sum amount_paid of all transactions
    const totalPaid = transactions.reduce(
        (sum, transaction) => sum + transaction.amount_paid,
        0,
    );
    return totalPaid <= data.total_amount;
}, {
    message:
        "Amount charged cannot be smaller than the total amount paid. Edit the transactions to fix this.",
    path: ["total_amount"],
}) .refine(async (data) => {
    //fetch product records from Product_Record_JT, and check if the quantity is enough if transaction_type is sold
    if(data.transaction_type === "sold") {
        const productRecords = old_product_sale_record.products;
        for (const new_product_quantity_record of data.products_quantity) {
            const old_product_quantity_record = productRecords.find((record) => record.prod_id === new_product_quantity_record.product_id);
            if(old_product_quantity_record && old_product_sale_record.transaction_type === "sold") {
                if((old_product_quantity_record.quantity + old_product_quantity_record.product.quantity)< new_product_quantity_record.quantity) {
                    return false;
                }
            }else if(!old_product_quantity_record && old_product_sale_record.transaction_type === "sold") {
                //fetch product and compare quantity
                const product = await getProductFromId({id: new_product_quantity_record.product_id});
                if(!product) {
                    throw new Error("Product not found in Product Sale Record Update validation")
                }
                if(product.quantity < new_product_quantity_record.quantity){
                    return false;
                }
            }
        }

    }
    return true;
})
};
export {
    productSaleRecordFetchSchema,
    productSaleRecordSchema,
    ProductSaleRecordUpdateSchema,
};
