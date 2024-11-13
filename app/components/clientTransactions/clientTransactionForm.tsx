import { useState } from "react";
import { Form } from "@remix-run/react";
import { ServiceSaleRecordWithRelations } from "~/utils/saleRecord/types";
import Select from "react-select";
import { getPaymentMenuOptions } from "~/utils/functions";
export default function ClientTransaction_Form({
  service_sale_record,
}: //   errorMessage,
{
  service_sale_record: Omit<
    ServiceSaleRecordWithRelations,
    "employees" | "deals"
  >;
  //   errorMessage?: ClientTransactionError
}) {
  const remaining_amount =
    service_sale_record.total_amount -
    service_sale_record.transactions.reduce((sum, trans) => {
      return sum + trans.amount_paid;
    }, 0);
  const [amountPaid, setAmountPaid] = useState(remaining_amount);

  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80 ">
      <div className="text-gray-700 mb-4">
        Client Name:{" "}
        {`${service_sale_record.client.client_fname} ${service_sale_record.client.client_lname}`}
      </div>

      <div className="text-gray-700 mb-4">
        Total Amount: {service_sale_record.total_amount}
      </div>

      <div className="text-gray-700 mb-4">
        Remianing Amount: {remaining_amount}
      </div>

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
      <label htmlFor="payment_mode">Mode of Payment</label>
      <Select
        options={getPaymentMenuOptions()}
        name="mode_of_payment"
        id="payment_mode"
      />

      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create
        </button>
      </div>
    </Form>
  );
}
