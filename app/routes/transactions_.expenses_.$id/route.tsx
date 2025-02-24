import { Operational_Expenses } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { getOperationalExpenseById } from "~/utils/expenses/db.server";
import { formatDate } from "shared/utilityFunctions";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in URL", {
      status: 400,
      statusText: "Bad Request"
    });
  }
  const expense = await getOperationalExpenseById(id);
  if (!expense) {
    throw new Response(`Expense with id:${id} not found`, {
      status: 404,
      statusText: "Not Found"
    });
  }
  return { expense };
}

export default function View_Expense() {
  const { expense } = useLoaderData<{ expense: Operational_Expenses }>();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to={"/transactions/expenses"}
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Expenses
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2">
          Expense Details
        </h1>
        <h3 className="font-medium text-gray-700">Amount Paid</h3>
        <h3 className="text-gray-600">{expense.amount_paid}</h3>

        <h3 className="font-medium text-gray-700">Description</h3>
        <h3 className="text-gray-600">{expense.description}</h3>

        <h3 className="font-medium text-gray-700">Created At</h3>
        <h3 className="text-gray-600">{formatDate(expense.created_at)}</h3>

        <Link
          to={`update`}
          className="mt-6 w-1/3 bg-blue-500 hover:bg-blue-700 flex items-center justify-around text-white font-bold py-2 px-4 rounded"
        >
          Edit <FaEdit />
        </Link>
      </div>
    </div>
  );
}
