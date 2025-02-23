// CompactTableComponent.tsx
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { Link } from "@remix-run/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Operational_Expenses } from "@prisma/client";
import { formatDate } from "shared/utilityFunctions";
import { SerializeFrom } from "@remix-run/node";

export default function ExpensesTable({
  expenses,
}: {
  expenses: SerializeFrom<Operational_Expenses>[];
}) {
  const nodes = [...expenses];
  const data = { nodes };
  const COLUMNS = [
    {
      label: "Date",
      renderCell: (item: Operational_Expenses) => formatDate(item.created_at),
    },
    {
      label: "Amount Paid",
      renderCell: (item: Operational_Expenses) => item.amount_paid,
    },
    {
      label: "Description",
      renderCell: (item: Operational_Expenses) => item.description,
    },
    {
      label: "View",
      renderCell: (item: Operational_Expenses) => (
        <Link to={`${item.expense_id}`}>
          {" "}
          <FaExternalLinkAlt />{" "}
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

  return <CompactTable columns={COLUMNS} data={data} theme={theme} />;
}
