import { useState, useRef } from "react";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Form,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { prisma_client } from ".server/db";
import { Client, Deal, Service } from "@prisma/client";
import Select, { OnChangeValue } from "react-select";
import { FormType } from "~/utils/types";
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const mobile_num = searchParams.get("mobile_num") || "";
  if (mobile_num) {
    const client = await prisma_client.client.findFirst({
      where: { client_mobile_num: mobile_num },
    });
    if (!client) {
      throw Error("Client not found");
    }
    // const services = await prisma_client.service.findMany()
    const deals = await prisma_client.deal.findMany();
    return { client, deals };
  } else {
    throw Error("Mobile Number not provided");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const json = await request.json()
  console.log("JsonData",json)
  return null;
}

export default function Part2() {
  //states
  const [amount, setAmount] = useState({services:0 ,deals:0,charged:0,paid:0});
  
  const { deals } = useLoaderData<{
    client: Client;
    services: Service[];
    deals: Deal[];
  }>();

  const servicesRef = useRef<string[]>([]);
  const dealsRef = useRef<string[]>([])
  //Parent Context
  const { formData, setFormData } = useOutletContext<{
    formData: FormType;
    setFormData: React.Dispatch<React.SetStateAction<FormType>>;
  }>();

  // Map the deals recieved from the action function to pass to react-select
  const deal_options = deals
    .filter((deal) => !deal.auto_generated)
    .map((deal) => {
      return { value: deal.deal_name, label: deal.deal_name };
    });

  const service_options = deals
    .filter((deal) => deal.auto_generated)
    .map((deal) => {
      return { value: deal.deal_name, label: deal.deal_name };
    });

  // handle Submit function which will run when the form submits
  const submit = useSubmit();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget;
    const formData = new FormData(form);
    const services = servicesRef.current
    const deals = dealsRef.current
    const amount_charged = Number(formData.get("amount_charged"));
    const amount_paid = Number(formData.get("amount_paid"));
    const mode_of_payment = formData.get("mode_of_payment")?.toString() || "";
    
    
    const formDataObj = {
     services,
     deals,
     amount_charged,
     amount_paid,
     mode_of_payment
    }

    console.log(services, deals, amount_charged, amount_paid, mode_of_payment);
    // submit(form)
    // submit(form, { replace: false, method: 'post', body: JSON.stringify(formDataObj) });
    submit(
      formDataObj,
      { method: "post", encType: "application/json" }
    );
  };

  const onServicesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    let tmp_amount = 0;
    const tmp_array: string[] = []
    newValue.forEach((element) => {
      const deal = deals.find((deal) => deal.deal_name === element.value);
      if(deal){
      tmp_amount += deal.deal_price
      tmp_array.push(deal.deal_id)
    }
    });
    setAmount(prev => ({...prev,services: tmp_amount,charged:prev.deals+tmp_amount,paid:prev.deals+tmp_amount}));
    servicesRef.current = [...tmp_array]
  };

  const onDealsChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    let tmp_amount = 0;
    const tmp_array: string[] = []
    newValue.forEach((element) => {
      const deal = deals.find((deal) => deal.deal_name === element.value);
      if(deal){
      tmp_amount += deal.deal_price
      tmp_array.push(deal.deal_id)
    }
    });
    setAmount(prev => ({...prev,deals: tmp_amount,charged: prev.services+tmp_amount,paid:prev.services+tmp_amount}));
    dealsRef.current = [...tmp_array]
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Form
        method="post"
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          This is form part 2{" "}
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
          // min={0}
          onChange={(e)=>setAmount(prev => ({...prev,charged:Number(e.target.value)}))}
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
          // min={0}
          onChange={(e)=>setAmount(prev => ({...prev,paid:Number(e.target.value)}))}

        />
        <label htmlFor="payment_mode">Mode of Payment</label>
        <Select
          options={[
            { value: "cash", label: "Cash" },
            { value: "bank_transfer", label: "Bank Transfer" },
            { value: "card", label: "Card" },
          ]}
          name="mode_of_payment"
          id="payment_mode"
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
