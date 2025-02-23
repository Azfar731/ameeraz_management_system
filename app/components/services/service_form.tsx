import { ServiceErrors, ServiceWithRelations } from "~/utils/service/types";
import { Form } from "@remix-run/react";
import Select from "react-select";
import { Category } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";

export default function Service_Form({
  categories,
  service,
  errorMessage,
}: {
  categories: Category[];
  service?: SerializeFrom<ServiceWithRelations>;
  errorMessage?: ServiceErrors;
}) {
  const category_options = categories.map((category) => ({
    value: category.cat_id,
    label: category.cat_name,
  }));

  const status_options = [{value: "true" , label: "Active"},{value: "false" , label: "Inactive"}]

  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80 ">
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {service ? "Update Service" : "Create Service"}
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
        pattern="^[A-Za-z]+(\s[A-Za-z]+)*$"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Pedicure"
        defaultValue={service?.serv_name}
        required
      />
      {errorMessage?.serv_name && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.serv_name[0]}
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
        defaultValue={service?.serv_price}
        placeholder="3000"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        required
      />
      {errorMessage?.serv_price && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.serv_price[0]}
        </h2>
      )}
      <label
        htmlFor="category"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Category
      </label>
      <Select
        name="category"
        id="category"
        options={category_options}
        defaultValue={category_options.find(
          (opt) => opt.value === service?.serv_category
        )}
        className="basic-multi-select mb-4"
        classNamePrefix="select"
      />
      {errorMessage?.serv_category && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.serv_category[0]}
        </h2>
      )}
      {service && (
        <>
          <label
            htmlFor="status"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Status
          </label>
          <Select
            name="status"
            id="status"
            options={status_options}
            defaultValue={service.deals[0].activate_till? status_options[1]: status_options[0]}
            className="basic-multi-select mb-4"
            classNamePrefix="select"
          />
        </>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {service ? "Update" : "Create"}
        </button>
      </div>
    </Form>
  );
}
