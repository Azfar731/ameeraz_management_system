import { Category } from "@prisma/client";
import { Form } from "@remix-run/react";
import { CategoryErrors } from "~/utils/category/types";

export default function Category_Form({
  category,
  errorMessage,
}: {
  category?: Category;
  errorMessage?: CategoryErrors;
}) {
  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80 ">
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {category ? "Update Category" : "Create Category"}
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
        placeholder="hair"
        defaultValue={category?.cat_name}
        required
      />
      {errorMessage?.cat_name && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.cat_name[0]}
        </h2>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {category ? "Update" : "Create"}
        </button>
      </div>
    </Form>
  );
}
