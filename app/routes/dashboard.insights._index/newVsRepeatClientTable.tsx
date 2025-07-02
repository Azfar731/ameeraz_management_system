import { ClientWithServiceRecord } from "~/utils/client/types";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import { SerializeFrom } from "@remix-run/node";
export default function NewVsRepeatClientTable({
  newClients,
  repeat_client,
}: {
  newClients: SerializeFrom<ClientWithServiceRecord>[];
  repeat_client: SerializeFrom<ClientWithServiceRecord>[];
}) {
  const newClientRevenue = newClients.reduce((sum, client) => {
    const clientRevenue = client.services.reduce((clientSum, service) => {
      return clientSum + service.total_amount;
    }, 0);
    return sum + clientRevenue;
  }, 0);

  const repeatClientRevenue = repeat_client.reduce((sum, client) => {
    const clientRevenue = client.services.reduce((clientSum, service) => {
      return clientSum + service.total_amount;
    }, 0);
    return sum + clientRevenue;
  }, 0);

  const comparison_data = [
    {
      type: "newClient",
      totalClients: newClients.length,
      totalRevenue: newClientRevenue,
    },
    {
      type: "repeatClient",
      totalClients: repeat_client.length,
      totalRevenue: repeatClientRevenue,
    },
  ];
  //table data
  const nodes = [...comparison_data];
  const data = { nodes };
  type ComparisonEntry = typeof comparison_data[number];
  const COLUMNS = [
    {
      label: "Type",
      renderCell: (item: ComparisonEntry) => item.type,
    },
    {
      label: "Number of Clients",
      renderCell: (item: ComparisonEntry) => `${item.totalClients}`,
    },
    {
      label: "Total Revenue",
      renderCell: (item: ComparisonEntry) => `${item.totalRevenue}`,
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
    <div className="mt-1 mb-6">
      <CompactTable columns={COLUMNS} data={data} theme={theme} />
    </div>
  );
}
