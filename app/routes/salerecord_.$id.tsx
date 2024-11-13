import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ServiceSaleRecordWithRelations } from "~/utils/saleRecord/types";
import { formatDate } from "shared/utilityFunctions";
import { generate_heading } from "~/utils/render_functions";
import { getServiceSaleRecordFromId } from "~/utils/saleRecord/db.server";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No id Provided in the URL");
  }
  const record = await getServiceSaleRecordFromId({
    id,
    includeClient: true,
    includeTransactions: true,
    includeEmployees: true,
    includeDeals: true
  });
  if (record) {
    return { record };
  } else {
    throw new Error("Record with the specified Id doesn't exist");
  }
}

export default function Record() {
  const { record } = useLoaderData<{
    record: ServiceSaleRecordWithRelations;
  }>();
  const { client, deals, employees, transactions } = record;
  const renderered_deals: JSX.Element[] = [];

  deals.forEach((deal, index) => {
    renderered_deals.push(<h4 key={`deal${index} name`}>{deal.deal_name}</h4>);
    renderered_deals.push(
      <h4 key={`deal${index} price`}>{deal.deal_price}</h4>
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
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 ">
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Service Record Details
        </h1>
        <h3 className="font-medium text-gray-700">Client Name</h3>
        <h3 className="text-gray-600">{`${client.client_fname} ${client.client_lname}`}</h3>

        <h3 className="font-medium text-gray-700">Client Mobile Number</h3>
        <h3 className="text-gray-600">{client.client_mobile_num}</h3>

        <h3 className="font-medium text-gray-700">Total Amount Charged</h3>
        <h3 className="text-gray-600">{record.total_amount}</h3>

        {generate_heading("Deals/Services Taken", "Name", "Price")}
        {renderered_deals}

        {generate_heading("Employees", "Name", "Work Share")}
        {renderered_emp}

        {generate_heading("Transactions", "Date", "Amount Paid")}
        {render_transactions()}

        <Link
          to="/"
          className="text-blue-500 hover:text-blue-700 underline underline-offset-2 font-medium transition duration-300 col-span-2 pt-8"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
}
