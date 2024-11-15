import { prisma_client } from "~/.server/db";

// Fetch all operational expenses with optional filters for date range
const getOperationalExpenses = async ({
  start_date,
  end_date,
}: {
  start_date?: Date;
  end_date?: Date;
}) => {
  return await prisma_client.operational_Expenses.findMany({
    where: {
      created_at: {
        gte: start_date,
        lte: end_date,
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

// Fetch a single operational expense by ID
const getOperationalExpenseById = async (id: string) => {
  return await prisma_client.operational_Expenses.findFirst({
    where: { expense_id: id },
  });
};

// Create a new operational expense
const createOperationalExpense = async ({
  amount_paid,
  description,
}: {
  amount_paid: number;
  description: string;
}) => {
  return await prisma_client.operational_Expenses.create({
    data: {
      amount_paid,
      description,
    },
  });
};

// Update an existing operational expense
const updateOperationalExpense = async ({
  id,
  amount_paid,
  description,
}: {
  id: string;
  amount_paid: number;
  description: string;
}) => {
  return await prisma_client.operational_Expenses.update({
    where: { expense_id: id },
    data: {
      amount_paid,
      description,
    },
  });
};

// Delete an operational expense by ID
const deleteOperationalExpense = async (id: string) => {
  return await prisma_client.operational_Expenses.delete({
    where: { expense_id: id },
  });
};

export {
  getOperationalExpenses,
  getOperationalExpenseById,
  createOperationalExpense,
  updateOperationalExpense,
  deleteOperationalExpense,
};
