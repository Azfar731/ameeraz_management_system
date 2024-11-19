import { useState } from "react";
import { Product } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import FetchForm from "./FetchForm";
import { getAllProducts } from "~/utils/products/db.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { productSaleRecordFetchSchema } from "~/utils/productSaleRecord/validation.server";
import { getProductSaleRecords } from "~/utils/productSaleRecord/db.server";
import {
  ProductSaleRecordFetchErrors,
  ProductSaleRecordWithRelations,
} from "~/utils/productSaleRecord/types";
import { formatDate } from "shared/utilityFunctions";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
export async function loader({ request }: LoaderFunctionArgs) {
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
  console.log(validationResult.data)
  const records = await getProductSaleRecords(validationResult.data);

  return { products, records, errors: [] };
}

const fetchsearchParams = (searchParams: URLSearchParams) => {
  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;
  const products = searchParams.get("products") || undefined;
  const transaction_types = searchParams.get("transaction_types") || undefined;
  const client_mobile_num = searchParams.get("client_mobile_num") || undefined;
  const vendor_mobile_num = searchParams.get("vendor_mobile_num") || undefined;

  return {
    start_date,
    end_date,
    products,
    transaction_types,
    client_mobile_num,
    vendor_mobile_num,
  };
};

export default function View_Product_Sale_Record() {
  const { products, records, errors } = useLoaderData<{
    products: Product[];
    records: ProductSaleRecordWithRelations[];
    errors: ProductSaleRecordFetchErrors;
  }>();

  //table values
  //Creating a Table
  //it throws an error, while passing service_records directly
  const nodes = [...records];
  const data = { nodes };

  const [ids, setIds] = useState<string[]>([]);

  const handleExpand = (item: ProductSaleRecordWithRelations) => {
    if (ids.includes(item.product_record_id)) {
      setIds(ids.filter((id) => id !== item.product_record_id));
    } else {
      setIds(ids.concat(item.product_record_id));
    }
  };

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (item: ProductSaleRecordWithRelations) => (
      <>
        {ids.includes(item.product_record_id) && (
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
                  <strong>Products</strong>
                  {item.products.map((rec) => rec.product.prod_name).join(", ")}
                </li>
                <li>
                  <strong>Client Mobile Number: </strong>{" "}
                  {item.client?.client_mobile_num}
                </li>
                <li>
                  <strong>Vendor Mobile Number: </strong>{" "}
                  {item.vendor?.vendor_mobile_num}
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
      renderCell: (item: ProductSaleRecordWithRelations) =>
        formatDate(item.created_at),
    },
    {
      label: "Client Name",
      renderCell: (item: ProductSaleRecordWithRelations) => {
        return item.client
          ? `${item.client.client_fname} ${item.client.client_lname}`
          : "N/A";
      },
    },
    {
      label: "Vendor Name",
      renderCell: (item: ProductSaleRecordWithRelations) => {
        return item.vendor
          ? `${item.vendor.vendor_fname} ${item.vendor.vendor_lname}`
          : "N/A";
      },
    },
    {
      label: "Total Amount",
      renderCell: (item: ProductSaleRecordWithRelations) => item.total_amount,
    },
    {
      label: "Paid Amount",
      renderCell: (item: ProductSaleRecordWithRelations) =>
        item.transactions.reduce(
          (sum, transaction) => sum + transaction.amount_paid,
          0
        ),
    },
    {
      label: "Products",
      renderCell: (item: ProductSaleRecordWithRelations) =>
        item.products.map((rec) => rec.product.prod_name).join(", "),
    },
    {
      label: "Transaction Type",
      renderCell: (item: ProductSaleRecordWithRelations) =>
        item.transaction_type,
    },
    {
      label: "Edit",
      renderCell: (item: ProductSaleRecordWithRelations) => {
        return (
          <Link to={`/products-sale-record/${item.product_record_id}`}></Link>
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
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">
          Product Sales Page
        </h1>
      </div>
      <FetchForm products={products} errorMessages={errors} />
      <div className="mt-20">
        <Link
          to="create"
          className=" bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Create a new record
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
