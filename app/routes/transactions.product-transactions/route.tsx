import { Product } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getTheme } from "@table-library/react-table-library/baseline";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { useState } from "react";
import { FaExternalLinkAlt, FaPlus } from "react-icons/fa";
import { getAllProducts } from "~/utils/products/db.server";
import { getProductTransactions } from "~/utils/productTransaction/db.server";
import {
  ProductTransactionFetchErrorData,
  ProductTransactionWithRelations,
} from "~/utils/productTransaction/types";
import { productTransactionFetchSchema } from "~/utils/productTransaction/validation.server";
import { formatDate } from "shared/utilityFunctions";
import { capitalizeFirstLetter } from "~/utils/functions";
import Product_Transaction_FetchForm from "./FetchForm";
export async function loader({ request }: LoaderFunctionArgs) {
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
  const { transactions, products, errorMessages } = useLoaderData<{
    transactions: ProductTransactionWithRelations[];
    products: Product[];
    errorMessages: ProductTransactionFetchErrorData;
  }>();
  console.log("Transactions: ", transactions);
  //table values
  const nodes = [...transactions];
  const data = { nodes };
  const [ids, setIds] = useState<string[]>([]);

  const handleExpand = (item: ProductTransactionWithRelations) => {
    if (ids.includes(item.product_trans_id)) {
      setIds(ids.filter((id) => id !== item.product_trans_id));
    } else {
      setIds(ids.concat(item.product_trans_id));
    }
  };

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (item: ProductTransactionWithRelations) => (
      <>
        {ids.includes(item.product_trans_id) && (
          <tr style={{ display: "flex", gridColumn: "1 / -1" }}>
            <td style={{ flex: "1" }}>
              <ul
                style={{
                  margin: "0",
                  padding: "0",
                  backgroundColor: "#e0e0e0",
                }}
              >
                <li>
                  <Link
                    to={`${item.record.product_record_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:font-semibold"
                  >
                    Product Sale Record Link
                  </Link>
                </li>
                <li>
                  <strong>Total Amount: </strong>
                  {item.record.total_amount}
                </li>
                <li>
                  <strong>{`${
                    item.record.client ? "Client" : "Vendor"
                  } Mobile Number: `}</strong>
                  {item.record.client?.client_mobile_num ||
                    item.record.vendor?.vendor_mobile_num}
                </li>
                <li>
                  <strong>Products</strong>
                  {item.record.products
                    .map((record) => record.product.prod_name)
                    .join(", ")}
                </li>
              </ul>
            </td>
          </tr>
        )}
      </>
    ),
  };

  const COLUMNS = [
    {
      label: "Date",
      renderCell: (item: ProductTransactionWithRelations) =>
        formatDate(item.created_at),
    },
    {
      label: "Client Name",
      renderCell: (item: ProductTransactionWithRelations) =>
        item.record.client
          ? `${item.record.client?.client_fname} ${item.record.client?.client_lname}`
          : "N/A",
    },
    {
      label: "Vendor Name",
      renderCell: (item: ProductTransactionWithRelations) =>
        item.record.vendor
          ? `${item.record.vendor?.vendor_fname} ${item.record.vendor?.vendor_lname}`
          : "N/A",
    },
    {
      label: "Paid Amount",
      renderCell: (item: ProductTransactionWithRelations) => item.amount_paid,
    },
    {
      label: "Payment Cleared",
      renderCell: (item: ProductTransactionWithRelations) =>
        item.record.payment_cleared ? "Yes" : "No",
    },
    {
      label: "Transaction Type",
      renderCell: (item: ProductTransactionWithRelations) =>
        capitalizeFirstLetter(item.record.transaction_type),
    },
    {
      label: "Mode of Payment",
      renderCell: (item: ProductTransactionWithRelations) =>
        capitalizeFirstLetter(item.mode_of_payment),
    },
    {
      label: "Products",
      renderCell: (item: ProductTransactionWithRelations) =>
        item.record.products
          .map((record) => record.product.prod_name)
          .join(", "),
    },

    {
      label: "View",
      renderCell: (item: ProductTransactionWithRelations) => {
        return (
          <Link to={`${item.product_trans_id}`}>
            <FaExternalLinkAlt />
          </Link>
        );
      },
    },
  ];

  const theme = useTheme([
    getTheme(),
    {
      HeaderRow: `
            background-color: #eaf5fd;
          `,
      Row: `
            &:nth-of-type(odd) {
              background-color: #d2e9fb;
            }
    
            &:nth-of-type(even) {
              background-color: #eaf5fd;
            }
          `,
    },
  ]);

  return (
    <div className="mt-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-3xl text-gray-700">
          Product Transactions
        </h1>
      </div>
      <Product_Transaction_FetchForm
        products={products}
        errorMessages={errorMessages}
      />
      <div className="mt-20">
        <Link
          to="create"
          className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Create Transaction <FaPlus />
        </Link>
        <div className="mt-6">
          <CompactTable
            columns={COLUMNS}
            data={data}
            theme={theme}
            rowProps={ROW_PROPS}
            rowOptions={ROW_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
