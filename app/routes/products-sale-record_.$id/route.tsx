import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { formatDate } from "shared/utilityFunctions";
import {
  getProductSaleRecordById,
  getProductSaleRecordByIdWithRelations,
} from "~/utils/productSaleRecord/db.server";
import { ProductSaleRecordWithRelations } from "~/utils/productSaleRecord/types";
import { generate_heading } from "~/utils/render_functions";
import { FaLongArrowAltLeft, FaEdit } from "react-icons/fa";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Product sale record ID is required");
  }
  const productSaleRecord = await getProductSaleRecordByIdWithRelations({
    id,
  });
  if (!productSaleRecord) {
    throw new Error("Product sale record not found");
  }
  return { productSaleRecord };
}

export default function View_Product_Sale_Record() {
  const { productSaleRecord } = useLoaderData<{
    productSaleRecord: ProductSaleRecordWithRelations;
  }>();
  const { client, products, transactions, vendor } = productSaleRecord;
  const renderered_products: JSX.Element[] = [];

  products.forEach((product, index) => {
    renderered_products.push(
      <h4 key={`product${index} name`}>{product.product.prod_name}</h4>
    );
    renderered_products.push(
      <h4 key={`product${index} price`}>{product.product.prod_price}</h4>
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
        to="/products-sale-record"
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Product Records
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Product Record Details
        </h1>
        <h3 className="font-medium text-gray-700">Date</h3>
        <h3 className="text-gray-600">
          {formatDate(productSaleRecord.created_at)}
        </h3>
        {client && (
          <>
            <h3 className="font-medium text-gray-700">Client Name</h3>
            <h3 className="text-gray-600">{`${client.client_fname} ${client.client_lname}`}</h3>

            <h3 className="font-medium text-gray-700">Client Mobile Number</h3>
            <h3 className="text-gray-600">{client.client_mobile_num}</h3>
          </>
        )}
        {vendor && (
          <>
            <h3 className="font-medium text-gray-700">Vendor Name</h3>
            <h3 className="text-gray-600">{`${vendor.vendor_fname} ${vendor.vendor_lname}`}</h3>

            <h3 className="font-medium text-gray-700">Vendor Mobile Number</h3>
            <h3 className="text-gray-600">{vendor.vendor_mobile_num}</h3>
          </>
        )}
        <h3 className="font-medium text-gray-700">
          {productSaleRecord.transaction_type == "sold"
            ? "Total Amount Charged"
            : "Total amount Paid"}
        </h3>
        <h3 className="text-gray-600">{productSaleRecord.total_amount}</h3>

        <h3 className="font-medium text-gray-700">Remaining Amount</h3>
        <h3 className="text-gray-600">
          {productSaleRecord.total_amount -
            transactions.reduce(
              (sum, transaction) => sum + transaction.amount_paid,
              0
            )}
        </h3>
        {generate_heading("Products", "Name", "Price")}
        {renderered_products}
        {generate_heading("Transactions", "Date", "Amount Paid")}
        {render_transactions()}
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
