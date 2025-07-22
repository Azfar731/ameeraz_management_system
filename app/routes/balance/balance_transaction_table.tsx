import { useState } from "react";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { formatDate } from "shared/utilityFunctions";
import type { BalanceTransactionWithRelations } from "~/utils/balance_transactions/types";
import { SerializeFrom } from "@remix-run/node";

export default function Balance_Transaction_Table({
  transactions,
}: {
  transactions: SerializeFrom<BalanceTransactionWithRelations>[];
}) {
  //   const [expandedIds, setExpandedIds] = useState<string[]>([]);

  //   const handleExpand = (record: ServiceSaleRecordWithRelations) => {
  //     if (expandedIds.includes(record.service_record_id)) {
  //       setExpandedIds(
  //         expandedIds.filter((id) => id !== record.service_record_id)
  //       );
  //     } else {
  //       setExpandedIds([...expandedIds, record.service_record_id]);
  //     }
  //   };

  //   const getEmployeeNames = (
  //     item: ServiceSaleRecordWithRelations,
  //     getFullName = false
  //   ) => {
  //     return item.employees
  //       .map((record) =>
  //         getFullName
  //           ? `${record.employee.emp_fname} ${record.employee.emp_lname}`
  //           : record.employee.emp_fname
  //       )
  //       .join(",");
  //   };

  const data = { nodes: transactions };

  //   const ROW_PROPS = {
  //     onClick: handleExpand,
  //   };

  //   const ROW_OPTIONS = {
  //     renderAfterRow: (record: ServiceSaleRecordWithRelations) => (
  //       <>
  //         {expandedIds.includes(record.service_record_id) && (
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
  //                   <strong>Deals/Services:</strong>{" "}
  //                   {record.deal_records
  //                     .map(
  //                       (record) => `${record.deal.deal_name}(${record.quantity})`
  //                     )
  //                     .join(", ")}
  //                 </li>
  //                 <li>
  //                   <strong>Employees:</strong> {getEmployeeNames(record, true)}
  //                 </li>
  //               </ul>
  //             </td>
  //           </tr>
  //         )}
  //       </>
  //     ),
  //   };

  const COLUMNS = [
    {
      label: "Date",
      renderCell: (record: BalanceTransactionWithRelations) =>
        formatDate(record.created_at),
    },
    {
      label: "Amount",
      renderCell: (record: BalanceTransactionWithRelations) => record.amount,
    },
    {
      label: "Type",
      renderCell: (record: BalanceTransactionWithRelations) => record.type,
    },
    {
      label: "User Name",
      renderCell: (record: BalanceTransactionWithRelations) =>
        `${record.user.fname} ${record.user.lname}`,
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
    <CompactTable
      columns={COLUMNS}
      data={data}
      theme={theme}
      //   rowProps={ROW_PROPS}
      //   rowOptions={ROW_OPTIONS}
    />
  );
}
