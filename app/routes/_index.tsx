import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma_client } from ".server/db";
import {
  Category,
  Client,
  Deal,
  Employee,
  Service_Sale_Record,
} from "@prisma/client";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import Select, { OnChangeValue } from "react-select";
import {
  fetchDeals,
  fetchServices,
  getCategoryOptions,
  getEmployeeOptions,
} from "shared/utilityFunctions";
import { useRef } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Ameera Management" },
    { name: "Sales Page", content: "This is the sales page of ameeraz" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const currentDate = new Date(new Date().toISOString().slice(0, 10));
  const startDate = new Date(searchParams.get("startDate") || currentDate);
  const endDate = new Date(searchParams.get("endDate") || currentDate);
  endDate.setHours(23, 59, 59);
  const encoded_deals = searchParams.get("deals");
  const client_mobile_num = searchParams.get("mob_num");
  let client: Client | null | undefined = undefined;
  if (client_mobile_num) {
    client = await prisma_client.client.findFirst({
      where: { client_mobile_num: client_mobile_num },
    });
    if (!client) {
      throw new Error("Specified Client doesn't exist");
    }
  }

  if (startDate > endDate) {
    throw new Error("Start Date can not be greater than End date");
  }
  // if (endDate > currentDate) {
  //   return { msg: "End date can not be greater than today's date" };
  // }

  const service_records = await prisma_client.service_Sale_Record.findMany({
    where: {
      created_at: { gte: startDate, lte: endDate },
      client_id: client?.client_id,
    },
  });

  const deals = await prisma_client.deal.findMany();
  const employees = await prisma_client.employee.findMany();
  const categories = await prisma_client.category.findMany();

  return { service_records, deals, employees, categories };
}

export default function Index() {
  const { service_records, deals, employees, categories } = useLoaderData<{
    service_records: Service_Sale_Record[];
    deals: Deal[];
    employees: Employee[];
    categories: Category[];
  }>();
  
  //references
  const dealsRef = useRef<{ value: string; label: string }[]>();
  const servicesRef = useRef<{ value: string; label: string }[]>();
  const empRef = useRef<{ value: string; label: string }[]>();
  const catRef = useRef<{ value: string; label: string }[]>();
  
  //it throws an error, while passing service_records directly
  const nodes = [...service_records];
  const data = { nodes };
  console.log(service_records);

  const COLUMNS = [
    {
      label: "Date",
      renderCell: (item: Service_Sale_Record) => item.created_at,
    },
    {
      label: "Client Name",
      renderCell: (item: Service_Sale_Record) => item.client_id,
    },
    {
      label: "Total Amount",
      renderCell: (item: Service_Sale_Record) => item.total_amount,
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
    console.log(dealsRef.current);
  };

  const onServicesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    servicesRef.current = [...newValue];
    console.log(servicesRef.current);
  };

  const onEmployeeChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    empRef.current = [...newValue];
    console.log(empRef.current);
  };

  const onCategoriesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    catRef.current = [...newValue];
    console.log(catRef.current);
  };
  return (
    <div>
      <h1 className="text-red-500">This is the index page</h1>
      <Link to="/salerecord/create">Create a new record</Link>

      <Form method="get">
        <label htmlFor="mobile_num">Client Mobile number</label>
        <input
          type="text"
          id="mobile_num"
          name="mobile_num"
          pattern="^0[0-9]{10}$"
          placeholder="03334290689"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          required
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
          className="basic-multi-select mt-2"
          classNamePrefix="select"
          required
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
          className="basic-multi-select mt-2"
          classNamePrefix="select"
        />
      </Form>

      <div className="mt-60">
        <CompactTable columns={COLUMNS} data={data} theme={theme} />
      </div>
    </div>
  );
}
