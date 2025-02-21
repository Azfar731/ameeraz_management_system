import { ProductErrors } from "~/utils/products/types";
import { Form, useNavigation } from "@remix-run/react";
import { Product } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
export default function Product_Form({
  product,
  errorMessages,
}: {
  product?: SerializeFrom<Product>;
  errorMessages?: ProductErrors;
}) {
  const navigation = useNavigation();
  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80 ">
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {product ? "Update product" : "Create product"}
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="shampoo"
        defaultValue={product?.prod_name}
        required
      />
      {errorMessages?.prod_name && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.prod_name[0]}
        </h2>
      )}
      <label
        htmlFor="quantity"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Quantity
      </label>
      <input
        type="number"
        name="quantity"
        id="quantity"
        min={0}
        defaultValue={product?.quantity}
        placeholder="3"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        required
      />
      {errorMessages?.quantity && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.quantity[0]}
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
        defaultValue={product?.prod_price}
        placeholder="1000"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        required
      />
      {errorMessages?.prod_price && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.prod_price[0]}
        </h2>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          disabled={navigation.state === "loading" || navigation.state === "submitting"}
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {product ? "Update" : "Create"}
        </button>
      </div>
    </Form>
  );
}
