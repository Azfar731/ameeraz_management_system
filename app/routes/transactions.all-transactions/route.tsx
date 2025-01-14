import { Operational_Expenses } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getClientTransactions } from "~/utils/clientTransaction/db.server";
import { ClientTransactionWithRelations } from "~/utils/clientTransaction/types";
import { getOperationalExpenses } from "~/utils/expenses/db.server";
import { expensesFetchSchema } from "~/utils/expenses/validation.server";
import { getProductTransactions } from "~/utils/productTransaction/db.server";
import { ProductTransactionWithRelations } from "~/utils/productTransaction/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const { start_date, end_date } = fetchSearchParams(searchParams);

  const validationResult = expensesFetchSchema.safeParse({
    start_date,
    end_date,
  });
  if (!validationResult.success) {
    return {
      errorMessages: validationResult.error.flatten().fieldErrors,
      operational_expenses: [],
      product_transactions: [],
      client_transactions: [],
    };
  }

  const operational_expenses = await getOperationalExpenses(
    validationResult.data
  );
  const product_transactions = await getProductTransactions(
    validationResult.data
  );
  const client_transactions = await getClientTransactions(
    validationResult.data
  );
  return {
    operational_expenses,
    product_transactions,
    client_transactions,
    errorMessages: [],
  };
}

function fetchSearchParams(searchParams: URLSearchParams) {
  for (const [key, value] of searchParams.entries()) {
    if (value === "") {
      searchParams.delete(key);
    }
  }

  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;

  return { start_date, end_date };
}

export default function All_Transactions() {
  const { operational_expenses, product_transactions, client_transactions, errorMessages } =
  useLoaderData<{client_transactions: ClientTransactionWithRelations[], product_transactions:ProductTransactionWithRelations[], operational_expenses: Operational_Expenses[] } >();



}
