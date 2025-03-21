import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getTheme } from "@table-library/react-table-library/baseline";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { FaExternalLinkAlt, FaPlus } from "react-icons/fa";
import { authenticate } from "~/utils/auth/functions.server";
import { getAllTemplates } from "~/utils/templates/db.server";
import { TemplateWithRelations } from "~/utils/templates/types";


export async function loader({request}: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 3 });
  const templates = await getAllTemplates();
  return { templates };
}

export default function Templates() {
  const { templates } = useLoaderData<{ templates: TemplateWithRelations[] }>();

  const nodes = [...templates];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Name",
      renderCell: (item: TemplateWithRelations) => item.name,
    },
    {
      label: "Header Type",
      renderCell: (item: TemplateWithRelations) => item.header_type,
    },
    {
      label: "Number of Variables",
      renderCell: (item: TemplateWithRelations) =>
        (item.variables.length),
    },
    {
      label: "View",
      renderCell: (item: TemplateWithRelations) => (
        <Link to={item.id}>
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
        <h1 className=" font-semibold text-4xl text-gray-700">Templates</h1>
      </div>
      <div className="mt-10">
        <div className="w-full flex justify-between items-center">
          <Link
            to="create" 
            className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
          >
            Create Template <FaPlus />
          </Link>
        </div>
        <div className="mt-6">
          <CompactTable
            columns={COLUMNS}
            data={data}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
