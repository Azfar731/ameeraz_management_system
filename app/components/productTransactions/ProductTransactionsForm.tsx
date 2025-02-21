import { useState } from "react";
import { Product_Transaction } from "@prisma/client";
import { ProductSaleRecordWithRelations } from "~/utils/productSaleRecord/types";
import { ProductTransactionErrorData } from "~/utils/productTransaction/types";
import { Form, useNavigation } from "@remix-run/react";
import Select from "react-select";
import { getAllPaymentMenuOptions, getSinglePaymentMenuOption } from "~/utils/functions";
import { SerializeFrom } from "@remix-run/node";
export default function ProductTransaction_Form({
  product_sale_record,
  transaction,
  errorMessages,
}: {
  product_sale_record: SerializeFrom<ProductSaleRecordWithRelations>;
  transaction?: SerializeFrom<Product_Transaction>;
  errorMessages?: ProductTransactionErrorData;
}) {
  const navigation = useNavigation();
  const remaining_amount =
    product_sale_record.total_amount -
    product_sale_record.transactions.reduce((sum, trans) => {
      return sum + trans.amount_paid;
    }, 0);

  const [amountPaid, setAmountPaid] = useState(
    transaction ? transaction.amount_paid : remaining_amount
  );

  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80 ">
      <div className="text-gray-700 mb-4">
        {`${product_sale_record.client ? "Client" : "Vendor"} Name: `}
        {product_sale_record.client
          ? `${product_sale_record.client.client_fname} ${product_sale_record.client.client_lname}`
          : `${product_sale_record.vendor?.vendor_fname} ${product_sale_record.vendor?.vendor_lname}`}
      </div>

      <div className="text-gray-700 mb-4">
        Total Amount: {product_sale_record.total_amount}
      </div>
      {transaction ? (
        <div className="text-gray-700 mb-4">
          Max Amount: {remaining_amount + transaction.amount_paid}
        </div>
      ) : (
        <div className="text-gray-700 mb-4">
          Remianing Amount: {remaining_amount}
        </div>
      )}
      <label
        htmlFor="amount_paid"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Amount Paid
      </label>
      <input
        type="number"
        name="amount_paid"
        id="amount_paid"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        value={amountPaid}
        min={0}
        onChange={(e) => setAmountPaid(parseInt(e.target.value))}
        required
      />
      {errorMessages?.amount_paid && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.amount_paid[0]}
        </h2>
      )}
      <label htmlFor="payment_mode">Mode of Payment</label>
      <Select
        options={getAllPaymentMenuOptions()}
        name="mode_of_payment"
        id="payment_mode"
        defaultValue={
          transaction
            ? getSinglePaymentMenuOption(transaction.mode_of_payment)
            : undefined
        }
      />
      {errorMessages?.mode_of_payment && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.mode_of_payment[0]}
        </h2>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          disabled={navigation.state === "loading" || navigation.state === "submitting"}
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {transaction ? "Update" : "Create"}
        </button>
      </div>
    </Form>
  );
}
