// //This component is a template for displaying entities
// import { useState } from "react";
// import { Form } from "@remix-run/react";
// import { CompactTable } from "@table-library/react-table-library/compact";
// import { useTheme } from "@table-library/react-table-library/theme";
// import { getTheme } from "@table-library/react-table-library/baseline";
// import Select, { OnChangeValue } from "react-select";
// import { ServiceSaleRecordWithRelations } from "~/utils/types";
// export default function Entity() {
//   const [ids, setIds] = useState<string[]>([]);
//   let errorMessage = "";
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

//   return (
//     <div className="m-8">
//       <div className="w-full flex justify-center items-center ">
//         <h1 className=" font-semibold text-6xl text-gray-700">
//           Title of the page
//         </h1>
//       </div>
//       <Form method="get" className="bg-white rounded w-1/2">
//         <label
//           htmlFor="rand_id"
//           className="block text-gray-700 text-sm font-bold mt-4"
//         >
//           Random
//         </label>

//         <input
//           type="text"
//           className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
//         />

//         <Select
//           isMulti
//           name="services"
//           //   onChange={onServicesChange}
//           //   options={fetchServices(deals)}
//           //   defaultValue={def_services}
//           className="basic-multi-select mt-2"
//           classNamePrefix="select"
//         />
//         {errorMessage && (
//           <h2 className="text-red-500 font-semibold">{errorMessage}</h2>
//         )}
//         <button
//           type="submit"
//           className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Fetch
//         </button>
//       </Form>

//       <CompactTable
//         columns={COLUMNS}
//         // data={data}
//         theme={theme}
//         rowProps={ROW_PROPS}
//         rowOptions={ROW_OPTIONS}
//       />
//     </div>
//   );
// }
