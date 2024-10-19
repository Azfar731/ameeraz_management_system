import { useState, useRef } from "react";
import { ActionFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Form,
  useOutletContext,
  useSubmit,
  redirect,
  useNavigate,
} from "@remix-run/react";
import { prisma_client } from ".server/db";
import { Client, Deal } from "@prisma/client";
import Select, { OnChangeValue } from "react-select";
import { FormType, MenuOption, PaymentModes } from "~/utils/types";
import { fetchDeals, fetchServices } from "shared/utilityFunctions";

export async function loader() {
  const deals = await prisma_client.deal.findMany();
  return { deals };
}

export async function action({ request }: ActionFunctionArgs) {
  const json: Omit<FormType, "employees" | "mobile_num"> = await request.json();

  // Validate payment details
  const paymentError = validatePayment(json.amount_paid, json.amount_charged);
  if (paymentError) {
    return paymentError;
  }

  // Validate selection of deals or services
  const selectionError = validateDealsAndServices(json.deals, json.services);
  if (selectionError) {
    return selectionError;
  }

  // Redirect to the next part if all is valid
  throw redirect("../part3");
}

// Helper function to validate the payment amounts
function validatePayment(amount_paid: number, amount_charged: number) {
  if (amount_paid > amount_charged) {
    return {
      amount_paid_msg: "Amount Paid cannot be greater than Amount Charged",
    };
  }
  return null;
}

// Helper function to validate that at least one deal or service is selected
function validateDealsAndServices(deals: MenuOption[], services: MenuOption[]) {
  if (deals.length < 1 && services.length < 1) {
    return { deals_msg: "At least one service or deal must be selected" };
  }
  return null;
}

// Helper function to handle redirection

