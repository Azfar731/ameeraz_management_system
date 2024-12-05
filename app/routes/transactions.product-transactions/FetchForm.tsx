import { Payment, Product, TransactionType } from "@prisma/client";
import { Form, useSearchParams } from "@remix-run/react";
import Select from "react-select";
import { formatDateToISO } from "shared/utilityFunctions";
import {
  getAllPaymentMenuOptions,
  getAllTransactionMenuOptions,
  getSinglePaymentMenuOption,
  getSingleTransactionMenuOption,
} from "~/utils/functions";
import { ProductTransactionFetchErrorData } from "~/utils/productTransaction/types";
export default function Product_Transaction_FetchForm({
  products,
  errorMessages,
}: {
  products: Product[];
  errorMessages: ProductTransactionFetchErrorData;
}) {
  const [searchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams);

  // Remove keys with empty values
  for (const [key, value] of newSearchParams.entries()) {
    if (value === "") {
      newSearchParams.delete(key);
    }
  }
  //searchParam values
  const start_date_default = newSearchParams.get("start_date");
  const end_date_default = newSearchParams.get("end_date");

  const current_date = formatDateToISO(new Date());
  return (
    <Form method="get" className="bg-white rounded w-1/2">
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
        defaultValue={
          start_date_default ? formatDateToISO(start_date_default) : undefined
        }
        max={current_date}
        className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
      />

      {errorMessages?.start_date && (
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
        defaultValue={
          end_date_default ? formatDateToISO(end_date_default) : undefined
        }
        max={current_date}
        className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
      />
      {errorMessages?.end_date && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.end_date[0]}
        </h2>
      )}
      <label
        htmlFor="userType"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        User type
      </label>
      <Select
        id="userType"
        name="userType"
        options={[
          { value: "client", label: "Client" },
          { value: "vendor", label: "Vendor" },
          {value: "", label: "None"},
        ]}
        defaultValue={
          newSearchParams.get("userType")
            ? {
                value: newSearchParams.get("userType"),
                label:
                  newSearchParams.get("userType") === "client"
                    ? "Client"
                    : "Vendor",
              }
            : undefined
        }
      />
      {errorMessages?.userType && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.userType[0]}
        </h2>
      )}
      <label
        htmlFor="client_mobile_num"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Client Mobile number
      </label>
      <input
        type="text"
        id="client_mobile_num"
        name="client_mobile_num"
        pattern="^0[0-9]{10}$"
        placeholder="03334290689"
        defaultValue={newSearchParams.get("client_mobile_num") || undefined}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
      />
      {errorMessages?.client_mobile_num && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.client_mobile_num[0]}
        </h2>
      )}
      <label
        htmlFor="vendor_mobile_num"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Vendor Mobile number
      </label>
      <input
        type="text"
        id="vendor_mobile_num"
        name="vendor_mobile_num"
        pattern="^0[0-9]{10}$"
        placeholder="03334290689"
        defaultValue={newSearchParams.get("vendor_mobile_num") || undefined}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
      />
      {errorMessages?.vendor_mobile_num && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.vendor_mobile_num[0]}
        </h2>
      )}
      <label
        htmlFor="payment_options"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Mode of Payment
      </label>
      <Select
        isMulti
        id="payment_options"
        name="payment_options"
        options={getAllPaymentMenuOptions()}
        // defaultValue={
        //   newSearchParams
        //     .getAll("payment_options")
        //     ?.map((mode) => getSinglePaymentMenuOption(mode as Payment)) ||
        //   undefined
        // }
        className="basic-multi-select mt-2"
        classNamePrefix="select"
      />
      {errorMessages?.payment_options && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.payment_options[0]}
        </h2>
      )}
      <label
        htmlFor="transaction_types"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Transaction Type
      </label>
      <Select
        isMulti
        name="transaction_types"
        options={getAllTransactionMenuOptions()}
        defaultValue={
          newSearchParams
            .getAll("transaction_types")
            ?.filter(val => val !== "").map((mode) =>
              getSingleTransactionMenuOption(mode as TransactionType)
            ) || undefined
        }
        className="basic-multi-select mt-2"
        classNamePrefix="select"
      />
      {errorMessages?.transaction_types && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.transaction_types[0]}
        </h2>
      )}
      <label
        htmlFor="products"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Products
      </label>
      <Select
        isMulti
        name="products"
        options={products.map((product) => ({
          value: product.prod_id,
          label: product.prod_name,
        }))}
        defaultValue={
          newSearchParams.getAll("products")?.filter(val => val !== "").map((prod_id) => ({
            value: prod_id,
            label: products.find((product) => product.prod_id === prod_id)
              ?.prod_name,
          })) || undefined
        }
        className="basic-multi-select mb-4"
        classNamePrefix="select"
      />
      {errorMessages?.products && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.products[0]}
        </h2>
      )}
      <button
        type="submit"
        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Fetch
      </button>
    </Form>
  );
}
