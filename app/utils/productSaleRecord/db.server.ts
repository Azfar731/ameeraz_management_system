import { Payment, TransactionType } from "@prisma/client";
import { prisma_client } from "~/.server/db";
import { ProductSaleRecordWithRelations } from "./types";

// Fetch all product sale records with optional filters for client, vendor, or transaction_type
const getProductSaleRecords = async ({
  client_mobile_num,
  vendor_mobile_num,
  transaction_types,
  start_date,
  end_date,
  products,
  payment_cleared,
}: {
  client_mobile_num?: string;
  vendor_mobile_num?: string;
  transaction_types?: TransactionType[];
  start_date?: Date;
  end_date?: Date;
  products?: string[];
  payment_cleared?: boolean;
}) => {
  return await prisma_client.product_Sale_Record.findMany({
    where: {
      transaction_type: transaction_types
        ? { in: transaction_types }
        : undefined,
      created_at: {
        gte: start_date,
        lte: end_date,
      },
      client: { client_mobile_num },

      vendor: { vendor_mobile_num },
      products: products
        ? {
          some: {
            prod_id: { in: products },
          },
        }
        : undefined,
      payment_cleared: payment_cleared,
    },
    include: {
      client: true,
      vendor: true,
      products: {
        include: {
          product: true,
        },
      },
      transactions: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

// Fetch a single product sale record by ID
const getProductSaleRecordById = async ({ id }: { id: string }) => {
  return await prisma_client.product_Sale_Record.findFirst({
    where: { product_record_id: id },
  });
};

const getProductSaleRecordByIdWithRelations = async (
  { id }: { id: string },
) => {
  return await prisma_client.product_Sale_Record.findFirst({
    where: { product_record_id: id },
    include: {
      client: true,
      vendor: true,
      products: {
        include: {
          product: true,
        },
      },
      transactions: true,
    },
  });
};

// Create a new product sale record
const createProductSaleRecord = async ({
  mobile_num,
  transaction_type,
  mode_of_payment,
  amount_charged,
  amount_paid,
  products_quantity,
  isClient,
}: {
  mobile_num: string;
  isClient: boolean;
  transaction_type: TransactionType;
  amount_charged: number;
  amount_paid: number;
  mode_of_payment: Payment;
  products_quantity: { product_id: string; quantity: number }[];
}) => {
  return await prisma_client.$transaction(async (prisma) => {
    // Step 1: Create the product sale record and connect products
    const productSaleRecord = await prisma.product_Sale_Record.create({
      data: {
        client: isClient
          ? {
            connect: { client_mobile_num: mobile_num },
          }
          : undefined,
        vendor: !isClient
          ? {
            connect: { vendor_mobile_num: mobile_num },
          }
          : undefined,
        transaction_type,
        payment_cleared: amount_charged === amount_paid,
        total_amount: amount_charged,
        transactions: {
          create: [
            {
              mode_of_payment,
              amount_paid,
            },
          ],
        },
        products: {
          create: products_quantity.map((product) => ({
            product: {
              connect: { prod_id: product.product_id },
            },
            quantity: product.quantity,
          })),
        },
      },
    });

    // Step 2: Update product quantities based on the transaction type
    await Promise.all(
      products_quantity.map((product) =>
        prisma.product.update({
          where: { prod_id: product.product_id },
          data: {
            quantity: transaction_type === "sold" ||
                (transaction_type === "returned" && !isClient)
              ? { decrement: product.quantity }
              : { increment: product.quantity },
          },
        })
      ),
    );

    return productSaleRecord; // Return the created product sale record
  });
};

// Update an existing product sale record
const updateProductSaleRecord = async ({
  id,
  mobile_num,
  transaction_type,
  total_amount,
  isClient,
  products_quantity,
  oldProductSaleRecord,
}: {
  id: string;
  mobile_num: string;
  transaction_type: TransactionType;
  total_amount: number;
  isClient: boolean;
  products_quantity: { product_id: string; quantity: number }[];
  oldProductSaleRecord: ProductSaleRecordWithRelations;
}) => {
  const { transactions: old_transactions, products: old_products_record } =
    oldProductSaleRecord;
  const paid_amount = old_transactions.reduce(
    (acc, transaction) => acc + transaction.amount_paid,
    0,
  );
  return await prisma_client.$transaction(async (prisma) => {
    //Step 1:revert the quantity changes of old product records
    await Promise.all(
      old_products_record.map((product_record) =>
        prisma.product.update({
          where: { prod_id: product_record.prod_id },
          data: {
            quantity: oldProductSaleRecord.transaction_type === "sold" ||
                (oldProductSaleRecord.transaction_type === "returned" &&
                  !isClient)
              ? { increment: product_record.quantity }
              : { decrement: product_record.quantity },
          },
        })
      ),
    );

    // Step 2: Delete associated records not present in products_quantity
    await prisma.product_Record_JT.deleteMany({
      where: {
        record_id: id,
        NOT: {
          prod_id: {
            in: products_quantity.map((product) => product.product_id),
          },
        },
      },
    });

    // Step 3: Update or create records as required
    return await prisma.product_Sale_Record.update({
      where: { product_record_id: id },
      data: {
        client: isClient
          ? { connect: { client_mobile_num: mobile_num } }
          : undefined,
        vendor: !isClient
          ? { connect: { vendor_mobile_num: mobile_num } }
          : undefined,
        transaction_type,
        payment_cleared: paid_amount === total_amount,
        total_amount,
        products: {
          upsert: products_quantity.map((product) => ({
            where: {
              record_id_prod_id: { record_id: id, prod_id: product.product_id },
            },
            update: {
              quantity: product.quantity,
              product: {
                update: {
                  quantity: transaction_type === "sold" ||
                      (transaction_type === "returned" && !isClient)
                    ? { decrement: product.quantity }
                    : { increment: product.quantity },
                },
              },
            },
            create: {
              product: { connect: { prod_id: product.product_id } },
              quantity: product.quantity,
            },
          })),
        },
      },
    });
  });
};

// Delete a product sale record by ID
const deleteProductSaleRecord = async (id: string) => {
  return await prisma_client.product_Sale_Record.delete({
    where: { product_record_id: id },
  });
};

export {
  createProductSaleRecord,
  deleteProductSaleRecord,
  getProductSaleRecordById,
  getProductSaleRecordByIdWithRelations,
  getProductSaleRecords,
  updateProductSaleRecord,
};
