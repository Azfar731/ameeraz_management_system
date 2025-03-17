import { Category } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { FaExternalLinkAlt, FaPlus } from "react-icons/fa";
import { prisma_client } from "~/.server/db";
import { authenticate } from "~/utils/auth/functions.server";
import { DealWithServices } from "~/utils/deal/types";
export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });

  const searchParams = new URL(request.url).searchParams;
  const fetchAllServices = searchParams.get("fetchAllServices");
  let deals;
  if (fetchAllServices && fetchAllServices === "true") {
    deals = await prisma_client.deal.findMany({
      where: { auto_generated: true },
      include: { services: true },
    });
  } else {
    deals = await prisma_client.deal.findMany({
      where: { auto_generated: true, activate_till: null },
      include: { services: true },
    });
  }
  const categories = await prisma_client.category.findMany();
  return { deals, categories };
}

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { deals, categories } = useLoaderData<{
    deals: DealWithServices[];
    categories: Category[];
  }>();
  console.log(deals);

  // other values
  // const current_date = new Date();
  //table values
  const nodes = [...deals];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Name",
      renderCell: (item: DealWithServices) => item.deal_name,
    },
    {
      label: "Price",
      renderCell: (item: DealWithServices) => item.deal_price,
    },
    {
      label: "Category",
      renderCell: (item: DealWithServices) =>
        categories.find((cat) => cat.cat_id === item.services[0].serv_category)
          ?.cat_name,
    },
    {
      label: "Status",
      renderCell: (item: DealWithServices) =>
        item.activate_till ? "InActive" : "Active",
    },
    {
      label: "View",
      renderCell: (item: DealWithServices) => (
        <Link to={`${item.services[0].serv_id}`}>
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

  const handleServices = () => {
    setSearchParams((prevParams) => {
      const params = new URLSearchParams(prevParams);

      if (params.get("fetchAllServices")) {
        params.delete("fetchAllServices");
      } else {
        params.set("fetchAllServices", "true");
      }

      return params;
    });
  };

  return (
    <div className="m-4 pb-4">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Services</h1>
      </div>
      <div className="mt-20">
        <div className="w-full flex justify-between items-center">
          <Link
            to="create"
            className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
          >
            Create Service <FaPlus />
          </Link>
          <button
            onClick={handleServices}
            className="w-60 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {searchParams.get("fetchAllServices")
              ? "Hide Incactive Services"
              : "Get all Services"}
          </button>
        </div>
        <div className="mt-6">
          <CompactTable
            columns={COLUMNS}
            data={data}
            theme={theme}
            // rowProps={ROW_PROPS}
            // rowOptions={ROW_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
