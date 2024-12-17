import { Product } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import { getTheme } from "@table-library/react-table-library/baseline";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { FaExternalLinkAlt, FaPlus } from "react-icons/fa";
import { getAllProducts } from "~/utils/products/db.server";

export async function loader() {
  const products = await getAllProducts();
  return { products };
}

export default function Products() {
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
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Products</h1>
      </div>
      <div className="mt-20">
        <Link
          to="create"
          className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Create Product <FaPlus />
        </Link>
        <div className="mt-6">
          <CompactTable columns={COLUMNS} data={data} theme={theme} />
        </div>
      </div>
    </div>
  );
}
