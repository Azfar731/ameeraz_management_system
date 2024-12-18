import { useState } from "react";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { CompactTable } from "@table-library/react-table-library/compact";
import { formatDate } from "shared/utilityFunctions";
import { ServiceSaleRecordWithRelations } from "~/utils/serviceSaleRecord/types";
import { Employee } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";

interface SalesRecordTableProps {
  serviceRecords: SerializeFrom<ServiceSaleRecordWithRelations[]>;
  employees: Employee[];
  onEdit: (id: string) => void;
}

export default function SalesRecordTable({
  serviceRecords,
  employees,
  onEdit,
}: SalesRecordTableProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const handleExpand = (record: ServiceSaleRecordWithRelations) => {
    if (expandedIds.includes(record.service_record_id)) {
      setExpandedIds(
        expandedIds.filter((id) => id !== record.service_record_id)
      );
    } else {
      setExpandedIds([...expandedIds, record.service_record_id]);
    }
  };

  const getEmployeeNames = (
    record: ServiceSaleRecordWithRelations,
    fullName = false
  ) => {
    const empIds = record.employees.map((emp) => emp.emp_id);
    const empEntities = employees.filter((emp) => empIds.includes(emp.emp_id));
    return fullName
      ? empEntities.map((emp) => `${emp.emp_fname} ${emp.emp_lname}`).join(", ")
      : empEntities.map((emp) => emp.emp_fname).join(", ");
  };

  const data = { nodes: serviceRecords };

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (record: ServiceSaleRecordWithRelations) => (
      <>
        {expandedIds.includes(record.service_record_id) && (
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
                  <strong>Deals/Services:</strong>{" "}
                  {record.deal_records
                    .map((record) => record.deal.deal_name)
                    .join(", ")}
                </li>
                <li>
                  <strong>Employees:</strong> {getEmployeeNames(record, true)}
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
      renderCell: (record: ServiceSaleRecordWithRelations) =>
        formatDate(record.created_at),
    },
    {
      label: "Client Name",
      renderCell: (record: ServiceSaleRecordWithRelations) =>
        `${record.client.client_fname} ${record.client.client_lname}`,
    },
    {
      label: "Total Amount",
      renderCell: (record: ServiceSaleRecordWithRelations) =>
        record.total_amount,
    },
    {
      label: "Paid Amount",
      renderCell: (record: ServiceSaleRecordWithRelations) =>
        record.transactions.reduce(
          (sum, transaction) => sum + transaction.amount_paid,
          0
        ),
    },
    {
      label: "Deals/Services",
      renderCell: (record: ServiceSaleRecordWithRelations) =>
        record.deal_records.map((record) => record.deal.deal_name).join(", "),
    },
    {
      label: "Employees",
      renderCell: getEmployeeNames,
    },
    {
      label: "Edit",
      renderCell: (record: ServiceSaleRecordWithRelations) => (
        <button onClick={() => onEdit(record.service_record_id)}>Edit</button>
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
    <CompactTable
      columns={COLUMNS}
      data={data}
      theme={theme}
      rowProps={ROW_PROPS}
      rowOptions={ROW_OPTIONS}
    />
  );
}
