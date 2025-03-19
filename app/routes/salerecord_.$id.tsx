import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useNavigation } from "@remix-run/react";
import { ServiceSaleRecordWithRelations } from "~/utils/serviceSaleRecord/types";
import { formatDate } from "shared/utilityFunctions";
import { generate_heading } from "~/utils/render_functions";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { getServiceSaleRecordFromId } from "~/utils/serviceSaleRecord/db.server";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });

  const { id } = params;
  if (!id) {
    throw new Response("No id Provided in the URL", {
      status: 400,
      statusText: "Bad Request: Missing ID parameter",
    });
  }
  const record = await getServiceSaleRecordFromId({
    id,
    includeClient: true,
    includeTransactions: true,
    includeEmployees: true,
    includeDeals: true,
  });
  if (record) {
    return { record };
  } else {
    throw new Response("Record with the specified Id doesn't exist", {
      status: 404,
      statusText: "Not Found",
    });
  }
}

export default function Record() {
  const { record } = useLoaderData<{
    record: ServiceSaleRecordWithRelations;
  }>();
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === "loading" || navigation.state === "submitting";

  const { client, deal_records, employees, transactions } = record;
  const renderered_deals: JSX.Element[] = [];

  deal_records.forEach((record, index) => {
    renderered_deals.push(
      <h4 key={`deal${index} name`}>{record.deal.deal_name}</h4>
    );
    renderered_deals.push(
      <h4 key={`deal${index} price`}>{record.quantity}</h4>
    );
  });

  const renderered_emp: JSX.Element[] = [];

  employees.forEach((record, index) => {
    renderered_emp.push(
      <h4
        key={`employee${index} name`}
      >{`${record.employee.emp_fname} ${record.employee.emp_lname}`}</h4>
    );
    renderered_emp.push(
      <h4 key={`employee${index} work`}>{record.work_share}</h4>
    );
  });

  const render_transactions = () => {
    const rendered_transactions: JSX.Element[] = [];

    transactions.forEach((trans, index) => {
      rendered_transactions.push(
        <h4 key={`transaction${index} date`}>
          {formatDate(trans.modified_at)}
        </h4>
      );
      rendered_transactions.push(
        <h4 key={`transaction${index} amount`}>{trans.amount_paid}</h4>
      );
    });

    return rendered_transactions;
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to={`/`}
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Service Sale Records
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Service Record Details
        </h1>
        <h3 className="font-medium text-gray-700">Date</h3>
        <h3 className="text-gray-600">{formatDate(record.created_at)}</h3>
        <h3 className="font-medium text-gray-700">Client Name</h3>
        <h3 className="text-gray-600">{`${client.client_fname} ${client.client_lname}`}</h3>

        <h3 className="font-medium text-gray-700">Client Mobile Number</h3>
        <h3 className="text-gray-600">{client.client_mobile_num}</h3>

        <h3 className="font-medium text-gray-700">Total Amount Charged</h3>
        <h3 className="text-gray-600">{record.total_amount}</h3>

        <h3 className="font-medium text-gray-700">Remaining amount</h3>
        <h3 className="text-gray-600">
          {record.total_amount -
            transactions.reduce(
              (sum, transaction) => sum + transaction.amount_paid,
              0
            )}
        </h3>
        {generate_heading("Deals/Services Taken", "Name", "Quantity")}
        {renderered_deals}

        {generate_heading("Employees", "Name", "Work Share")}
        {renderered_emp}

        {generate_heading("Transactions", "Date", "Amount Paid")}
        {render_transactions()}
        <button
          disabled={isNavigating}
          className="mt-6 w-1/3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Link
            to="update"
            className="flex items-center justify-around"
            aria-disabled={isNavigating}
          >
            Edit <FaEdit />
          </Link>
        </button>
      </div>
    </div>
  );
}
