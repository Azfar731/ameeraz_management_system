import { prisma_client } from ".server/db";
import { Employee } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const getAll = searchParams.get("getAll");
  let employees;
  if (getAll && getAll === "true") {
    employees = await prisma_client.employee.findMany();
  } else {
    employees = await prisma_client.employee.findMany({
      where: { emp_status: true },
    });
  }
  return { employees };
}

export default function Employees() {
  const { employees } = useLoaderData<{ employees: Employee[] }>();
  console.log(employees);

  //table values
  const nodes = [...employees];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Mobile Number",
      renderCell: (item: Employee) => item.emp_mobile_num,
    },
    {
      label: "First Name",
      renderCell: (item: Employee) => item.emp_fname,
    },
    {
      label: "Last Name",
      renderCell: (item: Employee) => item.emp_lname,
    },
    {
      label: "Base Salary",
      renderCell: (item: Employee) => item.base_salary,
    },
    {
      label: "Percentage",
      renderCell: (item: Employee) => item.percentage,
    },
    {
      label: "Status",
      renderCell: (item: Employee) => (item.emp_status ? "Active" : "Left"),
    },
    {
      label: "View",
      renderCell: (item: Employee) => (
        <Link to={`${item.emp_id}`}>
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
        <h1 className=" font-semibold text-6xl text-gray-700">Employees</h1>
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
  );
}
