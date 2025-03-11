import { useState } from "react";
import { prisma_client } from "~/.server/db";
import { Category } from "@prisma/client";
import { useLoaderData, Link } from "@remix-run/react";
import { CategoryWithServices } from "~/utils/category/types";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import { authenticate } from "~/utils/auth/functions.server";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({request}: LoaderFunctionArgs) {

  await authenticate({request, requiredClearanceLevel: 1})  

  const categories = await prisma_client.category.findMany({
    include: { services: true },
  });
  return { categories };
}

export default function Categories() {
  const { categories } = useLoaderData<{
    categories: CategoryWithServices[];
  }>();
  console.log(categories);

  //table values
  const [ids, setIds] = useState<string[]>([]);

  const nodes = [...categories];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Name",
      renderCell: (item: Category) => item.cat_name,
    },
    {
      label: "View",
      renderCell: (item: Category) => (
        <Link to={`${item.cat_id}`}>
          <FaExternalLinkAlt />
        </Link>
      ),
    },
  ];

  const handleExpand = (item: CategoryWithServices) => {
    if (ids.includes(item.cat_id)) {
      setIds(ids.filter((id) => id !== item.cat_id));
    } else {
      setIds(ids.concat(item.cat_id));
    }
  };

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (item: CategoryWithServices) => (
      <>
        {ids.includes(item.cat_id) && (
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

  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Categories</h1>
      </div>
      <div className="mt-20">
        <Link
          to="create"
          className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Create Category <FaPlus />
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
