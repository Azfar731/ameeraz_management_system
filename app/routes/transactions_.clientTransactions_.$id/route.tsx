import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getClientTransactionFromID } from "~/utils/clientTransaction/db.server";
import { ClientTransactionWithRelations } from "~/utils/clientTransaction/types";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("NO ID providedin the URL");
  }
  const transaction = getClientTransactionFromID({ id, includeRecord: true });
  if (!transaction) throw new Error(`No transaction with id: ${id} exists`);

  return { transaction };
}

export default function View_Client_Transaction() {
  const { transaction } = useLoaderData<{
    transaction: ClientTransactionWithRelations[];
  }>();
  console.log(transaction);

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
