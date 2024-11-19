import { Product, TransactionType } from "@prisma/client";
import Select from "react-select";
import { Form, useSearchParams } from "@remix-run/react";
import { formatDateToISO } from "shared/utilityFunctions";
import { getProductOptions } from "~/utils/selectMenuOptionFunctions";
import { getAllTransactionMenuOptions, getSingleTransactionMenuOption } from "~/utils/functions";

export default function FetchForm({
  products: allProducts,
}: {
  products: Product[];
}) {
  //searchParam values
  const [searchParams] = useSearchParams();
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

 
  return (
    <Form
      method="get"
      className="bg-white rounded w-1/2"
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
        defaultValue={searchParams.get("transaction_type") ? getSingleTransactionMenuOption(searchParams.get("transaction_type") as TransactionType) : undefined}
        className="basic-multi-select mt-2"
        classNamePrefix="select"
      />
      <button
        type="submit"
        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Fetch
      </button>
    </Form>
  );
}
