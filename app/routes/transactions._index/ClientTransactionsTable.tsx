// ClientTransactionsTable.tsx
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { Link } from "@remix-run/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { ClientTransactionWithRelations } from "~/utils/clientTransaction/types";
import { formatDate } from "shared/utilityFunctions";
import { capitalizeFirstLetter } from "~/utils/functions";
import { useState } from "react";
import { SerializeFrom } from "@remix-run/node";

export default function ClientTransactionsTable({
  transactions,
}: {
  transactions: SerializeFrom<ClientTransactionWithRelations>[];
}) {
  const nodes = [...transactions];
  const data = { nodes };

  const [ids, setIds] = useState<string[]>([]);

  const handleExpand = (item: ClientTransactionWithRelations) => {
    if (ids.includes(item.client_transaction_id)) {
      setIds(ids.filter((id) => id !== item.client_transaction_id));
    } else {
      setIds(ids.concat(item.client_transaction_id));
    }
  };

  const COLUMNS = [
    {
      label: "Date",
      renderCell: (item: ClientTransactionWithRelations) =>
        formatDate(item.created_at),
    },
    {
      label: "Client Name",
      renderCell: (item: ClientTransactionWithRelations) =>
        `${item.record.client.client_fname} ${item.record.client.client_lname}`,
    },
    {
      label: "Paid Amount",
      renderCell: (item: ClientTransactionWithRelations) => item.amount_paid,
    },
    {
      label: "Payment Cleared",
      renderCell: (item: ClientTransactionWithRelations) =>
        item.record.payment_cleared ? "Yes" : "No",
    },
    {
      label: "Mode of Payment",
      renderCell: (item: ClientTransactionWithRelations) =>
        capitalizeFirstLetter(item.mode_of_payment),
    },
    {
      label: "Deals/Services",
      renderCell: (item: ClientTransactionWithRelations) =>
        item.record.deal_records.map((rec) => rec.deal.deal_name).join(", "),
    },
    {
      label: "View",
      renderCell: (item: ClientTransactionWithRelations) => (
        <Link
          to={`/transactions/clientTransactions/${item.client_transaction_id}`}
        >
          <FaExternalLinkAlt />
        </Link>
      ),
    },
  ];

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (item: ClientTransactionWithRelations) => (
      <>
        {ids.includes(item.client_transaction_id) && (
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
                  <Link
                    to={`/salerecord/${item.record.service_record_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:font-semibold"
                  >
                    Sale Record Link
                  </Link>
                </li>
                <li>
                  <strong>Total Amount: </strong>
                  {item.record.total_amount}
                </li>
                <li>
                  <strong>Client Mobile Number: </strong>
                  {item.record.client.client_mobile_num}
                </li>
                <li>
                  <strong>Deals/Services: </strong>
                  {item.record.deal_records
                    .map((rec) => rec.deal.deal_name)
                    .join(", ")}
                </li>
              </ul>
            </td>
          </tr>
        )}
      </>
    ),
  };

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
