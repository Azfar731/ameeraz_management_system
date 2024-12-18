import { Category, Deal, Employee } from "@prisma/client";
import type { MetaFunction } from "@remix-run/node";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams
} from "@remix-run/react";
import { useRef, useState } from "react";
import Select, { OnChangeValue } from "react-select";
import {
  fetchDeals,
  fetchServices,
  formatDate,
  formatDateToISO,
  getCategoryOptions,
  getEmployeeOptions,
} from "shared/utilityFunctions";
import { prisma_client } from "~/.server/db";
import { fetchServiceSaleRecords } from "~/utils/serviceSaleRecord/db.server";
import { ServiceSaleRecordFetchErrors, ServiceSaleRecordWithRelations } from "~/utils/serviceSaleRecord/types";
import { ServiceSaleRecordFetchSchema } from "~/utils/serviceSaleRecord/validation.server";
import SalesRecordTable from "./SalesRecordTable";
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

  // Extract filters
  const formData = extractFilters(searchParams);

  const deals = await prisma_client.deal.findMany();
  const employees = await prisma_client.employee.findMany();
  const categories = await prisma_client.category.findMany();

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
  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;

  const deal_ids = searchParams.get("all_deals")?.split("|");
  const employee_ids = searchParams.get("employees")?.split("|");
  const category_ids = searchParams.get("categories")?.split("|");
  const client_mobile_num = searchParams.get("mobile_num") || undefined;

  return {
    deal_ids,
    employee_ids,
    category_ids,
    client_mobile_num,
    start_date,
    end_date,
  };
}

export default function Index() {
  //states
  const [currentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Formats the date to 'YYYY-MM-DD'
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate()
  const [formSubmitErrorMessage, setFormSubmitErrorMessage] =
    useState<string>("");
  //loader Data
  const { service_records, deals, employees, categories, errorMessages } =
    useLoaderData<{
      service_records: ServiceSaleRecordWithRelations[];
      deals: Deal[];
      employees: Employee[];
      categories: Category[];
      errorMessages: ServiceSaleRecordFetchErrors;
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
    if (
      start_date ||
      end_date ||
      mobile_num ||
      employees.length > 0 ||
      categories.length > 0 ||
      all_deals.length > 0
    ) {
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
      setFormSubmitErrorMessage("Atleast One vale must be selected");
      return;
    }
    setFormSubmitErrorMessage("");
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
          onChange={onEmployeeChange}
          options={getEmployeeOptions(employees)}
          defaultValue={def_emp}
          className="basic-multi-select mt-2"
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
          onChange={onCategoriesChange}
          options={getCategoryOptions(categories)}
          defaultValue={def_categories}
          className="basic-multi-select mt-2"
          classNamePrefix="select"
        />
        {errorMessages?.category_ids && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.category_ids[0]}
          </h2>
        )}
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Fetch
        </button>
        {formSubmitErrorMessage && (
          <h2 className="text-red-500 font-semibold">
            {formSubmitErrorMessage}
          </h2>
        )}
      </Form>

      <div className="mt-20">
        <Link
          to="/salerecord/create"
          className=" bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Create a new record
        </Link>
        <div className="mt-6">
          <SalesRecordTable
            serviceRecords={service_records}
            employees={employees}
            onEdit={(id) => navigate(`/salerecord/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
