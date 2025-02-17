import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { useRef } from "react";
import { FaPlus } from "react-icons/fa";
import Select, { OnChangeValue } from "react-select";
import { formatDateToISO } from "shared/utilityFunctions";
import { getClientTransactions } from "~/utils/clientTransaction/db.server";
import { ClientTransactionWithRelations } from "~/utils/clientTransaction/types";
import { clientTransactionFetchSchema } from "~/utils/clientTransaction/validation.server";
import {
  getAllPaymentMenuOptions,
  setSearchParameters,
} from "~/utils/functions";
import ClientTransactionsTable from "./ClientTransactionsTable";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const formValues = fetchFormValues(searchParams);

  const validationResult = clientTransactionFetchSchema.safeParse(formValues);
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      transactions: [],
    };
  }
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
          to="clientTransactions/create"
          className="w-60 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Create Transaction <FaPlus />
        </Link>
        <div className="mt-6">
          <ClientTransactionsTable transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
