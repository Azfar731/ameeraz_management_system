import React from "react";
import { Form, useActionData, Link, redirect } from "@remix-run/react";
import { ActionFunction, ActionFunctionArgs } from "@remix-run/node";
import {prisma_client} from ".server/db"
import { equal } from "assert";


export async function action ({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();
    const mobile_num = formData.get("mobile_num")?.toString() || "";
    if(mobile_num){
    const client = prisma_client.client.findFirst({where: {client_mobile_num:  mobile_num}})
    if(!client){return `No client with mobile number: ${mobile_num} found`}
    const redirectUrl = `part2?mobile_num=${encodeURIComponent(mobile_num)}`;
    throw redirect(redirectUrl)
    }else{
        return "No mobile number recieved"
    }
}

export default function Part1() {
    const actionData = useActionData();
  
    return (
      <div className="flex justify-center items-center h-screen">
        <Form method="post" className="bg-white p-6 rounded shadow-md w-80">
          <label
            htmlFor="mobile_num"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Enter Client Mobile Number
          </label>
          <input
            type="text"
            id="mobile_num"
            name="mobile_num"
            pattern="^0[0-9]{10}$"
            placeholder="03334290689"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
        </Form>
      </div>
    );
  }
  

