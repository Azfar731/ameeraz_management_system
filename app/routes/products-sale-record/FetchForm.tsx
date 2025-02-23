import { Product, TransactionType } from "@prisma/client";
import Select from "react-select";
import { Form, useSearchParams, useNavigation } from "@remix-run/react";
import { formatDateToISO } from "shared/utilityFunctions";
import { getProductOptions } from "~/utils/selectMenuOptionFunctions";
import {
  getAllTransactionMenuOptions,
  getSingleTransactionMenuOption,
  setSearchParameters,
} from "~/utils/functions";
import { ProductSaleRecordFetchErrors } from "~/utils/productSaleRecord/types";
import { SerializeFrom } from "@remix-run/node";

export default function FetchForm({
  products: allProducts,
  errorMessages,
}: {
  products: SerializeFrom<Product>[];
  errorMessages: ProductSaleRecordFetchErrors;
}) {
  const navigation = useNavigation();
  //searchParam values
  const [searchParams, setSearchParams] = useSearchParams();
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");

  //manage products menu

  const sel_products = searchParams.get("products")?.split("|") || [];
  const productMap = new Map(
    allProducts.map((prod) => [prod.prod_id, prod.prod_name])
  );

  // Map selected product IDs to the desired structure
  const def_products = sel_products.map((id) => ({
    value: id,
    label: productMap.get(id) || "No product exists",
  }));

  const currentDate = formatDateToISO(new Date());

  const fetchFormData = (formData: FormData) => {
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const products = formData
      .getAll("product")
      .map((value) => String(value))
      .filter((val) => val.trim() !== "");
    const transaction_types = formData
      .getAll("transaction_type")
      .map((value) => String(value))
      .filter((val) => val.trim() !== "");
    const client_mobile_num = formData.get("client_mobile_num") as string;
    const vendor_mobile_num = formData.get("vendor_mobile_num") as string;
    const payment_cleared = formData.get("payment_cleared") as string;
    return {
      start_date,
      end_date,
      products,
      transaction_types,
      client_mobile_num,
      vendor_mobile_num,
      payment_cleared,
    };
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formValues = fetchFormData(formData);

    setSearchParameters(formValues, setSearchParams);
  };

  return (
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
        defaultValue={start_date ? formatDateToISO(start_date) : undefined}
        max={currentDate}
        className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
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
        defaultValue={end_date ? formatDateToISO(end_date) : undefined}
        max={currentDate}
        className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
      />
      {errorMessages.end_date && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.end_date[0]}
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
        defaultValue={searchParams.get("client_mobile_num") || undefined}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
      />
      {errorMessages.client_mobile_num && (
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
        defaultValue={searchParams.get("vendor_mobile_num") || undefined}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
      />
      {errorMessages.vendor_mobile_num && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.vendor_mobile_num[0]}
        </h2>
      )}
      <label
        htmlFor="product"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Products
      </label>
      <Select
        isMulti
        id="product"
        name="product"
        options={getProductOptions(allProducts)}
        defaultValue={def_products}
        className="basic-multi-select mt-2"
        classNamePrefix="select"
      />
      {errorMessages.products && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.products[0]}
        </h2>
      )}
      <label
        htmlFor="transaction_type"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Transaction Type
      </label>
      <Select
        isMulti
        name="transaction_type"
        id="deal"
        options={getAllTransactionMenuOptions()}
        defaultValue={
          searchParams.get("transaction_type")
            ? getSingleTransactionMenuOption(
                searchParams.get("transaction_type") as TransactionType
              )
            : undefined
        }
        className="basic-multi-select mt-2"
        classNamePrefix="select"
      />
      {errorMessages.transaction_types && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.transaction_types[0]}
        </h2>
      )}
      <label
        htmlFor="payment_cleared"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Payment Status
      </label>
      <Select
        id="payment_cleared"
        name="payment_cleared"
        options={[
          { value: "paid", label: "Paid" },
          { value: "pending", label: "Pending" },
          { value: undefined, label: "Any" },
        ]}
        className="basic-multi-select mt-2"
        classNamePrefix="select"
      />
      {errorMessages.payment_cleaared && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.payment_cleaared[0]}
        </h2>
      )}
      <button
        type="submit"
        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={
          navigation.state === "loading" || navigation.state === "submitting"
        }
      >
        Fetch
      </button>
    </Form>
  );
}