export default function Part2() {
  //context
  const { formData, setFormData } = useOutletContext<{
    formData: FormType;
    setFormData: React.Dispatch<React.SetStateAction<FormType>>;
  }>();

  const navigate = useNavigate();

  //loader Data
  const { deals } = useLoaderData<{
    client: Client;
    deals: Deal[];
  }>();

  //Action Data
  const actionData = useActionData<
    { amount_paid_msg: string | undefined , deals_msg: string | undefined} | undefined // In case there's no validation error
  >();

  
  const calc_services_amount = () => {
    let tmp_amount = 0;
    formData.services.forEach((elem) => {
      tmp_amount +=
        deals.find((deal) => elem.value === deal.deal_id)?.deal_price || 0;
    });
    return tmp_amount;
  };

  const calc_deals_amount = () => {
    let tmp_amount = 0;
    formData.deals.forEach((elem) => {
      tmp_amount +=
        deals.find((deal) => elem.value === deal.deal_id)?.deal_price || 0;
    });
    return tmp_amount;
  };

  const [amount, setAmount] = useState({
    services: calc_services_amount(),
    deals: calc_deals_amount(),
    charged: formData.amount_charged,
    paid: formData.amount_paid,
  });

  const servicesRef = useRef<{ value: string; label: string }[]>(
    formData.services
  );
  const dealsRef = useRef<{ value: string; label: string }[]>(formData.deals);
  const formRef = useRef<HTMLFormElement>(null);
  //Parent Context

  // Map the deals recieved from the action function to pass to react-select
  const deal_options = fetchDeals(deals);

  const service_options = fetchServices(deals);

  const payment_options: { value: PaymentModes; label: string }[] = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank transfer" },
    { value: "card", label: "Card" },
  ];

  // handle Submit function which will run when the form submits
  const submit = useSubmit();
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const form = event.currentTarget;
    const formData = new FormData(form);
  
    // Get references to deals and services
    const deals = dealsRef.current;
    const services = servicesRef.current;
  
    // Extract relevant data from formData
    const { amount_charged, amount_paid, payment_mode } = extractFormData(formData);
  
    // Determine the mode of payment
    const mode_of_payment = getPaymentOption(payment_mode);
  
    // Create formData object
    const formDataObj = {
      deals,
      services,
      amount_charged,
      amount_paid,
      mode_of_payment,
    };
  
    // Update form data state
    setFormData((prev) => ({ ...prev, ...formDataObj }));
  
    // Submit form
    submit(formDataObj, { method: "post", encType: "application/json" })
  };
  
  // Helper function to extract amount_charged, amount_paid, and payment_mode
  function extractFormData(formData: FormData) {
    const amount_charged = extractNumber(formData, "amount_charged");
    const amount_paid = extractNumber(formData, "amount_paid");
    const payment_mode = extractString(formData, "mode_of_payment");
  
    return { amount_charged, amount_paid, payment_mode };
  }
  
  // Helper function to extract number values from form data
  function extractNumber(formData: FormData, fieldName: string): number {
    return Number(formData.get(fieldName));
  }
  
  // Helper function to extract string values from form data
  function extractString(formData: FormData, fieldName: string): string {
    return formData.get(fieldName)?.toString() || "";
  }
  // Helper function to get the selected payment option
  function getPaymentOption(payment_mode: string) {
    const default_payment = payment_options[0]; // default is {value: cash, label: Cash}
  
    if (["cash", "bank_transfer", "card"].includes(payment_mode)) {
      const selectedOption = payment_options.find((opt) => opt.value === payment_mode);
      return selectedOption ? selectedOption : default_payment;
    }
  
    return default_payment;
  }
  
  const GoToPrevPage = () => {
    const form = formRef.current;
    if (!form) return;
  
    const pageFormData = new FormData(form);
  
    // Get references to deals and services
    const deals = dealsRef.current;
    const services = servicesRef.current;
  
    // Extract relevant data from formData
    const { amount_charged, amount_paid, payment_mode } = extractFormData(pageFormData);
  
    // Determine the mode of payment
    const mode_of_payment = getPaymentOption(payment_mode);
  
    // Create formData object
    const formDataObj = {
      deals,
      services,
      amount_charged,
      amount_paid,
      mode_of_payment,
    };
  
    // Update form data state
    setFormData((prev) => ({ ...prev, ...formDataObj }));
  
    // Navigate to the previous page
    navigate("../");
  };
  
  const onServicesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    handleChange(newValue, "services");
  };
  
  const onDealsChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    handleChange(newValue, "deals");
  };
  
  // Helper function to handle both services and deals changes
  function handleChange(
    newValue: OnChangeValue<{ value: string; label: string }, true>,
    type: "services" | "deals"
  ) {
    let tmp_amount = 0;
    const tmp_array: { value: string; label: string }[] = [];
  
    newValue.forEach((element) => {
      const deal = deals.find((deal) => deal.deal_id === element.value);
      if (deal) {
        tmp_amount += deal.deal_price;
        tmp_array.push(element);
      }
    });
  
    setAmount((prev) => ({
      ...prev,
      [type]: tmp_amount,
      charged: prev[type === "services" ? "deals" : "services"] + tmp_amount,
      paid: prev[type === "services" ? "deals" : "services"] + tmp_amount,
    }));
  
    if (type === "services") {
      servicesRef.current = [...tmp_array];
    } else if (type === "deals") {
      dealsRef.current = [...tmp_array];
    }
  }
  

  return (
    <div className="flex justify-center items-center h-screen">
      <Form
        method="post"
        onSubmit={handleSubmit}
        ref={formRef}
        className="bg-white mt-14 p-6 rounded shadow-md w-80 "
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          This is form part 2
        </h1>
        <label
          htmlFor="service"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Service Taken
        </label>
        <Select
          isMulti
          name="services"
          onChange={onServicesChange}
          options={service_options}
          defaultValue={formData.services}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />

        <label
          htmlFor="deal"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Deal Taken
        </label>
        <Select
          isMulti
          name="deals"
          onChange={onDealsChange}
          id="deal"
          options={deal_options}
          defaultValue={formData.deals}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />
        {actionData?.deals_msg && (
          <h2 className="text-red-500 font-semibold">{actionData.deals_msg}</h2>
        )}
        <div className="text-gray-700 mb-4">
          Expected Total Amount: {amount.services + amount.deals}
        </div>

        <label
          htmlFor="amount_charged"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Amount Charged
        </label>
        <input
          type="number"
          name="amount_charged"
          id="amount_charged"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          value={amount.charged}
          min={0}
          onChange={(e) =>
            setAmount((prev) => ({ ...prev, charged: Number(e.target.value) }))
          }
          required
        />

        <label
          htmlFor="amount_paid"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Amount Paid
        </label>
        <input
          type="number"
          name="amount_paid"
          id="amount_paid"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          value={amount.paid}
          min={0}
          onChange={(e) =>
            setAmount((prev) => ({ ...prev, paid: Number(e.target.value) }))
          }
          required
        />
        {actionData?.amount_paid_msg && (
          <h2 className="text-red-700">{actionData.amount_paid_msg}</h2>
        )}
        <label htmlFor="payment_mode">Mode of Payment</label>
        <Select
          options={payment_options}
          name="mode_of_payment"
          id="payment_mode"
          defaultValue={formData.mode_of_payment}
        />
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={GoToPrevPage}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </Form>
    </div>
  );
}
