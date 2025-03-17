import { Link } from "@remix-run/react";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import { useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { formatDate } from "shared/utilityFunctions";
import { ProductSaleRecordWithRelations } from "~/utils/productSaleRecord/types";
import { SerializeFrom } from "@remix-run/node";

interface ProductSaleRecordTableProps {
  records: SerializeFrom<ProductSaleRecordWithRelations[]>;
}

export default function ProductSaleRecordTable({
  records,
}: ProductSaleRecordTableProps) {
  const [ids, setIds] = useState<string[]>([]);
  const nodes = [...records];
  const data = { nodes };

  const handleExpand = (item: ProductSaleRecordWithRelations) => {
    if (ids.includes(item.product_record_id)) {
      setIds(ids.filter((id) => id !== item.product_record_id));
    } else {
      setIds(ids.concat(item.product_record_id));
    }
  };

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (item: ProductSaleRecordWithRelations) => (
      <>
        {ids.includes(item.product_record_id) && (
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
                  <strong>Products</strong>
                  {item.products.map((rec) => rec.product.prod_name).join(", ")}
                </li>
                <li>
                  <strong>Client Mobile Number: </strong>{" "}
                  {item.client?.client_mobile_num}
                </li>
                <li>
                  <strong>Vendor Mobile Number: </strong>{" "}
                  {item.vendor?.vendor_mobile_num}
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
      renderCell: (item: ProductSaleRecordWithRelations) =>
        formatDate(item.created_at),
    },
    {
      label: "Client Name",
      renderCell: (item: ProductSaleRecordWithRelations) => {
        return item.client
          ? `${item.client.client_fname} ${item.client.client_lname}`
          : "N/A";
      },
    },
    {
      label: "Vendor Name",
      renderCell: (item: ProductSaleRecordWithRelations) => {
        return item.vendor
          ? `${item.vendor.vendor_fname} ${item.vendor.vendor_lname}`
          : "N/A";
      },
    },
    {
      label: "Total Amount",
      renderCell: (item: ProductSaleRecordWithRelations) => item.total_amount,
    },
    {
      label: "Paid Amount",
      renderCell: (item: ProductSaleRecordWithRelations) =>
        item.transactions.reduce(
          (sum, transaction) => sum + transaction.amount_paid,
          0
        ),
    },
    {
      label: "Products",
      renderCell: (item: ProductSaleRecordWithRelations) =>
        item.products.map((rec) => rec.product.prod_name).join(", "),
    },
    {
      label: "Transaction Type",
      renderCell: (item: ProductSaleRecordWithRelations) =>
        item.transaction_type,
    },
    {
      label: "Edit",
      renderCell: (item: ProductSaleRecordWithRelations) => {
        return (
          <Link to={`${item.product_record_id}`}>
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
