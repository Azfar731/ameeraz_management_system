import { useState } from "react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma_client } from "~/.server/db";

import { useLoaderData, useSearchParams, Link } from "@remix-run/react";

import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import { DealWithServices } from "~/utils/deal/types";
import { formatDate } from "shared/utilityFunctions";
export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const fetchAllDeals = searchParams.get("fetchAllDeals");
  const current_date = new Date();
  let deals;
  if (fetchAllDeals && fetchAllDeals === "true") {
    deals = await prisma_client.deal.findMany({
      where: { auto_generated: false },
      include: { services: true },
    });
  } else {
    deals = await prisma_client.deal.findMany({
      where: { auto_generated: false, activate_till: { gte: current_date } },
      include: { services: true },
    });
  }
  // const services = await fetchActiveServices();
  return { deals };
}

export default function Deals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { deals } = useLoaderData<{ deals: DealWithServices[] }>();
  console.log(deals);

  //table values
  const [ids, setIds] = useState<string[]>([]);
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
      label: "Active From",
      renderCell: (item: DealWithServices) => formatDate(item.activate_from),
    },
    {
      label: "Active Till",
      renderCell: (item: DealWithServices) =>
        (item.activate_till && formatDate(item.activate_till)) || "NA",
    },
    {
      label: "Services",
      renderCell: (item: DealWithServices) =>
        item.services.map((service) => service.serv_name).join(", "),
    },

    {
      label: "View",
      renderCell: (item: DealWithServices) => (
        <Link to={`${item.deal_id}`}>
          <FaExternalLinkAlt />
        </Link>
      ),
    },
  ];

  const handleExpand = (item: DealWithServices) => {
    if (ids.includes(item.deal_id)) {
      setIds(ids.filter((id) => id !== item.deal_id));
    } else {
      setIds(ids.concat(item.deal_id));
    }
  };

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (item: DealWithServices) => (
      <>
        {ids.includes(item.deal_id) && (
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
                  <strong>Services: </strong>
                  {item.services.map((service) => service.serv_name).join(", ")}
                </li>
              </ul>
            </td>
          </tr>
        )}
      </>
    ),
  };

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

  const handleDeals = () => {
    setSearchParams((prevParams) => {
      const params = new URLSearchParams(prevParams);

      if (params.get("fetchAllDeals")) {
        params.delete("fetchAllDeals");
      } else {
        params.set("fetchAllDeals", "true");
      }

      return params;
    });
  };

  return (
    <div className="m-4 pb-4">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Deals</h1>
      </div>
      <div className="mt-20">
        <div className="w-full flex justify-between items-center">
          <Link
            to="create"
            className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
          >
            Create Deal <FaPlus />
          </Link>
          <button
            onClick={handleDeals}
            className="w-60 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {searchParams.get("fetchAllDeals")
              ? "Hide Incactive Deals"
              : "Get all Deals"}
          </button>
        </div>
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
