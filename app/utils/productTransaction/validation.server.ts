import { z } from "zod";
import { prisma_client } from "~/.server/db";

const productTransactionFetchSchema = z.object({
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
            date.setHours(0, 0, 0, 0);
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

    transaction_types: z.array(z.enum(["sold", "bought", "returned"]))
        .optional(),
    payment_options: z.array(z.enum(["cash", "bank_transfer", "card"]))
        .optional(),
    products: z.array(z.string())
        .optional(),
    userType: z.enum(["client", "vendor"]).optional(),
}).refine((data) => !(data.client_mobile_num && data.vendor_mobile_num), {
    message: "Both client and vendor mobile numbers can't be provided at once",
    path: ["vendor_mobile_num"],
}).refine(
    (data) =>
        !(data.userType === "client" &&
            data.transaction_types?.includes("bought")),
    {
        message: "Client can't have bought transactions",
        path: ["transaction_types"],
    },
).refine(
    (data) =>
        !(data.userType === "vendor" &&
            data.transaction_types?.includes("sold")),
    {
        message: "Vendor can't have sold transactions",
        path: ["transaction_types"],
    },
).refine((data) => !(data.userType === "client" && data.vendor_mobile_num), {
    message: "Client can't have vendor mobile number",
    path: ["vendor_mobile_num"],
}).refine((data) => !(data.userType === "vendor" && data.client_mobile_num), {
    message: "Vendor can't have client mobile number",
    path: ["client_mobile_num"],
}).refine(async (data) => {
    //check whether client exists
    if (data.client_mobile_num) {
        return await prisma_client.client.findFirst({
            where: { client_mobile_num: data.client_mobile_num },
        });
    }
    return true;
}, {
    message: "Client does not exist",
    path: ["client_mobile_num"],
}).refine(async (data) => {
    //check whether vendor exists
    if (data.vendor_mobile_num) {
        return await prisma_client.vendor.findFirst({
            where: { vendor_mobile_num: data.vendor_mobile_num },
        });
    }
    return true;
}, {
    message: "Vendor does not exist",
    path: ["vendor_mobile_num"],
}).refine((data) => {
    if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date;
    }
    return true;
}, {
    message: "End date must be greater than start date",
    path: ["end_date"],
}).superRefine((data) => {
    if (
        !(data.start_date || data.end_date || data.client_mobile_num ||
            data.vendor_mobile_num || data.payment_options ||
            data.products || data.userType || data.transaction_types)
    ) {
        data.start_date = new Date();
    }

    if (data.start_date) {
        data.start_date.setHours(0, 0, 0, 0);
    }
    if (data.end_date) {
        data.end_date.setHours(23, 59, 59, 999);
    }
});

const productTransactionSchema = (maxAmount: number) =>
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
        mode_of_payment: z.enum(["cash", "bank_transfer", "card"]),
    });

export { productTransactionFetchSchema, productTransactionSchema };
