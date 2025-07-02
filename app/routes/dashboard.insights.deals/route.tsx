import { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { getDealsWithServiceRecord } from "~/utils/deal/db.server";
import { DealsInsightValidation } from "~/utils/insights/validation";
import Select from "react-select";
import { CompactTable } from "@table-library/react-table-library/compact.js";
import { useTheme } from "@table-library/react-table-library/theme.js";
import { getTheme } from "@table-library/react-table-library/baseline.js";
import { DealWithRecord } from "~/utils/deal/types";
import { useSort } from "@table-library/react-table-library/sort";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const get_all = searchParams.get("get_all") || "false";
  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;
  const validation_result = DealsInsightValidation.safeParse({
    get_all,
    start_date,
    end_date,
  });

  if (!validation_result.success) {
    return {
      error_messages: validation_result.error.flatten().fieldErrors,
      deals_data: [],
      start_date: undefined,
      end_date: undefined,
    };
  }
  const data = validation_result.data;
  const deals_data = await getDealsWithServiceRecord({
    get_all: data.get_all,
    start_date: data.start_date,
    end_date: data.end_date,
  });

  return {
    deals_data,
    start_date: data.start_date,
    end_date: data.end_date,
    error_messages: undefined,
  };
}

export default function Deal_Insights() {
  const { deals_data, start_date, end_date, error_messages } = useLoaderData<{
    deals_data: DealWithRecord[];
    start_date: string | undefined;
    end_date: string | undefined;
    error_messages: {
      start_date: string[];
      end_date: string[];
      get_all: string[];
    };
  }>();
  const current_date = new Date().toISOString().split("T")[0];
  const navigation = useNavigation();

  //table data
  const mappedData = mapDealsData({ dealsData: deals_data });
  type MappedDealData = (typeof mappedData)[number];
  const nodes = [...mappedData];
  const data = { nodes };

  const sort = useSort(
    data,
    {
      onChange: onSortChange,
    },
    {
      sortFns: {
        REVENUE: (array) => array.sort((a, b) => a.revenue - b.revenue),
        QUANTITY: (array) => array.sort((a, b) => a.quantity - b.quantity),
      },
    }
  );

  function onSortChange(action, state) {
    console.log(action, state);
  }

  const COLUMNS = [
    {
      label: "Deal Name",
      renderCell: (item: MappedDealData) => item.name,
    },
    {
      label: "Number of Times Taken",
      renderCell: (item: MappedDealData) => item.quantity,
      sort: { sortKey: "QUANTITY" },
    },
    {
      label: "Total Revenue",
      renderCell: (item: MappedDealData) => item.revenue,
      sort: { sortKey: "REVENUE" },
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
    <div className="m-8">
      <section>
        <Form method="get" className=" rounded w-1/4">
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
          {error_messages?.start_date && (
            <h2 className="text-red-500 font-semibold">
              {error_messages.start_date[0]}
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
          {error_messages?.end_date && (
            <h2 className="text-red-500 font-semibold">
              {error_messages.end_date[0]}
            </h2>
          )}
          <label
            htmlFor="get_all"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Deal Status
          </label>
          <Select
            id="get_all"
            name="get_all"
            options={[
              { value: "false", label: "Active" },
              { value: "true", label: "Any" },
            ]}
            defaultValue={{ value: "false", label: "Active" }}
            className=" mt-2"
            classNamePrefix="select"
          />
          {error_messages?.start_date && (
            <h2 className="text-red-500 font-semibold">
              {error_messages.start_date[0]}
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
          Deal Insights
        </h2>
        <CompactTable columns={COLUMNS} data={data} theme={theme} sort={sort} />
      </section>
    </div>
  );
}

const mapDealsData = ({
  dealsData,
}: {
  dealsData: SerializeFrom<DealWithRecord[]>;
}) => {
  const mappedData = dealsData.map((deal) => {
    const totalQuantity = deal.records.reduce(
      (sum, record) => sum + record.quantity,
      0
    );

    const totalRevenue = deal.deal_price * totalQuantity;

    return {
      id: deal.deal_id,
      name: deal.deal_name,
      revenue: totalRevenue,
      quantity: totalQuantity,
    };
  });

  return mappedData;
};
