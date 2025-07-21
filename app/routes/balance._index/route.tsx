import { useLoaderData } from "@remix-run/react";
import {
  create_balance_record,
  getBalanceRecordByDate,
} from "~/utils/balance/db";
import { getClientTransactionsWithRelations } from "~/utils/clientTransaction/db.server";
import { getOperationalExpenses } from "~/utils/expenses/db.server";
import { getProductTransactionsWithRelations } from "~/utils/productTransaction/db.server";
import { calculateProductTransaction } from "~/utils/productTransaction/functions";
import ClientTransactionsTable from "../transactions._index/ClientTransactionsTable";
import ProductTransactionTable from "../transactions.product-transactions/ProductTransactionTable";
import ExpensesTable from "../transactions.expenses/ExpensesTable";
import { calculateBalance } from "~/utils/balance/functions";

export async function loader() {
  const date = new Date();
  const start_date = new Date(date.setHours(0, 0, 0, 0));
  const end_date = new Date(date.setHours(23, 59, 59, 999));
  const previousDay = new Date(date);
  previousDay.setDate(previousDay.getDate() - 1);

  let current_day_record = await getBalanceRecordByDate(start_date);
  if (!current_day_record) {
    current_day_record = await create_balance_record({ date: start_date });
  }

  const previous_day_record = await getBalanceRecordByDate(previousDay);
  let starting_balance = 0;
  if (previous_day_record) {
    starting_balance = previous_day_record.ending_balance;
  }
  //get client transactions
  const client_transactions = await getClientTransactionsWithRelations({
    start_date,
    end_date,
    payment_options: ["cash"],
  });
  //get product transactions
  const product_transactions = await getProductTransactionsWithRelations({
    start_date,
    end_date,
    payment_options: ["cash"],
  });
  //get operational expenses
  const operational_expenses = await getOperationalExpenses({
    start_date,
    end_date,
  });

  return {
    starting_balance,
    current_day_record,
    client_transactions,
    product_transactions,
    operational_expenses,
  };
}

export default function BalanceRouteIndex() {
  const date = new Date().toISOString().split("T")[0];
  const {
    client_transactions,
    product_transactions,
    operational_expenses,
    current_day_record,
    starting_balance,
  } = useLoaderData<typeof loader>();

  const { productsBought, productsSold } =
    calculateProductTransaction(product_transactions);

  const clientTransactionsSum = client_transactions.reduce(
    (acc, tx) => acc + tx.amount_paid,
    0
  );
  const operationalExpensesSum = operational_expenses.reduce(
    (acc, tx) => acc + tx.amount_paid,
    0
  );

  
  const balance =
    starting_balance + current_day_record.ending_balance +
    calculateBalance({
      clientTransactionsSum,
      operationalExpensesSum,
      productsSoldSum: productsSold.cashTransaction,
      productsBoughtSum: productsBought.cashTransaction,
    });
  return (
    <div className="m-4 px-16 py-8 border border-black rounded-lg">
      <section className="mt-4  text-xl font-semibold text-gray-800 mb-4">
        <h3>
          Date:{" "}
          {date
            ? new Date(date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </h3>
        <h3>Starting Balance: {starting_balance} </h3>
        <h3>Current Balance: {balance} </h3>
      </section>
      <section className="mt-4">
        <h2 className="text-xl font-bold text-center">Client Transactions</h2>
        <h4>
          Total: {clientTransactionsSum}{" "}
          <ClientTransactionsTable transactions={client_transactions} />
        </h4>
      </section>

      <section className="mt-4">
        <h2 className="text-xl font-bold text-center">Product Transactions</h2>
        <h4>Products Sold: {productsSold.cashTransaction} </h4>
        <h4>Products Bought: {productsBought.cashTransaction} </h4>
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
