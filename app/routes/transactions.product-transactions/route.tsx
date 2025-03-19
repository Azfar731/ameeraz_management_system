import { Product } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import { FaPlus } from "react-icons/fa";
import { getAllProducts } from "~/utils/products/db.server";
import { getProductTransactions } from "~/utils/productTransaction/db.server";
import {
  ProductTransactionFetchErrorData,
  ProductTransactionWithRelations,
} from "~/utils/productTransaction/types";
import { productTransactionFetchSchema } from "~/utils/productTransaction/validation.server";
import Product_Transaction_FetchForm from "./FetchForm";
import ProductTransactionTable from "./ProductTransactionTable";
import { authenticate } from "~/utils/auth/functions.server";

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
  const transactions = await getProductTransactions(validationResult.data);
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
        <div className="mt-6">
          <ProductTransactionTable transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
