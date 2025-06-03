import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import Pie_Chart from "~/components/Charts/PieChart";
import {
  getClientAreas,
  getClientCount,
  getNumberofRepeatClients,
} from "~/utils/client/db.server";
import { ClientInsightValidation } from "~/utils/insights/validation";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;
  //perform validatiton
  const validation_result = ClientInsightValidation.safeParse({
    start_date,
    end_date,
  });
  if (!validation_result.success) {
    return {
      errorMessages: validation_result.error.flatten().fieldErrors,
      newClients: 0,
      repeat_client: 0,
    };
  }

  const validated_data = validation_result.data;
  const newClients = await getClientCount({
    created_at_from: validated_data.start_date,
    created_at_to: validated_data.end_date,
  });
  let repeat_client = 0;
  if (validated_data.start_date) {
    repeat_client = await getNumberofRepeatClients({
      start_date: validated_data.start_date,
      end_date: validated_data.end_date,
    });
  }

  const allClientAreas = await getClientAreas({
    start_date: undefined,
    end_date: undefined,
  });
  const selectedRangeClientAreas = await getClientAreas({
    start_date: validated_data.start_date,
    end_date: validated_data.end_date,
  });
  console.log("validated_data start date: ", validated_data.start_date);
  return {
    newClients,
    repeat_client,
    errorMessages: undefined,
    start_date: validated_data.start_date,
    end_date: validated_data.end_date,
    allClientAreas,
    selectedRangeClientAreas,
  };
}

export default function Client_Insights() {
  const current_date = new Date().toISOString().split("T")[0];

  const {
    newClients,
    repeat_client,
    errorMessages,
    start_date,
    end_date,
    allClientAreas,
    selectedRangeClientAreas,
  } = useLoaderData<{
    newClients: number;
    repeat_client: number;
    errorMessages?: { start_date: string; end_date: string };
    start_date: Date;
    end_date: Date;
    allClientAreas: { client_area: string }[];
    selectedRangeClientAreas: { client_area: string }[];
  }>();
  const navigation = useNavigation();
  const allClientAreasPieData = mapClientAreasToPieData(allClientAreas);
  const selectedRangeClientAreasPieData = mapClientAreasToPieData(
    selectedRangeClientAreas
  );
  console.log("selectedRange", selectedRangeClientAreas);
  console.log("PieData: ", selectedRangeClientAreasPieData);

  return (
    <div className="m-8">
      <section>
        <Form method="get" className=" rounded w-1/2">
          <h2 className="text-3xl font-semibold text-gray-700 mt-6">
            Select Date Range
          </h2>
          <label
            htmlFor="start_date"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Starting Date
          </label>
          <input
            id="start_date"
            name="start_date"
            aria-label="Date"
            type="date"
            max={current_date}
            className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
          />
          {errorMessages?.start_date && (
            <h2 className="text-red-500 font-semibold">
              {errorMessages.start_date[0]}
            </h2>
          )}
          <label
            htmlFor="end_date"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Ending Date
          </label>
          <input
            id="end_date"
            name="end_date"
            aria-label="Date"
            type="date"
            max={current_date}
            className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
          />
          {errorMessages?.end_date && (
            <h2 className="text-red-500 font-semibold">
              {errorMessages.end_date[0]}
            </h2>
          )}
          <button
            type="submit"
            disabled={
              navigation.state === "submitting" ||
              navigation.state === "loading"
            }
            className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Fetch
          </button>
        </Form>
      </section>
      <section className="mt-4  text-xl font-semibold text-gray-800 mb-4">
        <h3>
          Starting Date:{" "}
          {start_date
            ? new Date(start_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </h3>
        <h3>
          Ending Date:{" "}
          {end_date
            ? new Date(end_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </h3>
      </section>
      <section>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800 mb-4">
          New vs Repeating clients
        </h2>
        <Pie_Chart
          data={
            newClients === 0 && repeat_client === 0
              ? []
              : [
                  {
                    id: 0,
                    value: newClients,
                    label: `New Clients: ${newClients}`,
                  },
                  {
                    id: 1,
                    value: repeat_client,
                    label: `Repeat Clients: ${repeat_client}`,
                  },
                ]
          }
        />
      </section>
      <section className="mt-4 ">
        <h2 className="text-2xl font-semibold text-gray-800 ">
          All Client Areas
        </h2>
        <Pie_Chart data={allClientAreasPieData} />
      </section>
      <section className="mt-4 ">
        <h2 className="text-2xl font-semibold text-gray-800 ">
          Client Registered in Specified Time Period
        </h2>
        <Pie_Chart data={selectedRangeClientAreasPieData} />
      </section>
    </div>
  );
}

function mapClientAreasToPieData(clientAreas: { client_area: string }[]) {
  const areaCountMap: Record<string, number> = {};
  for (const { client_area } of clientAreas) {
    areaCountMap[client_area] = (areaCountMap[client_area] || 0) + 1;
  }

  // Convert to desired format
  return Object.entries(areaCountMap).map(([area, count], index) => ({
    id: index + 1,
    label: area,
    value: count,
  }));
}
