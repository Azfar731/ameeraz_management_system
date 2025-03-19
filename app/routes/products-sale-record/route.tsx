import { Product } from "@prisma/client";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import FetchForm from "./FetchForm";
import { getAllProducts } from "~/utils/products/db.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { productSaleRecordFetchSchema } from "~/utils/productSaleRecord/validation.server";
import { getProductSaleRecords } from "~/utils/productSaleRecord/db.server";
import {
  ProductSaleRecordFetchErrors,
  ProductSaleRecordWithRelations,
} from "~/utils/productSaleRecord/types";
import { FaPlus } from "react-icons/fa";
import ProductSaleRecordTable from "./ProductSaleRecordTable";
import { authenticate } from "~/utils/auth/functions.server";
export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });

  const products = await getAllProducts();
  const searchParams = new URL(request.url).searchParams;
  const formValues = fetchsearchParams(searchParams);
  const validationResult = productSaleRecordFetchSchema.safeParse(formValues);
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      products,
      records: [],
    };
  }
  console.log(validationResult.data);
  const records = await getProductSaleRecords(validationResult.data);

  return { products, records, errors: {} };
}

const fetchsearchParams = (searchParams: URLSearchParams) => {
  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;
  const products = searchParams.get("products") || undefined;
  const transaction_types = searchParams.get("transaction_types") || undefined;
  const client_mobile_num = searchParams.get("client_mobile_num") || undefined;
  const vendor_mobile_num = searchParams.get("vendor_mobile_num") || undefined;
  const payment_cleared = searchParams.get("payment_cleared") || undefined;

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

export default function View_Product_Sale_Record() {
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === "loading" || navigation.state === "submitting";
  const { products, records, errors } = useLoaderData<{
    products: Product[];
    records: ProductSaleRecordWithRelations[];
    errors: ProductSaleRecordFetchErrors;
  }>();

  return (
    <div className="m-8 flex-1 p-4">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">
          Product Sales Page
        </h1>
      </div>
      <FetchForm products={products} errorMessages={errors} />
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
            Create a new record <FaPlus />
          </Link>
        </button>
        <div className="mt-6">
          <ProductSaleRecordTable records={records} />
        </div>
      </div>
    </div>
  );
}
