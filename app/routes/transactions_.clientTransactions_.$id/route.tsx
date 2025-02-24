import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { formatDate } from "shared/utilityFunctions";
import { getClientTransactionFromID } from "~/utils/clientTransaction/db.server";
import { ClientTransactionWithRelations } from "~/utils/clientTransaction/types";
import { generate_heading } from "~/utils/render_functions";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("NO ID provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const transaction = await getClientTransactionFromID({
    id,
    includeRecord: true,
  });
  if (!transaction) {
    throw new Response(`No transaction with id: ${id} exists`, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return { transaction };
}

export default function View_Client_Transaction() {
  const { transaction } = useLoaderData<{
    transaction: ClientTransactionWithRelations;
  }>();
  const client = transaction.record.client;
  const deal_records = transaction.record.deal_records;

  const render_transactions = () => {
    const rendered_transactions: JSX.Element[] = [];
    const related_transactions = transaction.record.transactions.filter(
      (trans) =>
        trans.client_transaction_id !== transaction.client_transaction_id
    );
    related_transactions.forEach((trans, index) => {
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
        to={`/transactions`}
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Client Transactions
      </Link>

      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Client Transaction Details
        </h1>

        <h3 className="font-medium text-gray-700">Date</h3>
        <h3 className="text-gray-600">{formatDate(transaction.created_at)}</h3>

        <h3 className="font-medium text-gray-700">Client Name</h3>
        <h3 className="text-gray-600">{`${client.client_fname} ${client.client_lname}`}</h3>

        <h3 className="font-medium text-gray-700">Client Mobile Number</h3>
        <h3 className="text-gray-600">{client.client_mobile_num}</h3>

        <h3 className="font-medium text-gray-700">Total Amount Paid</h3>
        <h3 className="text-gray-600">{transaction.amount_paid}</h3>

        <h3 className="font-medium text-gray-700">Mode of Payment</h3>
        <h3 className="text-gray-600">{transaction.mode_of_payment}</h3>

        <h2 className="col-span-2 text-xl font-semibold text-gray-800 mt-4 border-b pb-2">
          Service Record Details
        </h2>

        <h3 className="font-medium text-gray-700">Total Amount Charged</h3>
        <h3 className="text-gray-600">{transaction.record.total_amount}</h3>

        <h3 className="font-medium text-gray-700">Deals/services</h3>
        <h3 className="text-gray-600">
          {deal_records
            .map((deal_record) => deal_record.deal.deal_name)
            .join(",")}
        </h3>
        {transaction.record.transactions.length > 1 && (
          <>
            {generate_heading("Related Transactions", "Date", "Amount Paid")}
            {render_transactions()}
          </>
        )}
        <Link
          to={`update`}
          className="mt-6 w-1/3 bg-blue-500 hover:bg-blue-700 flex items-center justify-around text-white  font-bold py-2 px-4 rounded"
        >
          Edit <FaEdit />
        </Link>
      </div>
    </div>
  );
}
