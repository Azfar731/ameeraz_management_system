import { Link } from "@remix-run/react";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import { useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { ProductTransactionWithRelations } from "~/utils/productTransaction/types";
import { formatDate } from "shared/utilityFunctions";
import { capitalizeFirstLetter } from "~/utils/functions";
import { SerializeFrom } from "@remix-run/node";

interface ProductTransactionTableProps {
  transactions: SerializeFrom<ProductTransactionWithRelations[]>;
}

export default function ProductTransactionTable({
  transactions,
}: ProductTransactionTableProps) {
  const [ids, setIds] = useState<string[]>([]);
  const nodes = [...transactions];
  const data = { nodes };

  const handleExpand = (item: ProductTransactionWithRelations) => {
    if (ids.includes(item.product_trans_id)) {
      setIds(ids.filter((id) => id !== item.product_trans_id));
    } else {
      setIds(ids.concat(item.product_trans_id));
    }
  };

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (item: ProductTransactionWithRelations) => (
      <>
        {ids.includes(item.product_trans_id) && (
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
                    to={`${item.record.product_record_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:font-semibold"
                  >
                    Product Sale Record Link
                  </Link>
                </li>
                <li>
                  <strong>Total Amount: </strong>
                  {item.record.total_amount}
                </li>
                <li>
                  <strong>{`${
                    item.record.client ? "Client" : "Vendor"
                  } Mobile Number: `}</strong>
                  {item.record.client?.client_mobile_num ||
                    item.record.vendor?.vendor_mobile_num}
                </li>
                <li>
                  <strong>Products</strong>
                  {item.record.products
                    .map((record) => record.product.prod_name)
                    .join(", ")}
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
      renderCell: (item: ProductTransactionWithRelations) =>
        formatDate(item.created_at),
    },
    {
      label: "Client Name",
      renderCell: (item: ProductTransactionWithRelations) =>
        item.record.client
          ? `${item.record.client?.client_fname} ${item.record.client?.client_lname}`
          : "N/A",
    },
    {
      label: "Vendor Name",
      renderCell: (item: ProductTransactionWithRelations) =>
        item.record.vendor
          ? `${item.record.vendor?.vendor_fname} ${item.record.vendor?.vendor_lname}`
          : "N/A",
    },
    {
      label: "Paid Amount",
      renderCell: (item: ProductTransactionWithRelations) => item.amount_paid,
    },
    {
      label: "Payment Cleared",
      renderCell: (item: ProductTransactionWithRelations) =>
        item.record.payment_cleared ? "Yes" : "No",
    },
    {
      label: "Transaction Type",
      renderCell: (item: ProductTransactionWithRelations) =>
        capitalizeFirstLetter(item.record.transaction_type),
    },
    {
      label: "Mode of Payment",
      renderCell: (item: ProductTransactionWithRelations) =>
        capitalizeFirstLetter(item.mode_of_payment),
    },
    {
      label: "Products",
      renderCell: (item: ProductTransactionWithRelations) =>
        item.record.products
          .map((record) => record.product.prod_name)
          .join(", "),
    },
    {
      label: "View",
      renderCell: (item: ProductTransactionWithRelations) => {
        return (
          <Link to={`${item.product_trans_id}`}>
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
    <CompactTable
      columns={COLUMNS}
      data={data}
      theme={theme}
      rowProps={ROW_PROPS}
      rowOptions={ROW_OPTIONS}
    />
  );
}
