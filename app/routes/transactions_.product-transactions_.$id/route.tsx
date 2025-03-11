import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { FaEdit, FaExternalLinkAlt, FaLongArrowAltLeft } from "react-icons/fa";
import { formatDate } from "shared/utilityFunctions";
import { authenticate } from "~/utils/auth/functions.server";
import { getProductTransactionWithRelationsFromId } from "~/utils/productTransaction/db.server";
import { ProductTransactionWithRelations } from "~/utils/productTransaction/types";
import { generate_heading } from "~/utils/render_functions";

export async function loader({ request ,params }: LoaderFunctionArgs) {
    await authenticate({request, requiredClearanceLevel: 1 });
  
  const { id } = params;
  if (!id) {
    throw new Response("No ID provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const transaction = await getProductTransactionWithRelationsFromId(id);
  if (!transaction) {
    throw new Response(`No transaction with id: ${id} exists`, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return { transaction };
}

export default function View_Product_Transaction() {
  const { transaction } = useLoaderData<{
    transaction: ProductTransactionWithRelations;
  }>();

  const render_transactions = () => {
    const rendered_transactions: JSX.Element[] = [];
    const related_transactions = transaction.record.transactions.filter(
      (trans) => trans.product_trans_id !== transaction.product_trans_id
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
        to="/transactions/product-transactions"
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Product Transactions
      </Link>

      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Product Transaction Details
        </h1>

        <h3 className="font-medium text-gray-700">Date</h3>
        <h3 className="text-gray-600">{formatDate(transaction.created_at)}</h3>

        <h3 className="font-medium text-gray-700">{`${
          transaction.record.client ? "Client" : "Vendor"
        } Name`}</h3>
        <h3 className="text-gray-600">{`${
          transaction.record.client
            ? transaction.record.client.client_fname
            : transaction.record.vendor?.vendor_fname
        } ${
          transaction.record.client
            ? transaction.record.client.client_lname
            : transaction.record.vendor?.vendor_lname
        }`}</h3>

        <h3 className="font-medium text-gray-700">{`${
          transaction.record.client ? "Client" : "Vendor"
        } Mobile Number`}</h3>
        <h3 className="text-gray-600">
          {transaction.record.client
            ? transaction.record.client.client_mobile_num
            : transaction.record.vendor?.vendor_mobile_num}
        </h3>

        <h3 className="font-medium text-gray-700">Total Amount Paid</h3>
        <h3 className="text-gray-600">{transaction.amount_paid}</h3>

        <h3 className="font-medium text-gray-700">Mode of Payment</h3>
        <h3 className="text-gray-600">{transaction.mode_of_payment}</h3>

        <h2 className="col-span-2 text-xl font-semibold text-gray-800 mt-4 border-b pb-2">
          Service Record Details
        </h2>
        <h3 className="font-medium text-gray-700">View</h3>
        <Link
          to={`/products-sale-record/${transaction.record_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaExternalLinkAlt />
        </Link>

        <h3 className="font-medium text-gray-700">Transaction Type</h3>
        <h3 className="text-gray-600">{transaction.record.transaction_type}</h3>

        <h3 className="font-medium text-gray-700">Total Amount Charged</h3>
        <h3 className="text-gray-600">{transaction.record.total_amount}</h3>

        <h3 className="font-medium text-gray-700">Products</h3>
        <h3 className="text-gray-600">
          {transaction.record.products
            .map((record) => record.product.prod_name)
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
