import { prisma_client } from ".server/db";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DealWithServices } from "~/utils/deal/types";
import { Link } from "@remix-run/react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import { Category } from "@prisma/client";
export async function loader({ request }: LoaderFunctionArgs) {
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
  const { deals, categories } = useLoaderData<{ deals: DealWithServices[], categories: Category[] }>();
  console.log(deals);

  // other values
  const current_date = new Date();
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
      renderCell: (item: DealWithServices) => categories.find(cat => cat.cat_id === item.services[0].serv_category)?.cat_name,
    },
    {
      label: "Status",
      renderCell: (item: DealWithServices) =>
        item.activate_till && item.activate_till < current_date
          ? "InActive"
          : "Active",
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

  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Services</h1>
      </div>
      <div className="mt-20">
        <Link
          to="create"
          className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Create Service <FaPlus />
        </Link>
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
