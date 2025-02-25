import { useRef } from "react";
import {
  Form,
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import Select, { OnChangeValue } from "react-select";

import areasList from "../../components/clients/areas.json";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Boolean_Strings, Client } from "@prisma/client";
import { formatDate } from "shared/utilityFunctions";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";
// import * as Sentry from "@sentry/remix";
import { getSearchParams } from "~/utils/client/functions";
import { getClients } from "~/utils/client/db.server";
export async function loader({ request }: LoaderFunctionArgs) {
  
  
  
  // if (!Sentry.getClient()) {
  //   console.error("No Sentry client initialized!");
  //   throw new Response("Sentry is not configured correctly", {
  //     status: 500,
  //     statusText: "Internal Server Error"
  //   });
  // }
  
  // const errorID = Sentry.captureException(new Error("Exception thrown from client"))
  // console.log("Error ID: ", errorID)

  // const promiseRes =  await Sentry.flush()
  // console.log("Sentry Promise result", promiseRes)
  
  // throw new Response("Testing Response Error Boundary New", {
  //   status: 500,
  //   statusText: "Internal Server Error"
  // });
  // throw new Error("This is the error thrown from loader")
  const searchParams = new URL(request.url).searchParams;
  const { mobile_num, fname, lname, areas, subscribe } =
    getSearchParams(searchParams);
  if (mobile_num || fname || lname || areas || subscribe) {
    const clients = await getClients({
      mobile_num,
      fname,
      lname,
      areas,
      subscribe: subscribe as Boolean_Strings,
    });
    return { clients };
  }
  return { clients: [] };
}

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    mobile_num: sp_mobile_num,
    fname: sp_fname,
    lname: sp_lname,
    areas: sp_areas,
  } = getSearchParams(searchParams);
  const { clients } = useLoaderData<{ clients: Client[] }>();
  const navigation = useNavigation();
  //other values
  const area_options = areasList.areas.map((area) => ({
    value: area,
    label: area,
  }));
  let errorMessage: string = "";

  //references
  const areasRef = useRef<{ value: string; label: string }[]>([]);
  //table values
  const nodes = [...clients];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Mobile Number",
      renderCell: (item: Client) => item.client_mobile_num,
    },
    {
      label: "First Name",
      renderCell: (item: Client) => `${item.client_fname}`,
    },
    {
      label: "Last Name",
      renderCell: (item: Client) => `${item.client_lname}`,
    },
    {
      label: "Area",
      renderCell: (item: Client) => `${item.client_area}`,
    },
    {
      label: "Subscribed",
      renderCell: (item: Client) => `${item.subscribed}`,
    },
    {
      label: "Registrated On",
      renderCell: (item: Client) => formatDate(item.created_at),
    },
    {
      label: "View",
      renderCell: (item: Client) => (
        <Link
          to={`${item.client_id}`}
          state={{ sp_mobile_num, sp_areas, sp_fname, sp_lname }}
        >
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

  const getFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const mobile_num = (formData.get("mobile_num") as string) || "";
    const fname = (formData.get("fname") as string) || "";
    const lname = (formData.get("lname") as string) || "";
    const subscribe = (formData.get("subscribe") as string) || "";
    // const areas = areasRef.current?.map((area) => area.value);

    const areas = formData
      .getAll("area")
      .map((value) => String(value))
      .filter((val) => val.trim() !== "");

    if (mobile_num || fname || lname || areas || subscribe) {
      return { mobile_num, fname, lname, areas, subscribe };
    }
    return null;
  };

  const setSearchParameters = (formValues: {
    mobile_num: string;
    fname: string;
    lname: string;
    areas: string[];
    subscribe: string;
  }) => {
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formValues = getFormData(form);
    if (!formValues) {
      errorMessage = "Atleast one input must be provided";
      return;
    }
    setSearchParameters(formValues);
  };

  const onAreaChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    areasRef.current = [...newValue];
    console.log(areasRef.current);
  };

  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Clients</h1>
      </div>
      <Form
        method="get"
        className="bg-white rounded w-1/2"
        onSubmit={handleSubmit}
      >
        <label
          htmlFor="mobile_num"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Mobile Number
        </label>
        <input
          type="text"
          name="mobile_num"
          id="mobile_num"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
          pattern="^0[0-9]{10}$"
          defaultValue={sp_mobile_num}
          placeholder="03334290689"
        />
        <label
          htmlFor="fname"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          First Name
        </label>
        <input
          type="text"
          name="fname"
          id="fname"
          pattern="^[A-Za-z]+$"
          defaultValue={sp_fname}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
          placeholder="Irha"
        />
        <label
          htmlFor="lname"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Last Name
        </label>
        <input
          type="text"
          name="lname"
          id="lname"
          pattern="^[A-Za-z]+(\s[A-Za-z]+)*$"
          defaultValue={sp_lname}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
          placeholder="Razzaq"
        />
        <label
          htmlFor="area"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Client Area
        </label>
        <Select
          isMulti
          name="area"
          onChange={onAreaChange}
          options={area_options}
          defaultValue={sp_areas?.map((area) => ({ value: area, label: area }))}
          className="basic-multi-select mt-2 "
          classNamePrefix="select"
        />
        <label
          htmlFor="subscribe"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Client Subscription
        </label>
        <Select
          name="subscribe"
          options={[
            { value: "true", label: "true" },
            { value: "false", label: "false" },
          ]}
          isClearable
          className="basic-multi-select mt-2 "
          classNamePrefix="select"
        />
        {errorMessage && (
          <h2 className="text-red-500 font-semibold">{errorMessage}</h2>
        )}
        <button
          type="submit"
          disabled={
            navigation.state === "loading" || navigation.state === "submitting"
          }
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed "
        >
          Fetch
        </button>
      </Form>

      <div className="mt-20">
        <Link
          to="create"
          className="w-44 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Register Client <FaPlus />
        </Link>
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
    </div>
  );
}
