import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import Select from "react-select";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import {
  getAllEmployees,
  getEmployeeWorkRecords,
} from "~/utils/employee/db.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Employee } from "@prisma/client";
import { employeeDashboardSchema } from "~/utils/employee/validation";
import { EmployeeWithRecords } from "~/utils/employee/types";

export async function loader({ request }: LoaderFunctionArgs) {
  // required for multi-select menus
  const all_employees = await getAllEmployees();

  //get search params from the request
  const searchParams = new URL(request.url).searchParams;
  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;
  const selected_active_emp =
    searchParams
      .getAll("selected_active_emp")
      .filter((entry) => entry !== "") || [];
  const selected_inActive_emp =
    searchParams
      .getAll("selected_inActive_emp")
      .filter((entry) => entry !== "") || [];
  debugger;
  //perform validation
  const validation_result = employeeDashboardSchema.safeParse({
    start_date,
    end_date,
    selected_active_emp,
    selected_inActive_emp,
  });
  if (!validation_result.success) {
    return {
      error_messages: validation_result.error.flatten().fieldErrors,
      start_date: undefined,
      end_date: undefined,
      all_employees,
      work_records: [],
    };
  }

  const work_records = await getEmployeeWorkRecords({
    start_date: validation_result.data.start_date!,
    end_date: validation_result.data.end_date!,
    emp_ids: [
      ...validation_result.data.selected_active_emp,
      ...validation_result.data.selected_inActive_emp,
    ],
  });

  return {
    start_date: validation_result.data.start_date,
    end_date: validation_result.data.end_date,
    error_messages: undefined,
    all_employees,
    work_records,
  };
}

export default function Employee_Insights() {
  const { start_date, end_date, error_messages, all_employees, work_records } =
    useLoaderData<{
      start_date: string | undefined;
      end_date: string | undefined;
      error_messages: {
        start_date: string[];
        end_date: string[];
        selected_active_emp: string[];
        selected_inActive_emp: string[];
      };

      work_records: EmployeeWithRecords[];
      all_employees: Employee[];
    }>();

  const navigation = useNavigation();
  const current_date = new Date().toISOString().split("T")[0];
  const employee_data = calculateEmployeeCommission(work_records);

  const nodes = [...employee_data];
  const data = { nodes };
  const COLUMNS = [
    {
      label: "Name",
      renderCell: (item: (typeof nodes)[number]) =>
        `${item.emp_fname} ${item.emp_lname}`,
    },
    {
      label: "Base Salary",
      renderCell: (item: (typeof nodes)[number]) => item.base_salary,
    },
    {
      label: "Work Done",
      renderCell: (item: (typeof nodes)[number]) => item.total_work_done,
    },
    {
      label: "Commission",
      renderCell: (item: (typeof nodes)[number]) => item.commission,
    },
    {
      label: "Total Salary",
      renderCell: (item: (typeof nodes)[number]) =>
        item.base_salary + item.commission,
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
                          background-color: #f9f9f9;
                      }
                      `,
    },
  ]);

  return (
    <div className="m-8">
      <section>
        <Form method="get" className=" rounded w-1/4">
          <h2 className="text-3xl font-semibold text-gray-700 mt-6">
            Select Date Range
          </h2>
          <label
            htmlFor="start_date"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Starting Date
          </label>
          <input
            id="start_date"
            name="start_date"
            aria-label="Date"
            type="date"
            max={current_date}
            className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
          />
          {error_messages?.start_date && (
            <h2 className="text-red-500 font-semibold">
              {error_messages.start_date[0]}
            </h2>
          )}
          <label
            htmlFor="end_date"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Ending Date
          </label>
          <input
            id="end_date"
            name="end_date"
            aria-label="Date"
            type="date"
            max={current_date}
            className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
          />
          {error_messages?.end_date && (
            <h2 className="text-red-500 font-semibold">
              {error_messages.end_date[0]}
            </h2>
          )}
          <label
            htmlFor="selected_active_emp"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Active Employees
          </label>
          <Select
            isMulti
            id="selected_active_emp"
            name="selected_active_emp"
            options={all_employees
              .filter((emp) => emp.emp_status)
              .map((emp) => ({
                value: emp.emp_id,
                label: `${emp.emp_fname} ${emp.emp_lname}`,
              }))}
            className=" mt-2"
            classNamePrefix="select"
          />
          {error_messages?.selected_active_emp && (
            <h2 className="text-red-500 font-semibold">
              {error_messages.selected_active_emp[0]}
            </h2>
          )}
          <label
            htmlFor="selected_inActive_emp"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Inactive Employees
          </label>
          <Select
            isMulti
            id="selected_inActive_emp"
            name="selected_inActive_emp"
            options={all_employees
              .filter((emp) => !emp.emp_status)
              .map((emp) => ({
                value: emp.emp_id,
                label: `${emp.emp_fname} ${emp.emp_lname}`,
              }))}
            className=" mt-2"
            classNamePrefix="select"
          />
          {error_messages?.selected_inActive_emp && (
            <h2 className="text-red-500 font-semibold">
              {error_messages.selected_inActive_emp[0]}
            </h2>
          )}
          <button
            type="submit"
            disabled={
              navigation.state === "submitting" ||
              navigation.state === "loading"
            }
            className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Fetch
          </button>
        </Form>
      </section>
      <section className="mt-4  text-xl font-semibold text-gray-800 mb-4">
        <h3>
          Starting Date:{" "}
          {start_date
            ? new Date(start_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </h3>
        <h3>
          Ending Date:{" "}
          {end_date
            ? new Date(end_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </h3>
      </section>
      <section>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800 mb-4">
          Employee Salaries
        </h2>
        <CompactTable columns={COLUMNS} data={data} theme={theme} />
      </section>
    </div>
  );
}

function calculateEmployeeCommission(work_records: EmployeeWithRecords[]) {
  return work_records.map((record) => {
    const total_work_done = record.records.reduce((acc, rec) => {
      return acc + rec.work_share;
    }, 0);

    return {
      emp_id: record.emp_id,
      emp_fname: record.emp_fname,
      emp_lname: record.emp_lname,
      total_work_done,
      commission: total_work_done * (record.percentage / 100),
      base_salary: record.base_salary,
    };
  });
}
