import { useState, useRef } from "react";
import { ActionFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Form,
  useOutletContext,
  useSubmit,
  redirect,
} from "@remix-run/react";
import { prisma_client } from ".server/db";
import { Client, Deal, Service } from "@prisma/client";
import Select, { OnChangeValue } from "react-select";
import { FormType, PaymentModes } from "~/utils/types";

export async function loader() {
  const deals = await prisma_client.deal.findMany();
  return { deals };
}

export async function action({ request }: ActionFunctionArgs) {
  const json = await request.json();
  const amount_paid: number = json.amount_paid;
  const amount_charged: number = json.amount_charged;
  if (amount_paid > amount_charged) {
    return { msg: "Amount Paid can not be greater than Amount Charged" };
  }
  throw redirect("../part3");
}

export default function Part2() {
  //context
  const { formData, setFormData } = useOutletContext<{
    formData: FormType;
    setFormData: React.Dispatch<React.SetStateAction<FormType>>;
  }>();

  //loader Data
  const { deals } = useLoaderData<{
    client: Client;
    deals: Deal[];
  }>();

  //states
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

  

  const servicesRef = useRef<{ value: string; label: string }[]>([]);
  const dealsRef = useRef<{ value: string; label: string }[]>([]);
  //Parent Context

  // Map the deals recieved from the action function to pass to react-select
  const deal_options = deals
    .filter((deal) => !deal.auto_generated)
    .map((deal) => {
      return { value: deal.deal_id, label: deal.deal_name };
    });

  const service_options = deals
    .filter((deal) => deal.auto_generated)
    .map((deal) => {
      return { value: deal.deal_id, label: deal.deal_name };
    });

  const payment_options: {value: PaymentModes,label: string}[] = [
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
    const services = servicesRef.current;
    const deals = dealsRef.current;
    const amount_charged = Number(formData.get("amount_charged"));
    const amount_paid = Number(formData.get("amount_paid"));
    const payment_mode = formData.get("mode_of_payment")?.toString() || "";
    let mode_of_payment = payment_options[0]; //default value is {value: cash, label: Cash}
     
    if (["cash", "bank_transfer", "card"].includes(payment_mode)) {
      const option = payment_options.find((opt) => opt.value === payment_mode);
      if (option) {
        mode_of_payment = option;
      }
    }

    const formDataObj = {
      deals,
      services,
      amount_charged,
      amount_paid,
      mode_of_payment,
    };

    setFormData((prev) => ({ ...prev, ...formDataObj }));

    submit(
      { amount_charged, amount_paid },
      { method: "post", encType: "application/json" }
    );
  };

  const onServicesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
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
      services: tmp_amount,
      charged: prev.deals + tmp_amount,
      paid: prev.deals + tmp_amount,
    }));
    servicesRef.current = [...tmp_array];
  };

  const onDealsChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
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
      deals: tmp_amount,
      charged: prev.services + tmp_amount,
      paid: prev.services + tmp_amount,
    }));
    dealsRef.current = [...tmp_array];
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Form
        method="post"
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
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
        />
        <label htmlFor="payment_mode">Mode of Payment</label>
        <Select
          options={payment_options}
          name="mode_of_payment"
          id="payment_mode"
          defaultValue={formData.mode_of_payment}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Next
        </button>
      </Form>
    </div>
  );
}
