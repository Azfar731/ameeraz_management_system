import { Payment, TransactionType } from "@prisma/client";
import { prisma_client } from "~/.server/db";

// Fetch all product sale records with optional filters for client, vendor, or transaction_type
const getProductSaleRecords = async ({
  client_mobile_num,
  vendor_mobile_num,
  transaction_types,
  start_date,
  end_date,
  products,
}: {
  client_mobile_num?: string;
  vendor_mobile_num?: string;
  transaction_types?: TransactionType[];
  start_date?: Date;
  end_date?: Date;
  products?: string[];
}) => {
  return await prisma_client.product_Sale_Record.findMany({
    where: {
      transaction_type: transaction_types
        ? { in: transaction_types }
        : undefined,
      created_at: {
        gte: start_date || undefined,
        lte: end_date || undefined,
      },
      client: client_mobile_num
        ? {
          client_mobile_num: client_mobile_num,
        }
        : undefined,
      vendor: vendor_mobile_num
        ? {
          vendor_mobile_num: vendor_mobile_num,
        }
        : undefined,
      products: products
        ? {
          some: {
            prod_id: { in: products },
          },
        }
        : undefined,
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
const getProductSaleRecordById = async ({
  id,
  includeRelations = false,
}: {
  id: string;
  includeRelations?: boolean;
}) => {
  return await prisma_client.product_Sale_Record.findFirst({
    where: { product_record_id: id },
    include: includeRelations
      ? {
        client: true,
        vendor: true,
        products: {
          include: {
            product: true,
          },
        },
        transactions: true,
      }
      : undefined,
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
}: {
  mobile_num: string;
 
  transaction_type: TransactionType;
  amount_charged: number;
  amount_paid: number;
  mode_of_payment: Payment;
  products_quantity: { product_id: string; quantity: number }[];
}) => {
  return await prisma_client.product_Sale_Record.create({
    data: {
      client: transaction_type === "sold" || transaction_type === "returned"
        ? {
          connect: { client_mobile_num: mobile_num },
        }
        : undefined,
      vendor: transaction_type === "bought"
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
};

// Update an existing product sale record
const updateProductSaleRecord = async ({
  id,
  client_id,
  vendor_id,
  transaction_type,
  payment_cleared,
  total_amount,
}: {
  id: string;
  client_id?: string;
  vendor_id?: string;
  transaction_type?: TransactionType;
  payment_cleared?: boolean;
  total_amount?: number;
}) => {
  return await prisma_client.product_Sale_Record.update({
    where: { product_record_id: id },
    data: {
      client_id,
      vendor_id,
      transaction_type,
      payment_cleared,
      total_amount,
    },
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
  getProductSaleRecords,
  updateProductSaleRecord,
};
