import { Form, useNavigation } from "@remix-run/react";
import { Operational_Expenses } from "@prisma/client";
import { ExpenseErrors } from "~/utils/expenses/types";

export default function Expense_Form({
  expense,
  errorMessages,
}: {
  expense?: Operational_Expenses;
  errorMessages?: ExpenseErrors;
}) {
  const navigation = useNavigation();
  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80">
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {expense ? "Update Expense" : "Register Expense"}
        </h1>
      </div>
      <label
        htmlFor="amount_paid"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Amount Paid
      </label>
      <input
        type="number"
        name="amount_paid"
        id="amount_paid"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Enter amount"
        min={1}
        defaultValue={expense?.amount_paid}
        required
      />
      {errorMessages?.amount_paid && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.amount_paid[0]}
        </h2>
      )}
      <label
        htmlFor="description"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Description
      </label>
      <textarea
        name="description"
        id="description"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Enter a brief description"
        defaultValue={expense?.description}
        required
      />
      {errorMessages?.description && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.description[0]}
        </h2>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          disabled={
            navigation.state === "loading" || navigation.state === "submitting"
          }
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {expense ? "Update" : "Register"}
        </button>
      </div>
    </Form>
  );
}
