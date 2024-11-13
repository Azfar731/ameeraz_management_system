import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { getPendingServiceSaleRecords } from "~/utils/saleRecord/db.server";
import { ServiceSaleRecordWithRelations } from "~/utils/saleRecord/types";
import { formatDate } from "shared/utilityFunctions";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { FaExternalLinkAlt } from "react-icons/fa";

export async function loader() {
  const pending_records = await getPendingServiceSaleRecords();
  return { pending_records };
}

export default function Client_Transaction_Create_Part1() {
  const { pending_records } = useLoaderData<{
    pending_records: ServiceSaleRecordWithRelations[];
  }>();

  //table values
  const nodes = [...pending_records];
  const data = { nodes };

  const [ids, setIds] = useState<string[]>([]);

  const getEmployeeNames = (
    item: ServiceSaleRecordWithRelations,
    getFullName = false
  ) => {
    return item.employees
      .map(
        (record) =>
          `${record.employee.emp_fname} ${
            getFullName && record.employee.emp_lname
          }`
      )
      .join(",");
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
      label: "Select",
      renderCell: (item: ServiceSaleRecordWithRelations) => {
        return (
          <Link to={`${item.service_record_id}`}>
            <FaExternalLinkAlt />
          </Link>
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

  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-3xl text-gray-700">
          Choose a Pending Sale Record
        </h1>
      </div>

      <div className="mt-8">
        <CompactTable
          columns={COLUMNS}
          data={data}
          theme={theme}
          rowProps={ROW_PROPS}
          rowOptions={ROW_OPTIONS}
        />
      </div>
    </div>
  );
}
