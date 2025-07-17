import { Product } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import { FaPlus } from "react-icons/fa";
import { getAllProducts } from "~/utils/products/db.server";
import { getProductTransactionsWithRelations } from "~/utils/productTransaction/db.server";
import {
  ProductTransactionFetchErrorData,
  ProductTransactionWithRelations,
} from "~/utils/productTransaction/types";
import { productTransactionFetchSchema } from "~/utils/productTransaction/validation.server";
import Product_Transaction_FetchForm from "./FetchForm";
import ProductTransactionTable from "./ProductTransactionTable";
import { authenticate } from "~/utils/auth/functions.server";
import { calculateProductTransaction } from "~/utils/productTransaction/functions";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });

  const searchParams = new URL(request.url).searchParams;
  const products = await getAllProducts();
  const formValues = fetchFormValues(searchParams);

  const validationResult = await productTransactionFetchSchema.safeParseAsync(
    formValues
  );
  if (!validationResult.success) {
    console.log("errors occurred in loader");
    return {
      errorMessages: validationResult.error.flatten().fieldErrors,
      transactions: [],
      products,
    };
  }
  console.log("Validation Result: ", validationResult.data);
  const transactions = await getProductTransactionsWithRelations(
    validationResult.data
  );
  console.log("Transactions: ", transactions);
  return { transactions, products, errorMessages: {} };
}

const fetchFormValues = (searchParams: URLSearchParams) => {
  for (const [key, value] of searchParams.entries()) {
    if (value === "") {
      searchParams.delete(key);
    }
  }

  const transaction_types = searchParams
    .getAll("transaction_types")
    .filter((val) => val !== "");
  const products = searchParams.getAll("products").filter((val) => val !== "");
  const payment_options = searchParams
    .getAll("payment_options")
    .filter((val) => val !== "");
  const formValues = {
    start_date: searchParams.get("start_date") || undefined,
    end_date: searchParams.get("end_date") || undefined,
    client_mobile_num: searchParams.get("client_mobile_num") || undefined,
    vendor_mobile_num: searchParams.get("vendor_mobile_num") || undefined,
    transaction_types:
      transaction_types.length > 0 ? transaction_types : undefined,
    products: products.length > 0 ? products : undefined,
    payment_options: payment_options.length > 0 ? payment_options : undefined,
    userType: searchParams.get("userType") || undefined,
  };
  return formValues;
};

export default function Product_Transactions() {
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === "loading" || navigation.state === "submitting";
  const { transactions, products, errorMessages } = useLoaderData<{
    transactions: ProductTransactionWithRelations[];
    products: Product[];
    errorMessages: ProductTransactionFetchErrorData;
  }>();

  const {
    productsBought: soldTransactionsSumData,
    productsSold: boughtTransactionsSumData,
  } = calculateProductTransaction(transactions);

  return (
    <div className="mt-8">
      <div className="w-full flex justify-center items-center">
        <h1 className="font-semibold text-3xl text-gray-700">
          Product Transactions
        </h1>
      </div>
      <Product_Transaction_FetchForm
        products={products}
        errorMessages={errorMessages}
      />
      <div className="mt-20">
        <div className="flex justify-between items-center mb-4">
          <button
            disabled={isNavigating}
            className="w-60 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Link
              to="create"
              className="flex items-center justify-around"
              aria-disabled={isNavigating}
            >
              Create Transaction <FaPlus />
            </Link>
          </button>
          <div className="flex items-center justify-center mb-4  py-4 px-8 border border-gray-300 rounded-lg shadow-md">
            <div className="border-r border-gray-300 pr-8 mr-8">
              <div className="flex gap-2 items-center mb-2">
                <h2 className="font-semibold text-lg">Total Sold:</h2>
                <p className="text-gray-600">
                  {soldTransactionsSumData.cashTransaction +
                    soldTransactionsSumData.bankTransaction +
                    soldTransactionsSumData.cardTransaction}
                </p>
              </div>
              <div className="ml-12">
                <div className="flex gap-2 items-center mb-2">
                  <h3 className="">Cash: </h3>
                  <p className="text-gray-600">
                    {soldTransactionsSumData.cashTransaction}
                  </p>
                </div>
                <div className="flex gap-2 items-center mb-2">
                  <h3 className="">Bank Transfer: </h3>
                  <p className="text-gray-600">
                    {soldTransactionsSumData.bankTransaction}
                  </p>
                </div>
                <div className="flex gap-2 items-center mb-2">
                  <h3 className="">Card: </h3>
                  <p className="text-gray-600">
                    {soldTransactionsSumData.cardTransaction}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-2  items-center mb-2">
                <h2 className="font-semibold text-lg">Total Bought:</h2>
                <p className="text-gray-600">
                  {boughtTransactionsSumData.cashTransaction +
                    boughtTransactionsSumData.bankTransaction +
                    boughtTransactionsSumData.cardTransaction}
                </p>
              </div>
              <div className="ml-12">
                <div className="flex gap-2  items-center mb-2 ">
                  <h3 className=" ">Cash: </h3>
                  <p className="text-gray-600">
                    {boughtTransactionsSumData.cashTransaction}
                  </p>
                </div>
                <div className="flex gap-2  items-center mb-2 ">
                  <h3 className=" ">Bank Transfer: </h3>
                  <p className="text-gray-600">
                    {boughtTransactionsSumData.bankTransaction}
                  </p>
                </div>
                <div className="flex gap-2  items-center mb-2 ">
                  <h3 className=" ">Card: </h3>
                  <p className="text-gray-600">
                    {boughtTransactionsSumData.cardTransaction}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <ProductTransactionTable transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
