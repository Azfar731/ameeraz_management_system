import { Form, useNavigation, useLoaderData } from "@remix-run/react";

import { LoaderFunctionArgs } from "@remix-run/node";
import { getClientTransactionsWithRelations } from "~/utils/clientTransaction/db.server";
import { getOperationalExpenses } from "~/utils/expenses/db.server";
import { getProductTransactionsWithRelations } from "~/utils/productTransaction/db.server";
import ClientTransactionsTable from "../transactions._index/ClientTransactionsTable";
import ProductTransactionTable from "../transactions.product-transactions/ProductTransactionTable";
import ExpensesTable from "../transactions.expenses/ExpensesTable";
import { calculateProductTransaction } from "~/utils/productTransaction/functions";
import { SalesValidation } from "~/utils/sales/validation.server";

export async function loader({ request }: LoaderFunctionArgs) {
  //get start_date and end_date params
  const searchParams = new URL(request.url).searchParams;
  const start_date_param = searchParams.get("start_date") || undefined;
  const end_date_param = searchParams.get("end_date") || undefined;

  const validation_result = SalesValidation.safeParse({
    start_date: start_date_param,
    end_date: end_date_param,
  });

  if (!validation_result.success) {
    return {
      errorMessages: validation_result.error.flatten().fieldErrors,
      start_date: undefined,
      end_date: undefined,
      client_transactions: [],
      product_transactions: [],
      operational_expenses: [],
    };
  }
  //   const client_transaction_balance =
  const validationData = validation_result.data;

  //get client transactions
  const client_transactions = await getClientTransactionsWithRelations({
    start_date: validationData.start_date,
    end_date: validationData.end_date,
  });
  //get product transactions
  const product_transactions = await getProductTransactionsWithRelations({
    start_date: validationData.start_date,
    end_date: validationData.end_date,
  });
  //get operational expenses
  const operational_expenses = await getOperationalExpenses({
    start_date: validationData.start_date,
    end_date: validationData.end_date,
  });

  return {
    client_transactions,
    product_transactions,
    operational_expenses,
    start_date: validationData.start_date!,
    end_date: validationData.end_date!,
    errorMessages: {},
  };
}

export default function SalesRoute() {
  const navigation = useNavigation();
  const {
    start_date,
    end_date,
    client_transactions,
    product_transactions,
    operational_expenses,
    errorMessages,
  } = useLoaderData<typeof loader>();

  const current_date = new Date().toISOString().split("T")[0];

  const { productsBought, productsSold } =
    calculateProductTransaction(product_transactions);

  const productsSoldTotal =
    productsSold.cashTransaction +
    productsSold.bankTransaction +
    productsSold.cardTransaction;
  const productsBoughtTotal =
    productsBought.cashTransaction +
    productsBought.bankTransaction +
    productsBought.cardTransaction;

  const clientTransactionsSum = client_transactions.reduce(
    (acc, tx) => acc + tx.amount_paid,
    0
  );

  const operationalExpensesSum = operational_expenses.reduce(
    (acc, tx) => acc + tx.amount_paid,
    0
  );
  return (
    <div className="m-8">
      <section>
        <Form method="get" className=" rounded w-1/2">
          <h2 className="text-3xl font-semibold text-gray-700 mt-6">
            Select Date Range
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
            className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
          />
          {errorMessages?.start_date && (
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
            className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
          />
          {errorMessages?.end_date && (
            <h2 className="text-red-500 font-semibold">
              {errorMessages.end_date[0]}
            </h2>
          )}
          <button
            type="submit"
            disabled={
              navigation.state === "submitting" ||
              navigation.state === "loading"
            }
            className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Fetch
          </button>
        </Form>
      </section>
      <section className="mt-4  text-xl font-semibold text-gray-800 mb-4">
        <h3>
          Starting Date:{" "}
          {start_date
            ? new Date(start_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </h3>
        <h3>
          Ending Date:{" "}
          {end_date
            ? new Date(end_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </h3>
      </section>
      <h3>
        Total Sales:{" "}
        {clientTransactionsSum +
          productsSoldTotal -
          (productsBoughtTotal + operationalExpensesSum)}{" "}
      </h3>
      <section className="mt-4">
        <h2 className="text-xl font-bold text-center">Client Transactions</h2>
        <h4>
          Total: {clientTransactionsSum}{" "}
          <ClientTransactionsTable transactions={client_transactions} />
        </h4>
      </section>

      <section className="mt-4">
        <h2 className="text-xl font-bold text-center">Product Transactions</h2>
        <h4>Products Sold: {productsSoldTotal} </h4>
        <h4>Products Bought: {productsBoughtTotal} </h4>
        <h4>Total: {productsSoldTotal - productsBoughtTotal} </h4>
        <ProductTransactionTable transactions={product_transactions} />
      </section>
      <section className="mt-4">
        <h2 className="text-xl font-bold text-center">Operational Expenses</h2>
        <h4>Total: {operationalExpensesSum} </h4>
        <ExpensesTable expenses={operational_expenses} />
      </section>
    </div>
  );
}

//extra functions

// async function get_client_transactions_balance({
//   start_date,
//   end_date,
// }: {
//   start_date: Date;
//   end_date: Date;
// }) {
//   const transactions = await getClientTransactions({
//     start_date,
//     end_date,
//   });

//   const { totalTransaction } = calculateClientTransaction(transactions);
//   return totalTransaction;
// }

// async function get_products_transaction_balance({
//   start_date,
//   end_date,
// }: {
//   start_date: Date;
//   end_date: Date;
// }) {
//   const transactions = await getProductTransactionsWithRelations({
//     start_date,
//     end_date,
//   });
//   const { productsSold, productsBought } =
//     calculateProductTransaction(transactions);
//   return {
//     products_sold_balance: productsSold.cashTransaction,
//     products_bought_balance: productsBought.cashTransaction,
//   };
// }

// async function get_operational_expenses_balance({
//   start_date,
//   end_date,
// }: {
//   start_date: Date;
//   end_date: Date;
// }) {
//   const transactions = await getOperationalExpenses({ start_date, end_date });
//   return calculateTotalExpenses(transactions);
// }
