import { useState, useRef } from "react";
import type { MetaFunction } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  Form,
  useSearchParams,
  useNavigate,
} from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma_client } from ".server/db";
import { Category, Deal, Employee } from "@prisma/client";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import Select, { OnChangeValue } from "react-select";
import {
  fetchDeals,
  fetchServices,
  formatDate,
  formatDateToISO,
  getCategoryOptions,
  getEmployeeOptions,
} from "shared/utilityFunctions";
import { ServiceSaleRecordWithRelations } from "~/utils/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Ameeraz Management" },
    { name: "Sales Page", content: "This is the sales page of ameeraz" },
  ];
};

type FormValues = {
  start_date: string;
  end_date: string;
  all_deals: string[];
  mobile_num: string;
  employees: string[];
  categories: string[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;

  // Extract dates
  const { start_date, end_date, current_date } = extractDates(searchParams);

  // Extract filters
  const { deal_ids, employee_ids, category_ids, client_mobile_num } =
    extractFilters(searchParams);

  // Validate dates
  validateDates(current_date, start_date, end_date);

  let service_records;
  //if no search param is provided, only fetch the current date records
  if (
    start_date ||
    end_date ||
    deal_ids ||
    employee_ids ||
    category_ids ||
    client_mobile_num
  ) {
    service_records = await fetchServiceRecords(
      start_date,
      end_date,
      client_mobile_num,
      deal_ids,
      category_ids,
      employee_ids
    );
  }else {
    current_date.setHours(0,0,0)
    service_records = await fetchServiceRecords(current_date)
  }

  // Fetch data

  const deals = await prisma_client.deal.findMany();
  const employees = await prisma_client.employee.findMany();
  const categories = await prisma_client.category.findMany();

  return { service_records, deals, employees, categories };
}

// Helper function to extract and format dates
function extractDates(searchParams: URLSearchParams) {
  const current_date = new Date(new Date().toISOString().slice(0, 10));
  const start_date = searchParams.get("start_date")
    ? new Date(searchParams.get("start_date")!)
    : undefined;
  const end_date = searchParams.get("end_date")
    ? new Date(searchParams.get("end_date")!)
    : undefined;

  current_date.setHours(23, 59, 59);
  if (end_date) {
    end_date.setHours(23, 59, 59);
  }

  return { start_date, end_date, current_date };
}

// Helper function to extract filters from search parameters
function extractFilters(searchParams: URLSearchParams) {
  const deal_ids = searchParams.get("all_deals")?.split("|");
  const employee_ids = searchParams.get("employees")?.split("|");
  const category_ids = searchParams.get("categories")?.split("|");
  const client_mobile_num = searchParams.get("mobile_num") || undefined;

  return { deal_ids, employee_ids, category_ids, client_mobile_num };
}

// Helper function to validate the dates
function validateDates(
  currentDate: Date,
  startDate: Date | undefined,
  endDate: Date | undefined
) {
  if (startDate && endDate && startDate > endDate) {
    throw new Error("Start Date can not be greater than End Date");
  }

  if (endDate && endDate > currentDate) {
    throw new Error("End Date cannot be greater than today's date");
  }
}

// Helper function to fetch service records from Prisma
async function fetchServiceRecords(
  startDate: Date | undefined,
  endDate?: Date | undefined,
  client_mobile_num?: string | undefined,
  deal_ids?: string[] | undefined,
  category_ids?: string[] | undefined,
  employee_ids?: string[] | undefined
) {
  return prisma_client.service_Sale_Record.findMany({
    where: {
      created_at: { gte: startDate, lte: endDate },
      client: { client_mobile_num: client_mobile_num },
      deals: {
        some: {
          deal_id: { in: deal_ids },
          services: {
            some: {
              category: { cat_id: { in: category_ids } },
            },
          },
        },
      },
      employees: {
        some: { emp_id: { in: employee_ids } },
      },
    },
    include: {
      client: true,
      transactions: true,
      deals: true,
      employees: true,
    },
  });
}

export default function Index() {
  //states
  const [currentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Formats the date to 'YYYY-MM-DD'
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  //loader Data
  const { service_records, deals, employees, categories } = useLoaderData<{
    service_records: ServiceSaleRecordWithRelations[];
    deals: Deal[];
    employees: Employee[];
    categories: Category[];
  }>();

  //references
  const dealsRef = useRef<{ value: string; label: string }[]>([]);
  const servicesRef = useRef<{ value: string; label: string }[]>([]);
  const empRef = useRef<{ value: string; label: string }[]>([]);
  const catRef = useRef<{ value: string; label: string }[]>([]);

  //search Parameter values
  const start_date = searchParams.get("startDate");
  const end_date = searchParams.get("endDate");
  const all_deals = searchParams.get("deals")?.split("|") || [];
  const sel_deals = all_deals.filter(
    (id) => !deals.find((deal) => deal.deal_id === id)?.auto_generated
  );
  const sel_services = all_deals.filter(
    (id) => deals.find((deal) => deal.deal_id === id)?.auto_generated
  );
  const sel_emp = searchParams.get("employees")?.split("|") || [];
  const sel_categories = searchParams.get("categories")?.split("|") || [];

  //default form Options
  const def_deals = sel_deals.map((id) => ({
    value: id,
    label:
      deals.find((deal) => deal.deal_id === id)?.deal_name || "No deal exists",
  }));
  const def_services = sel_services.map((id) => ({
    value: id,
    label:
      deals.find((deal) => deal.deal_id === id)?.deal_name ||
      "No service exists",
  }));
  const def_emp = sel_emp.map((id) => {
    const employee = employees.find((emp) => emp.emp_id === id);
    return {
      value: id,
      label: employee
        ? `${employee.emp_fname} ${employee.emp_lname}`
        : "No employee exists",
    };
  });

  const def_categories = sel_categories.map((id) => ({
    value: id,
    label:
      categories.find((cat) => cat.cat_id === id)?.cat_name ||
      "No Category exists",
  }));

  //other values
  let errorMessage: string = "";

  //Creating a Table
  //it throws an error, while passing service_records directly
  const nodes = [...service_records];
  const data = { nodes };

  const [ids, setIds] = useState<string[]>([]);

  const getEmployeeNames = (
    item: ServiceSaleRecordWithRelations,
    fullName?: boolean
  ) => {
    const emp_ids = item.employees.map((emp) => emp.emp_id);
    const emp_entities = employees.filter((emp) =>
      emp_ids.includes(emp.emp_id)
    );
    if (fullName) {
      return emp_entities
        .map((emp) => `${emp.emp_fname} ${emp.emp_lname}`)
        .join(", ");
    }
    return emp_entities.map((emp) => emp.emp_fname).join(", ");
  };

  const handleExpand = (item: ServiceSaleRecordWithRelations) => {
    if (ids.includes(item.service_record_id)) {
      setIds(ids.filter((id) => id !== item.service_record_id));
    } else {
      setIds(ids.concat(item.service_record_id));
    }
  };

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (item: ServiceSaleRecordWithRelations) => (
      <>
        {ids.includes(item.service_record_id) && (
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
                  <strong>Deals/Services</strong>
                  {item.deals.map((deal) => deal.deal_name).join(", ")}
                </li>
                <li>
                  <strong>Employees</strong> {getEmployeeNames(item, true)}
                </li>
              </ul>
            </td>
          </tr>
        )}
      </>
    ),
  };

  const COLUMNS = [
    {
      label: "Date",
      renderCell: (item: ServiceSaleRecordWithRelations) =>
        formatDate(item.created_at),
    },
    {
      label: "Client Name",
      renderCell: (item: ServiceSaleRecordWithRelations) =>
        `${item.client.client_fname} ${item.client.client_lname}`,
    },
    {
      label: "Total Amount",
      renderCell: (item: ServiceSaleRecordWithRelations) => item.total_amount,
    },
    {
      label: "Paid Amount",
      renderCell: (item: ServiceSaleRecordWithRelations) =>
        item.transactions.reduce(
          (sum, transaction) => sum + transaction.amount_paid,
          0
        ),
    },
    {
      label: "Deals/Services",
      renderCell: (item: ServiceSaleRecordWithRelations) =>
        item.deals.map((deal) => deal.deal_name).join(", "),
    },
    {
      label: "Employees",
      renderCell: getEmployeeNames,
    },
    {
      label: "Edit",
      renderCell: (item: ServiceSaleRecordWithRelations) => {
        return (
          <button
            onClick={() => navigate(`/salerecord/${item.service_record_id}`)}
          >
            Edit
          </button>
        );
      },
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

  const onDealsChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    dealsRef.current = [...newValue];
  };

  const onServicesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    servicesRef.current = [...newValue];
  };

  const onEmployeeChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    empRef.current = [...newValue];
  };

  const onCategoriesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    catRef.current = [...newValue];
  };

  const fetchFormValues = (formData: FormData) => {
    const start_date: string = (formData.get("start_date") as string) || "";
    const end_date: string = (formData.get("end_date") as string) || "";
    const mobile_num: string = (formData.get("mobile_num") as string) || "";
    const deals = dealsRef.current?.map((deal) => deal.value);
    const services = servicesRef.current?.map((service) => service.value);
    const all_deals = [...deals, ...services];
    const employees = empRef.current?.map((emp) => emp.value);
    const categories = catRef.current?.map((cat) => cat.value);
    if (start_date || end_date || mobile_num || employees || categories) {
      return {
        start_date,
        end_date,
        all_deals,
        mobile_num,
        employees,
        categories,
      };
    } else {
      return null;
    }
  };

  const setSearchParameters = (formValues: FormValues) => {
    const params = new URLSearchParams();

    // Loop over the properties of formValues and append them to params
    for (const [key, value] of Object.entries(formValues)) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Join array values with commas and append
          params.set(key, value.join("|"));
        }
      } else if (value) {
        // Append non-empty string values
        params.set(key, value);
      }
    }

    // Set the search params in the URL
    setSearchParams(params);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formValues = fetchFormValues(formData);
    if (!formValues) {
      errorMessage = "Atleast One vale must be selected";
      return;
    }
    setSearchParameters(formValues);
  };
  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Sales Page</h1>
      </div>
      <Form
        method="get"
        className="bg-white rounded w-1/2"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-semibold text-gray-700 mt-6">
          Search Records
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
          defaultValue={start_date ? formatDateToISO(start_date) : undefined}
          max={currentDate}
          className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        />
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
          defaultValue={end_date ? formatDate(end_date) : undefined}
          max={currentDate}
          className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        />
        <label
          htmlFor="mobile_num"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Client Mobile number
        </label>
        <input
          type="text"
          id="mobile_num"
          name="mobile_num"
          pattern="^0[0-9]{10}$"
          placeholder="03334290689"
          defaultValue={searchParams.get("mobile_num") || undefined}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        />
        <label
          htmlFor="services"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Services
        </label>
        <Select
          isMulti
          name="services"
          onChange={onServicesChange}
          options={fetchServices(deals)}
          defaultValue={def_services}
          className="basic-multi-select mt-2"
          classNamePrefix="select"
        />
        <label
          htmlFor="deals"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Deals
        </label>
        <Select
          isMulti
          name="deals"
          onChange={onDealsChange}
          id="deal"
          options={fetchDeals(deals)}
          defaultValue={def_deals}
          className="basic-multi-select mt-2"
          classNamePrefix="select"
        />
        <label
          htmlFor="employees"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Employees
        </label>
        <Select
          isMulti
          name="employees"
          onChange={onEmployeeChange}
          options={getEmployeeOptions(employees)}
          defaultValue={def_emp}
          className="basic-multi-select mt-2"
          classNamePrefix="select"
        />
        <label
          htmlFor="categories"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Categories
        </label>
        <Select
          isMulti
          name="categories"
          onChange={onCategoriesChange}
          options={getCategoryOptions(categories)}
          defaultValue={def_categories}
          className="basic-multi-select mt-2"
          classNamePrefix="select"
        />
        {errorMessage ? (
          <h2 className="text-red-500 font-semibold">{errorMessage}</h2>
        ) : undefined}
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Fetch
        </button>
      </Form>

      <div className="mt-20">
        <Link
          to="/salerecord/create"
          className=" bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Create a new record
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
