import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { getTheme } from "@table-library/react-table-library/baseline";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { useRef, useState } from "react";
import { FaExternalLinkAlt, FaPlus } from "react-icons/fa";
import Select, { OnChangeValue } from "react-select";
import { formatDate, formatDateToISO } from "shared/utilityFunctions";
import { getClientTransactions } from "~/utils/clientTransaction/db.server";
import { ClientTransactionWithRelations } from "~/utils/clientTransaction/types";
import { clientTransactionFetchSchema } from "~/utils/clientTransaction/validation.server";
import {
  capitalizeFirstLetter,
  getAllPaymentMenuOptions,
  setSearchParameters,
} from "~/utils/functions";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const formValues = fetchFormValues(searchParams);

  const validationResult = clientTransactionFetchSchema.safeParse(formValues);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors, transactions: [] };
  }
  console.log("Validation Result: ", validationResult.data);
  const transactions = await getClientTransactions(validationResult.data);
  return { transactions, errors: {} };
}

const fetchFormValues = (searchParams: URLSearchParams) => {
  const start_date = searchParams.get("start_date") || undefined;
  const end_date = searchParams.get("end_date") || undefined;
  const mobile_num = searchParams.get("mobile_num") || undefined;
  const payment_options = searchParams.get("payment_options") || undefined;
  return {
    start_date,
    end_date,
    mobile_num,
    payment_options,
  };
};

export default function Client_Transactions() {
  //hooks
  const [searchParams, setSearchParams] = useSearchParams();
  const { transactions } = useLoaderData<{
    transactions: ClientTransactionWithRelations[];
  }>();

  //references
  const payment_option_ref = useRef<{ value: string; label: string }[]>([]);
  //searchParam values
  const start_date_default = searchParams.get("start_date");
  const end_date_default = searchParams.get("end_date");

  //other values
  const current_date = formatDateToISO(new Date());
  let error_message = "";

  //table values
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
                  {item.record.deals.map((deal) => deal.deal_name).join(", ")}
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
        item.record.deals.map((deal) => deal.deal_name).join(", "),
    },

    {
      label: "View",
      renderCell: (item: ClientTransactionWithRelations) => {
        return (
          <Link
            to={`/transactions/clientTransactions/${item.client_transaction_id}`}
          >
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

  const fetchFormValues = (formData: FormData) => {
    const start_date: string = (formData.get("start_date") as string) || "";
    const end_date: string = (formData.get("end_date") as string) || "";
    const mobile_num: string = (formData.get("mobile_num") as string) || "";
    const payment_options = payment_option_ref.current?.map((opt) => opt.value);

    if (start_date || end_date || mobile_num || payment_options.length > 0) {
      return {
        start_date,
        end_date,
        payment_options,
        mobile_num,
      };
    } else {
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const formValues = fetchFormValues(formData);
    if (!formValues) {
      error_message = "Atleast One value must be selected";
      return;
    }
    setSearchParameters(formValues, setSearchParams);
  };

  const onPaymentOptionChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    payment_option_ref.current = [...newValue];
  };
  return (
    <div className="mt-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-3xl text-gray-700">
          Client Transactions
        </h1>
      </div>
      <Form
        method="get"
        className="bg-white rounded w-1/2"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-semibold text-gray-700 mt-6">
          Search Records
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
          defaultValue={
            start_date_default ? formatDateToISO(start_date_default) : undefined
          }
          max={current_date}
          className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        />
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
          defaultValue={
            end_date_default ? formatDateToISO(end_date_default) : undefined
          }
          max={current_date}
          className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        />
        <label
          htmlFor="mobile_num"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Client Mobile number
        </label>
        <input
          type="text"
          id="mobile_num"
          name="mobile_num"
          pattern="^0[0-9]{10}$"
          placeholder="03334290689"
          defaultValue={searchParams.get("mobile_num") || undefined}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        />
        <label
          htmlFor="payment_mode"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Mode of Payment
        </label>
        <Select
          isMulti
          id="payment_mode"
          name="payment_mode"
          onChange={onPaymentOptionChange}
          options={getAllPaymentMenuOptions()}
          // defaultValue={def_emp}
          className="basic-multi-select mt-2"
          classNamePrefix="select"
        />
        {error_message && (
          <h2 className="text-red-500 font-semibold">{error_message}</h2>
        )}
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Fetch
        </button>
      </Form>
      <div className="mt-20">
      <Link
          to="create"
          className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Create Transaction <FaPlus />
        </Link>
        <div className="mt-6">
          <CompactTable
            columns={COLUMNS}
            data={data}
            theme={theme}
            rowProps={ROW_PROPS}
            rowOptions={ROW_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
