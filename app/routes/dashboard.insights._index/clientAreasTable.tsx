import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { getTheme } from "@table-library/react-table-library/baseline.js";

export default function ClientAreasTable({
  clientAreas,
}: {
  clientAreas: {
    client_area: string;
  }[];
}) {
  
  //table data
  const mappedData = mapClientAreas(clientAreas);
  const nodes = [...mappedData];
  const data = { nodes };
  type ClientAreaEntry = (typeof nodes)[number];
  const COLUMNS = [
    {
      label: "Area",
      renderCell: (item: ClientAreaEntry) => item.label,
    },
    {
      label: "Number of Clients",
      renderCell: (item: ClientAreaEntry) => item.value,
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
                        background-color: #f9f9f9;
                    }
                    `,
    },
  ]);

  return (
    <div className="mt-1 mb-6">
      <CompactTable columns={COLUMNS} data={data} theme={theme} />
    </div>
  );
}

function mapClientAreas(clientAreas: { client_area: string }[]) {
  const areaCountMap: Record<string, number> = {};
  for (const { client_area } of clientAreas) {
    areaCountMap[client_area] = (areaCountMap[client_area] || 0) + 1;
  }

  // Convert to desired format
  const sorted = Object.entries(areaCountMap)
    .map(([area, count], index) => ({
      id: index + 1,
      label: area,
      value: count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Return top 10

  return sorted;
}
