import { Form, useSearchParams } from "@remix-run/react";
import { formatDateToISO } from "shared/utilityFunctions";
import Select, { OnChangeValue } from "react-select";
import { getPaymentMenuOptions, setSearchParameters } from "~/utils/functions";
import { useRef } from "react";

export default function Client_Transactions() {
  //hooks
  const [searchParams, setSearchParams] = useSearchParams();

  //references
  const payment_option_ref = useRef<{ value: string; label: string }[]>([]);
  //searchParam values
  const start_date_default = searchParams.get("start_date");
  const end_date_default = searchParams.get("end_date");

  //other values
  const current_date = formatDateToISO(new Date());
  let error_message = "";
  console.log("Error_message:", error_message )
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
    console.log("In submit function");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formValues = fetchFormValues(formData);
    if (!formValues) {
      console.log("In if condition");
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
          htmlFor="employees"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Mode of Payment
        </label>
        <Select
          isMulti
          name="employees"
          onChange={onPaymentOptionChange}
          options={getPaymentMenuOptions()}
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
    </div>
  );
}
