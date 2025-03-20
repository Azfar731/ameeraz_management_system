import { Category, Deal, Employee } from "@prisma/client";
import type { MetaFunction } from "@remix-run/node";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useState } from "react";
import Select from "react-select";
import {
  fetchDeals,
  fetchServices,
  formatDate,
  formatDateToISO,
  getCategoryOptions,
  getEmployeeOptions,
} from "shared/utilityFunctions";
import { fetchServiceSaleRecords } from "~/utils/serviceSaleRecord/db.server";
import {
  ServiceSaleRecordFetchErrors,
  ServiceSaleRecordWithRelations,
} from "~/utils/serviceSaleRecord/types";
import { ServiceSaleRecordFetchSchema } from "~/utils/serviceSaleRecord/validation.server";
import SalesRecordTable from "./SalesRecordTable";
import { getAllEmployees } from "~/utils/employee/db.server";
import { getAllDeals } from "~/utils/deal/db.server";
import { getAllCategories } from "~/utils/category/db.server";
import { authenticate } from "~/utils/auth/functions.server";
import { FaPlus } from "react-icons/fa";

export const meta: MetaFunction = () => {
  return [
    { title: "Ameeraz Management" },
    { name: "Sales Page", content: "This is the sales page of ameeraz" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  //authenticate user
  await authenticate({ request, requiredClearanceLevel: 1 });

  const searchParams = new URL(request.url).searchParams;

  // Extract filters
  const formData = extractFilters(searchParams);

  const deals = await getAllDeals();
  const employees = await getAllEmployees();
  const categories = await getAllCategories();

  const validationResult = await ServiceSaleRecordFetchSchema.safeParseAsync(
    formData
  );
  if (!validationResult.success) {
    return {
      errorMessages: validationResult.error.flatten().fieldErrors,
      service_records: [],
      deals,
      employees,
      categories,
    };
  }

  const service_records = await fetchServiceSaleRecords(validationResult.data);

  return { service_records, deals, employees, categories };
}

//Helper function to extract Filters from Search Params.
function extractFilters(searchParams: URLSearchParams) {
  for (const [key, value] of searchParams.entries()) {
    if (value === "") {
      searchParams.delete(key);
    }
  }

  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;
  const client_mobile_num = searchParams.get("mobile_num") || undefined;
  const payment_cleared = searchParams.get("payment_cleared") || undefined;
  const deals = searchParams.getAll("deals").filter((val) => val !== "");
  const services = searchParams.getAll("services").filter((val) => val !== "");
  const employee_ids = searchParams
    .getAll("employees")
    .filter((val) => val !== "");
  const category_ids = searchParams
    .getAll("categories")
    .filter((val) => val !== "");

  //const payment_options = searchParams.getAll("payment_options").filter(val => val !== "");
  const deal_ids = [...deals, ...services];

  return {
    deal_ids: deal_ids.length > 0 ? deal_ids : undefined,
    employee_ids: employee_ids.length > 0 ? employee_ids : undefined,
    category_ids: category_ids.length > 0 ? category_ids : undefined,
    client_mobile_num,
    start_date,
    end_date,
    payment_cleared,
  };
}

export default function Index() {
  //states
  const [currentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Formats the date to 'YYYY-MM-DD'
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === "loading" || navigation.state === "submitting";

  //loader Data
  const { service_records, deals, employees, categories, errorMessages } =
    useLoaderData<{
      service_records: ServiceSaleRecordWithRelations[];
      deals: Deal[];
      employees: Employee[];
      categories: Category[];
      errorMessages: ServiceSaleRecordFetchErrors;
    }>();

  //search Parameter values
  const start_date = searchParams.get("startDate");
  const end_date = searchParams.get("endDate");
  const all_deals =
    searchParams
      .get("deals")
      ?.split("|")
      .filter((val) => val !== "") || [];
  const sel_deals = all_deals.filter(
    (id) => !deals.find((deal) => deal.deal_id === id)?.auto_generated
  );
  const sel_services = all_deals.filter(
    (id) => deals.find((deal) => deal.deal_id === id)?.auto_generated
  );
  const sel_emp =
    searchParams
      .get("employees")
      ?.split("|")
      .filter((val) => val !== "") || [];
  const sel_categories =
    searchParams
      .get("categories")
      ?.split("|")
      .filter((val) => val !== "") || [];

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

  return (
    <div className="m-4 pb-4">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Sales Page</h1>
      </div>
      <Form method="get" className="bg-white rounded w-1/2">
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
        {errorMessages?.start_date && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.start_date[0]}
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
          defaultValue={end_date ? formatDate(end_date) : undefined}
          max={currentDate}
          className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        />
        {errorMessages?.end_date && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.end_date[0]}
          </h2>
        )}
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
        {errorMessages?.client_mobile_num && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.client_mobile_num[0]}
          </h2>
        )}
        <label
          htmlFor="services"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Services
        </label>
        <Select
          isMulti
          name="services"
          options={fetchServices(deals)}
          defaultValue={def_services}
          className=" mt-2"
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
          id="deal"
          options={fetchDeals(deals)}
          defaultValue={def_deals}
          className=" mt-2"
          classNamePrefix="select"
        />
        {errorMessages?.deal_ids && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.deal_ids[0]}
          </h2>
        )}
        <label
          htmlFor="employees"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Employees
        </label>
        <Select
          isMulti
          name="employees"
          options={getEmployeeOptions(employees)}
          defaultValue={def_emp}
          className=" mt-2"
          classNamePrefix="select"
        />
        {errorMessages?.employee_ids && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.employee_ids[0]}
          </h2>
        )}
        <label
          htmlFor="categories"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Categories
        </label>
        <Select
          isMulti
          name="categories"
          options={getCategoryOptions(categories)}
          defaultValue={def_categories}
          className=" mt-2"
          classNamePrefix="select"
        />
        {errorMessages?.category_ids && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.category_ids[0]}
          </h2>
        )}
        <label
          htmlFor="payment_cleared"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Payment Status
        </label>
        <Select
          id="payment_cleared"
          name="payment_cleared"
          options={[
            { value: "paid", label: "Paid" },
            { value: "pending", label: "Pending" },
            { value: undefined, label: "Any" },
          ]}
          className=" mt-2"
          classNamePrefix="select"
        />
        <button
          type="submit"
          disabled={
            navigation.state === "submitting" || navigation.state === "loading"
          }
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Fetch
        </button>
      </Form>

      <div className="mt-20">
        <button
          disabled={isNavigating}
          className="w-60 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Link
            to="/salerecord/create"
            className="flex items-center justify-around"
            aria-disabled={isNavigating}
          >
            Create a new record <FaPlus />
          </Link>
        </button>
        <div className="mt-6">
          <SalesRecordTable
            serviceRecords={service_records}
            onEdit={(id) => navigate(`/salerecord/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
