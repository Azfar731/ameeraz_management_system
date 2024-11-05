import { Service } from "@prisma/client";
import { DealErrors, DealWithServices } from "~/utils/deal/types";
import { Form, useSubmit } from "@remix-run/react";
import { formatDate } from "shared/utilityFunctions";
import Select, { OnChangeValue } from "react-select";
import { useRef } from "react";
export default function Deal_Form({
  services,
  deal,
  errorMessage,
}: {
  services: Service[];
  deal?: DealWithServices;
  errorMessage?: DealErrors;
}) {
  //references
  const servicesRef = useRef<{ value: string; label: string }[]>([]);

  //hooks
  const submit = useSubmit();

  const service_options = services.map((serv) => ({
    value: serv.serv_id,
    label: serv.serv_name,
  }));

  const onServicesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    servicesRef.current = [...newValue];
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const serviceIds = servicesRef.current
      ?.map((service) => service.value)
      .join("|");
    formData.append("services", serviceIds);

    submit(formData, { method: "post" });
  };
  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      className="bg-white mt-14 p-6 rounded shadow-md w-80 "
    >
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {deal ? "Update Deal" : "Create Deal"}
        </h1>
      </div>
      <label
        htmlFor="name"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Name
      </label>
      <input
        type="text"
        name="name"
        id="name"
       pattern="^[A-Za-z0-9]+(\s[A-Za-z0-9]+)*$"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Pedicure"
        defaultValue={deal?.deal_name}
        required
      />
      {errorMessage?.deal_name && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.deal_name[0]}
        </h2>
      )}
      <label
        htmlFor="price"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Price
      </label>
      <input
        type="number"
        name="price"
        id="price"
        min={0}
        defaultValue={deal?.deal_price}
        placeholder="3000"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        required
      />
      {errorMessage?.deal_price && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.deal_price[0]}
        </h2>
      )}
      <label
        htmlFor="startDate"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Active From
      </label>
      <input
        id="startDate"
        name="startDate"
        aria-label="Date"
        type="date"
        defaultValue={
          deal?  formatDate(deal.activate_from) : undefined
        }
        className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        required
      />
      {errorMessage?.activate_from && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.activate_from[0]}
        </h2>
      )}
      <label
        htmlFor="endDate"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Active Till
      </label>
      <input
        id="endDate"
        name="endDate"
        aria-label="Date"
        type="date"
        defaultValue={deal?.activate_till? formatDate(deal.activate_till) : undefined}
        className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        required
      />
      {errorMessage?.activate_till && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.activate_till[0]}
        </h2>
      )}
      <label
        htmlFor="services"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Services
      </label>
      <Select
        isMulti
        name="services"
        onChange={onServicesChange}
        options={service_options}
        // defaultValue={def_services}
        className="basic-multi-select mt-2"
        classNamePrefix="select"
        required
      />
      {errorMessage?.services && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.services[0]}
        </h2>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {deal ? "Update" : "Create"}
        </button>
      </div>
    </Form>
  );
}
