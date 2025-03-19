import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { FaExternalLinkAlt, FaPlus } from "react-icons/fa";
import { authenticate } from "~/utils/auth/functions.server";
import { getAllTemplates } from "~/utils/templates/db.server";
import { TemplateWithRelations } from "~/utils/templates/types";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 3 });
  const templates = await getAllTemplates();
  return { templates };
}

export default function Templates() {
  const { templates } = useLoaderData<{ templates: TemplateWithRelations[] }>();
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === "loading" || navigation.state === "submitting";
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
      renderCell: (item: TemplateWithRelations) => item.variables.length,
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
          <button
            disabled={isNavigating}
            className="w-60 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Link
              to="create"
              className="flex items-center justify-around"
              aria-disabled={isNavigating}
            >
              Create Template <FaPlus />
            </Link>
          </button>
        </div>
        <div className="mt-6">
          <CompactTable columns={COLUMNS} data={data} theme={theme} />
        </div>
      </div>
    </div>
  );
}
