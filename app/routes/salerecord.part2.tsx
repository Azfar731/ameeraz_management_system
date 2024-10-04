import { useState } from "react";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { prisma_client } from ".server/db";
import { Client, Deal, Service } from "@prisma/client";
import Select, { OnChangeValue } from "react-select";

export async function loader({ request, params }: LoaderFunctionArgs) {
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

export async function action({request}: ActionFunctionArgs){
    return null

}

export default function Part2() {
  const [amount, setAmount] = useState(0);
  const { client, deals } = useLoaderData<{
    client: Client;
    services: Service[];
    deals: Deal[];
  }>();

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

  const onChange = (newValue: OnChangeValue<Deal, true>) => {
    let tmp_amount = 0;
    newValue.forEach((element) => {
      tmp_amount +=
        deals.find((deal) => deal.deal_name === element.value)?.deal_price || 0;
    });
    setAmount(tmp_amount);
    console.log(amount);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Form method="post" className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">
          This is form part 2{" "}
        </h1>
        <input type="hidden" value={client.client_mobile_num} name="mobile_num" />
        <label
          htmlFor="service"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Service Taken
        </label>
        <Select
          isMulti
          name="services"
          onChange={onChange}
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
          id="deal"
          options={deal_options}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />

        <div className="text-gray-700 mb-4">
          Expected Total Amount: {amount}
        </div>

        <label
          htmlFor="amount"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Amount Paid
        </label>
        <input
          type="text"
          name="amount_paid"
          id="amount"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          defaultValue={amount}
        />
        <label htmlFor="payment_mode">Mode of Payment</label>
        <Select
          options={[
            { value: "Cash", label: "Cash" },
            { value: "Bank_Transfer", label: "Bank Transfer" },
            { value: "Card", label: "Card" },
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
