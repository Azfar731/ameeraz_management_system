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
    isClient: z.string().transform((val) => val === "true")
        .optional(),
}).refine((data) => !(data.client_mobile_num && data.vendor_mobile_num), {
    message: "Both client and vendor mobile numbers can't be provided at once",
    path: ["vendor_mobile_num"],
}).refine(
    (data) => !(data.isClient && data.transaction_types?.includes("bought")),
    {
        message: "Client can't have bought transactions",
        path: ["transaction_types"],
    },
).refine((data) => {
    if (data.isClient !== undefined) {
        return !(!(data.isClient) && data.transaction_types?.includes("sold"));
    }
    return true;
}, {
    message: "Vendor can't have sold transactions",
    path: ["transaction_types"],
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
})
    .refine(async (data) => {
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
                data.products || data.isClient !== undefined)
        ) {
            data.start_date = new Date();
        }
    });

export { productTransactionFetchSchema };
