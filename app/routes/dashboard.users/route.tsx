import { User } from "@prisma/client";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import { getAllUsers } from "~/utils/user/db.server";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import { formatDate } from "shared/utilityFunctions";
import { authenticate } from "~/utils/auth/functions.server";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 3 });

  const users = await getAllUsers();
  return { users };
}

export default function Users() {
  const { users } = useLoaderData<{ users: User[] }>();
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === "loading" || navigation.state === "submitting";
  // values for table
  //table values
  const nodes = [...users];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "User Name",
      renderCell: (item: User) => item.userName,
    },
    {
      label: "First Name",
      renderCell: (item: User) => item.fname,
    },
    {
      label: "Last Name",
      renderCell: (item: User) => item.lname,
    },
    {
      label: "Role",
      renderCell: (item: User) => item.role,
    },
    {
      label: "Account Status",
      renderCell: (item: User) => item.account_status,
    },
    {
      label: "Registrated On",
      renderCell: (item: User) => formatDate(item.created_at),
    },
    {
      label: "View",
      renderCell: (item: User) => (
        <Link to={`${item.id}`}>
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
        <h1 className=" font-semibold text-6xl text-gray-700">Users</h1>
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
            Create User <FaPlus />
          </Link>
        </button>
        <div className="mt-6">
          <CompactTable columns={COLUMNS} data={data} theme={theme} />
        </div>
      </div>
    </div>
  );
}
