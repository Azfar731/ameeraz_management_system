import { Product } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { FaExternalLinkAlt, FaPlus } from "react-icons/fa";
import { authenticate } from "~/utils/auth/functions.server";
import { getAllProducts } from "~/utils/products/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });

  const products = await getAllProducts();
  return { products };
}

export default function Products() {
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === "loading" || navigation.state === "submitting";
  const { products } = useLoaderData<{ products: Product[] }>();

  //table values
  const nodes = [...products];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Name",
      renderCell: (item: Product) => item.prod_name,
    },
    {
      label: "Price",
      renderCell: (item: Product) => `${item.prod_price}`,
    },
    {
      label: "Quantity",
      renderCell: (item: Product) => `${item.quantity}`,
    },
    {
      label: "View",
      renderCell: (item: Product) => (
        <Link to={`${item.prod_id}`}>
          <FaExternalLinkAlt />
        </Link>
      ),
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
    <div className="m-4 pb-4">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Products</h1>
      </div>
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
            Create Product <FaPlus />
          </Link>
        </button>
        <div className="mt-6">
          <CompactTable columns={COLUMNS} data={data} theme={theme} />
        </div>
      </div>
    </div>
  );
}
