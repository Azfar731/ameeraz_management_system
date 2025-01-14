// Expenses.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { formatDateToISO } from "shared/utilityFunctions";
import { getOperationalExpenses } from "~/utils/expenses/db.server";
import { Operational_Expenses } from "@prisma/client";
import { expensesFetchSchema } from "~/utils/expenses/validation.server";
import { setSearchParameters } from "~/utils/functions";
import { FaPlus } from "react-icons/fa";
import { ExpenseDateErrors } from "~/utils/expenses/types";
import CompactTableComponent from "./ExpensesTable";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;

  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;

  const validationResult = expensesFetchSchema.safeParse({
    start_date,
    end_date,
  });
  if (!validationResult.success) {
    return {
      errorMessages: validationResult.error.flatten().fieldErrors,
      expenses: [],
    };
  }

  const expenses = await getOperationalExpenses(validationResult.data);

  return { expenses, errorMessages: {} };
}

export default function Expenses() {
  const [, setSearchParams] = useSearchParams();
  const { expenses, errorMessages } = useLoaderData<{
    expenses: Operational_Expenses[];
    errorMessages: ExpenseDateErrors;
  }>();
  const current_date = formatDateToISO(new Date());

  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;

    setSearchParameters({ start_date, end_date }, setSearchParams);
  };

  return (
    <div className="mt-8">
      <div className="w-full flex justify-center items-center">
        <h1 className="font-semibold text-3xl text-gray-700">
          Operational Expenses
        </h1>
      </div>
      <Form
        method="get"
        className="bg-white rounded w-1/2"
        onSubmit={handleSubmit}
      >
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
      <div className="mt-20">
        <Link
          to="create"
          className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Create Transaction <FaPlus />
        </Link>
        <div className="mt-6">
          <CompactTableComponent expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
