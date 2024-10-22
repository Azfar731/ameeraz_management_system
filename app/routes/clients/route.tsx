//This component is a template for displaying entities
import { useRef, useState } from "react";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import Select, { OnChangeValue } from "react-select";
import { ServiceSaleRecordWithRelations } from "~/utils/types";
import areasList from "./areas.json";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getSearchParams, fetchClients } from "./utilityFunctions.server";
import { Client } from "@prisma/client";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const { mobile_num, fname, lname, areas } = getSearchParams(searchParams);
  if (mobile_num || fname || lname || areas) {
    const clients = await fetchClients(mobile_num, fname, lname, areas);
    return { clients };
  }
  return {clients: []};
  
}

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { clients } = useLoaderData<{ clients: Client[] }>();
  console.log("Clients Fetched: ", clients);
  //other values
  const area_options = areasList.areas.map((area) => ({
    value: area,
    label: area,
  }));
  let errorMessage: string = "";

  //references
  const areasRef = useRef<{ value: string; label: string }[]>([]);
  //table values
  //   const [ids, setIds] = useState<string[]>([]);

  //   const handleExpand = (item: ServiceSaleRecordWithRelations) => {
  //     if (ids.includes(item.service_record_id)) {
  //       setIds(ids.filter((id) => id !== item.service_record_id));
  //     } else {
  //       setIds(ids.concat(item.service_record_id));
  //     }
  //   };

  //   const ROW_PROPS = {
  //     onClick: handleExpand,
  //   };

  //   const ROW_OPTIONS = {
  //     renderAfterRow: (item: ServiceSaleRecordWithRelations) => (
  //       <>
  //         {ids.includes(item.service_record_id) && (
  //           <tr style={{ display: "flex", gridColumn: "1 / -1" }}>
  //             <td style={{ flex: "1" }}>
  //               <ul
  //                 style={{
  //                   margin: "0",
  //                   padding: "0",
  //                   backgroundColor: "#e0e0e0",
  //                 }}
  //               >
  //                 <li>
  //                   <strong>Deals/Services</strong>
  //                   {item.deals.map((deal) => deal.deal_name).join(", ")}
  //                 </li>
  //                 <li>
  //                   <strong>Employees</strong> {"Data for employees"}
  //                 </li>
  //               </ul>
  //             </td>
  //           </tr>
  //         )}
  //       </>
  //     ),
  //   };

  //   const COLUMNS = [
  //     {
  //       label: "Date",
  //       renderCell: (item: ServiceSaleRecordWithRelations) =>
  //         "Return Value for the function",
  //     },
  //     {
  //       label: "Client Name",
  //       renderCell: (item: ServiceSaleRecordWithRelations) =>
  //         `${item.client.client_fname} ${item.client.client_lname}`,
  //     },
  //   ];

  //   const theme = useTheme([
  //     getTheme(),
  //     {
  //       HeaderRow: `
  //             background-color: #eaf5fd;
  //           `,
  //       Row: `
  //             &:nth-of-type(odd) {
  //               background-color: #d2e9fb;
  //             }

  //             &:nth-of-type(even) {
  //               background-color: #eaf5fd;
  //             }
  //           `,
  //     },
  //   ]);

  const getFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const mobile_num = (formData.get("mobile_num") as string) || "";
    const fname = (formData.get("fname") as string) || "";
    const lname = (formData.get("lname") as string) || "";
    const areas = areasRef.current?.map((area) => area.value);
    if (mobile_num || fname || lname || areas) {
      return { mobile_num, fname, lname, areas };
    }
    return null;
  };

  const setSearchParameters = (formValues: {
    mobile_num: string;
    fname: string;
    lname: string;
    areas: string[];
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
          placeholder="Razzaq"
        />
        <label htmlFor="area">Client Area</label>
        <Select
          isMulti
          name="area"
          onChange={onAreaChange}
          options={area_options}
          //   defaultValue={def_services}
          className="basic-multi-select mt-2"
          classNamePrefix="select"
        />
        {errorMessage && (
          <h2 className="text-red-500 font-semibold">{errorMessage}</h2>
        )}
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Fetch
        </button>
      </Form>

      {/* <CompactTable
        columns={COLUMNS}
        data={data}
        theme={theme}
        rowProps={ROW_PROPS}
        rowOptions={ROW_OPTIONS}
      /> */}
    </div>
  );
}
