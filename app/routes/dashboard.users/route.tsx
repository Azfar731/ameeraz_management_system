import { User } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllUsers } from "~/utils/user/db.server";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { formatDate } from "shared/utilityFunctions";
import { authenticate } from "~/utils/auth/functions.server";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({request}: LoaderFunctionArgs) {

  await authenticate({request, requiredClearanceLevel: 3 });


  const users = await getAllUsers();
  return { users };
}

export default function Users() {
  const { users } = useLoaderData<{ users: User[] }>();
  // values for table
  //table values
  const nodes = [...users];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "User Name",
      renderCell: (item: User) => item.userName
    },
    {
      label: "First Name",
      renderCell: (item: User) => item.fname
    },
    {
      label: "Last Name",
      renderCell: (item: User) => item.lname
    },
    {
      label: "Role",
      renderCell: (item: User) => item.role
    },
    {
      label: "Account Status",
      renderCell: (item: User) => item.account_status
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
        <Link
          to="create"
          className="w-44 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Create User <FaPlus />
        </Link>
        <div className="mt-6">
          <CompactTable columns={COLUMNS} data={data} theme={theme} />
        </div>
      </div>
    </div>
  );
}
