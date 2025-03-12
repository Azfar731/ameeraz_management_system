import { Operational_Expenses } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { formatDateToISO } from "shared/utilityFunctions";
import { getClientTransactions } from "~/utils/clientTransaction/db.server";
import { ClientTransactionWithRelations } from "~/utils/clientTransaction/types";
import { getOperationalExpenses } from "~/utils/expenses/db.server";
import { expensesFetchSchema } from "~/utils/expenses/validation.server";
import { getProductTransactions } from "~/utils/productTransaction/db.server";
import { ProductTransactionWithRelations } from "~/utils/productTransaction/types";
import ExpensesTable from "../transactions.expenses/ExpensesTable";
import ProductTransactionTable from "../transactions.product-transactions/ProductTransactionTable";
import ClientTransactionsTable from "../transactions._index/ClientTransactionsTable";
import { authenticate } from "~/utils/auth/functions.server";
export async function loader({ request }: LoaderFunctionArgs) {

  await authenticate({request, requiredClearanceLevel: 1 });

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
  const {
    operational_expenses,
    product_transactions,
    client_transactions,
    errorMessages,
  } = useLoaderData<{
    client_transactions: ClientTransactionWithRelations[];
    product_transactions: ProductTransactionWithRelations[];
    operational_expenses: Operational_Expenses[];
    errorMessages: { start_date: string[]; end_date: string[] };
  }>();

  const current_date = formatDateToISO(new Date());
  return (
    <div className="mt-8">
      <Form method="get" className="bg-white rounded w-1/2">
        <h2 className="text-3xl font-semibold text-gray-700 mt-6">
          Search Records
        </h2>
        <label
          htmlFor="start_date"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Starting Date
        </label>
        <input
          id="start_date"
          name="start_date"
          aria-label="Date"
          type="date"
          max={current_date}
          className="mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        />
        {errorMessages.start_date && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.start_date[0]}
          </h2>
        )}
        <label
          htmlFor="end_date"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Ending Date
        </label>
        <input
          id="end_date"
          name="end_date"
          aria-label="Date"
          type="date"
          max={current_date}
          className="mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        />
        {errorMessages.end_date && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.end_date[0]}
          </h2>
        )}
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Fetch
        </button>
      </Form>

      <div className="w-full flex justify-center items-center mt-6">
        <h1 className="font-semibold text-3xl text-gray-700">
          Client Transactions
        </h1>
      </div>
      <div className="mt-6">
        <ClientTransactionsTable transactions={client_transactions} />
      </div>
      <div className="w-full flex justify-center items-center mt-6">
        <h1 className="font-semibold text-3xl text-gray-700">
          Product Transactions
        </h1>
      </div>
      <div className="mt-6">
        <ProductTransactionTable transactions={product_transactions} />
      </div>
      <div className="w-full flex justify-center items-center mt-6">
        <h1 className="font-semibold text-3xl text-gray-700">
          Operational Expenses
        </h1>
      </div>
      <div className="mt-6">
        <ExpensesTable expenses={operational_expenses} />
      </div>
    </div>
  );
}
