import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { getTheme } from "@table-library/react-table-library/baseline";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { formatDate, formatDateToISO } from "shared/utilityFunctions";
import { getOperationalExpenses } from "~/utils/expenses/db.server";
import { Operational_Expenses } from "@prisma/client";
import { expensesFetchSchema } from "~/utils/expenses/validation.server";
import { setSearchParameters } from "~/utils/functions";
import { FaExternalLinkAlt, FaPlus } from "react-icons/fa";
import { ExpenseDateErrors } from "~/utils/expenses/types";

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
  console.log("Expenses: ", expenses);
  const current_date = formatDateToISO(new Date());

  const nodes = [...expenses];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Date",
      renderCell: (item: Operational_Expenses) => formatDate(item.created_at),
    },
    {
      label: "Amount Paid",
      renderCell: (item: Operational_Expenses) => item.amount_paid,
    },
    {
      label: "Description",
      renderCell: (item: Operational_Expenses) => item.description,
    },
    {
      label: "View",
      renderCell: (item: Operational_Expenses) => (
        <Link to={`${item.expense_id}`}>
          {" "}
          <FaExternalLinkAlt />{" "}
        </Link>
      ),
    },
  ];

  const theme = useTheme([
    getTheme(),
    {
      HeaderRow: `
        background-color: #eaf5fd;
      `,
      Row: `
        &:nth-of-type(odd) {
          background-color: #d2e9fb;
        }

        &:nth-of-type(even) {
          background-color: #eaf5fd;
        }
      `,
    },
  ]);

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
          <CompactTable columns={COLUMNS} data={data} theme={theme} />
        </div>
      </div>
    </div>
  );
}
