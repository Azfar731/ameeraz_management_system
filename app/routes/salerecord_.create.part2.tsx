import { useState, useRef, useEffect } from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  replace,
} from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Form,
  useOutletContext,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { prisma_client } from "~/.server/db";
import { Client, Deal } from "@prisma/client";
import Select, { OnChangeValue } from "react-select";
import { FormType, PaymentModes } from "~/utils/types";
import { fetchDeals, fetchServices } from "shared/utilityFunctions";
import { getClientByMobile } from "~/utils/client/db.server";
import {
  getAllPaymentMenuOptions,
  getSinglePaymentMenuOption,
} from "~/utils/functions";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });

  const client_mobile_num = new URL(request.url).searchParams.get("mobile_num");
  if (!client_mobile_num)
    throw new Error(
      `Client with mobile number: ${client_mobile_num} does not exist`
    );

  const client = await getClientByMobile(client_mobile_num);
  const deals = await prisma_client.deal.findMany();

  return { deals, client };
}

export async function action({ request }: ActionFunctionArgs) {
  const json: Omit<FormType, "employees" | "mobile_num"> = await request.json();

  // Validate payment details
  const paymentError = validatePayment(json.amount_paid, json.amount_charged);
  if (paymentError) {
    return paymentError;
  }

  // Validate selection of deals or services
  if (json.deals.length < 1 && json.services.length < 1) {
    return { deals_msg: "At least one service or deal must be selected" };
  }

  // Redirect to the next part if all is valid
  throw replace("../part3");
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

export default function Part2() {
  //context
  const { formData, setFormData } = useOutletContext<{
    formData: FormType;
    setFormData: React.Dispatch<React.SetStateAction<FormType>>;
  }>();

  const navigate = useNavigate();

  //loader Data
  const { client, deals } = useLoaderData<{
    client: Client;
    deals: Deal[];
  }>();

  //Action Data
  const actionData = useActionData<
    | { amount_paid_msg: string | undefined; deals_msg: string | undefined }
    | undefined // In case there's no validation error
  >();

  const [amounts, setAmounts] = useState({
    expectedAmount: 0,
    amountCharged: formData.amount_charged || 0,
    amountPaid: formData.amount_paid || 0,
  });
  const [dealsQuantity, setDealsQuantity] = useState<
    { id: string; quantity: number }[]
  >(formData.deals);

  const [servicesQuantity, setServicesQuantity] = useState<
    { id: string; quantity: number }[]
  >(formData.services);

  const isFirstRender = useRef(true);
  const onDealsChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    setDealsQuantity((prev) => {
      //remove deleted entries
      const tmp = prev.filter((entry) => {
        return newValue.find((deal) => deal.value === entry.id);
      });

      //add any new entries
      return newValue.map((entry) => {
        const deal_quantity_pair = tmp.find((deal) => deal.id === entry.value);
        return deal_quantity_pair
          ? deal_quantity_pair
          : { id: entry.value, quantity: 1 };
      });
    });
  };

  const onServicesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    setServicesQuantity((prev) => {
      //remove deleted entries
      const tmp = prev.filter((entry) => {
        return newValue.find((service) => service.value === entry.id);
      });

      //add any new entries
      return newValue.map((entry) => {
        const service_quantity_pair = tmp.find(
          (service) => service.id === entry.value
        );
        return service_quantity_pair
          ? service_quantity_pair
          : { id: entry.value, quantity: 1 };
      });
    });
  };

  //update quantity value for deals
  const OnDealsQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDealsQuantity((prev) =>
      prev.map((deal) =>
        deal.id === name ? { ...deal, quantity: Number(value) } : deal
      )
    );
  };

  const OnServicesQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServicesQuantity((prev) =>
      prev.map((service) =>
        service.id === name ? { ...service, quantity: Number(value) } : service
      )
    );
  };

  const renderDealsQuantity = dealsQuantity
    .filter(
      (rec) =>
        deals.find((deal) => deal.deal_id === rec.id)?.auto_generated === false
    )
    .map((record, index) => {
      return (
        <div
          key={record.id}
          className="mt-4 w-full flex justify-between items-center"
        >
          <label
            htmlFor={`Deal-${index}`}
            className="text-gray-700 text-sm font-bold mb-2 pr-4 w-1/3"
          >
            {}
            {deals.find((deal) => deal.deal_id === record.id)?.deal_name}
          </label>
          <input
            type="number"
            id={`Deal-${index}`}
            name={record.id}
            min={1}
            defaultValue={record.quantity}
            onChange={OnDealsQuantityChange}
            required
            placeholder="2"
            className="px-3 py-2 border border-gray-300 rounded-md mb-4 w-2/3"
          />
        </div>
      );
    });

  const renderServicesQuantity = servicesQuantity.map((record, index) => {
    return (
      <div
        key={record.id}
        className="mt-4 w-full flex justify-between items-center"
      >
        <label
          htmlFor={`Service-${index}`}
          className="text-gray-700 text-sm font-bold mb-2 pr-4 w-1/3"
        >
          {}
          {deals.find((deal) => deal.deal_id === record.id)?.deal_name}
        </label>
        <input
          type="number"
          id={`Service-${index}`}
          name={record.id}
          min={1}
          defaultValue={record.quantity}
          onChange={OnServicesQuantityChange}
          required
          placeholder="2"
          className="px-3 py-2 border border-gray-300 rounded-md mb-4 w-2/3"
        />
      </div>
    );
  });

  useEffect(() => {
    const expectedAmount =
      dealsQuantity.reduce((acc, curr) => {
        const deal = deals.find((deal) => deal.deal_id === curr.id);
        if (!deal) {
          throw new Error(`Product with id: ${curr.id} not found`);
        }
        return acc + deal.deal_price * curr.quantity;
      }, 0) +
      servicesQuantity.reduce((acc, curr) => {
        const service = deals.find((deal) => deal.deal_id === curr.id);
        if (!service) {
          throw new Error(`Service with id: ${curr.id} not found`);
        }
        return acc + service.deal_price * curr.quantity;
      }, 0);

    if (isFirstRender.current) {
      setAmounts({
        expectedAmount,
        amountCharged: formData.amount_charged || expectedAmount,
        amountPaid: formData.amount_paid || expectedAmount,
      });
      isFirstRender.current = false;
    } else {
      setAmounts({
        expectedAmount,
        amountCharged: expectedAmount,
        amountPaid: expectedAmount,
      });
    }
  }, [
    dealsQuantity,
    servicesQuantity,
    deals,
    formData.amount_charged,
    formData.amount_paid,
  ]);

  const formRef = useRef<HTMLFormElement>(null);
  //Parent Context

  // Map the deals recieved from the loader function to pass to react-select
  const deal_options = fetchDeals(deals);

  const service_options = fetchServices(deals);

  // handle Submit function which will run when the form submits
  const submit = useSubmit();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Extract relevant data from formData
    const { amount_charged, amount_paid, payment_mode } =
      extractFormData(formData);

    // Determine the mode of payment
    const mode_of_payment = getSinglePaymentMenuOption(
      payment_mode as PaymentModes
    );

    // Create formData object
    const formDataObj = {
      deals: dealsQuantity,
      services: servicesQuantity,
      amount_charged,
      amount_paid,
      mode_of_payment,
    };

    // Update form data state
    setFormData((prev) => ({ ...prev, ...formDataObj }));

    // Submit form
    submit(formDataObj, { method: "post", encType: "application/json" });
  };

  // Helper function to extract amount_charged, amount_paid, and payment_mode
  function extractFormData(formData: FormData) {
    const amount_charged = Number(formData.get("amount_charged"));
    const amount_paid = Number(formData.get("amount_paid"));
    const payment_mode = formData.get("mode_of_payment")?.toString() || "";
    return { amount_charged, amount_paid, payment_mode };
  }

  const GoToPrevPage = () => {
    const form = formRef.current;
    if (!form) return;

    const pageFormData = new FormData(form);

    // Extract relevant data from formData
    const { amount_charged, amount_paid, payment_mode } =
      extractFormData(pageFormData);

    // Determine the mode of payment

    const mode_of_payment = getSinglePaymentMenuOption(
      payment_mode as PaymentModes
    );
    // Create formData object
    const formDataObj = {
      deals: dealsQuantity,
      services: servicesQuantity,
      amount_charged,
      amount_paid,
      mode_of_payment,
    };

    // Update form data state
    setFormData((prev) => ({ ...prev, ...formDataObj }));

    // Navigate to the previous page
    navigate("../");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Form
        method="post"
        onSubmit={handleSubmit}
        ref={formRef}
        className="bg-white mt-14 p-6 rounded shadow-md w-80 "
      >
        <div className="block text-gray-700 text-sm font-bold mb-2">
          Client Name:
          <span className="font-semibold">
            {" "}
            {`${client.client_fname} ${client.client_lname}`}
          </span>
        </div>
        <div className="block text-gray-700 text-sm font-bold mb-2">
          Mobile Number:{" "}
          <span className="font-semibold">{client.client_mobile_num}</span>
        </div>
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
          defaultValue={formData.services.map((deal) => ({
            value: deal.id,
            label:
              deals.find((d) => d.deal_id === deal.id)?.deal_name ||
              "No service found",
          }))}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />
        {renderServicesQuantity}
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
          defaultValue={formData.deals.map((deal) => ({
            value: deal.id,
            label:
              deals.find((d) => d.deal_id === deal.id)?.deal_name ||
              "No deal found",
          }))}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />
        {actionData?.deals_msg && (
          <h2 className="text-red-500 font-semibold">{actionData.deals_msg}</h2>
        )}
        {renderDealsQuantity}
        <div className="text-gray-700 mb-4">
          Expected Total Amount: {amounts.expectedAmount}
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
          value={amounts.amountCharged}
          min={0}
          onChange={(e) =>
            setAmounts((prev) => ({
              ...prev,
              amountCharged: Number(e.target.value),
            }))
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
          value={amounts.amountPaid}
          min={0}
          onChange={(e) =>
            setAmounts((prev) => ({
              ...prev,
              amountPaid: Number(e.target.value),
            }))
          }
          required
        />
        {actionData?.amount_paid_msg && (
          <h2 className="text-red-700">{actionData.amount_paid_msg}</h2>
        )}
        <label htmlFor="payment_mode">Mode of Payment</label>
        <Select
          options={getAllPaymentMenuOptions()}
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
