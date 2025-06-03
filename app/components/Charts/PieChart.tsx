import { PieChart } from "@mui/x-charts/PieChart";

export default function Pie_Chart({
  data,
}: {
  data: { id: number; value: number; label: string }[];
}) {
  return <PieChart series={[{ data }]} width={200} height={200} skipAnimation={true} />;
}
