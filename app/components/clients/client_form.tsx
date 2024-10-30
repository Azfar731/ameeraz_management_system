import { Form } from "@remix-run/react";
import Select from "react-select";
import areasList from "./areas.json";

import { Client } from "@prisma/client";

type Errors = {
  client_fname?: string[];
  client_lname?: string[];
  client_mobile_num?: string[];
  client_area?: string[];
};

export default function Client_Form({
  client,
  errorMessage,
}: {
  client?: Client;
  errorMessage?: Errors;
}) {
  const area_options = areasList.areas.map((area) => ({
    value: area,
    label: area,
  }));
  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80 ">
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {client ? "Update Client" : "Register Client"}
        </h1>
      </div>
      <label
        htmlFor="mobile_num"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Mobile Number
      </label>
      <input
        type="text"
        name="mobile_num"
        id="mobile_num"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        pattern="^0[0-9]{10}$"
        placeholder="03334290689"
        defaultValue={client?.client_mobile_num}
        required
      />
      {errorMessage?.client_mobile_num && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.client_mobile_num[0]}
        </h2>
      )}
      <label
        htmlFor="fname"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        First Name
      </label>
      <input
        type="text"
        name="fname"
        id="fname"
        pattern="^[A-Za-z]+$"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Irha"
        defaultValue={client?.client_fname}
        required
      />
      {errorMessage?.client_fname && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.client_fname[0]}
        </h2>
      )}
      <label
        htmlFor="lname"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Last Name
      </label>
      <input
        type="text"
        name="lname"
        id="lname"
        pattern="^[A-Za-z]+(\s[A-Za-z]+)*$"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Razzaq"
        defaultValue={client?.client_lname}
        required
      />
      {errorMessage?.client_lname && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.client_lname[0]}
        </h2>
      )}
      <label
        htmlFor="area"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Client Area
      </label>
      <Select
        name="area"
        options={area_options}
        className="basic-multi-select mt-2 z-10"
        classNamePrefix="select"
        defaultValue={
          client
            ? {
                value: client.client_area,
                label: client.client_area,
              }
            : undefined
        }
        required
      />
      {errorMessage?.client_area && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.client_area[0]}
        </h2>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {client ? "Update" : "Register"}
        </button>
      </div>
    </Form>
  );
}
