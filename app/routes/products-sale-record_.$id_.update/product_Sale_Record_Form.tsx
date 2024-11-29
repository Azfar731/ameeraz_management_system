import { Product } from "@prisma/client";
import { Form, useSubmit } from "@remix-run/react";
import { useState } from "react";
import Select, { OnChangeValue } from "react-select";
import {
  getAllTransactionMenuOptions,
  getSingleTransactionMenuOption,
} from "~/utils/functions";
import {
  ProductSaleRecordUpdateErrors,
  ProductSaleRecordWithRelations,
} from "~/utils/productSaleRecord/types";
import { SerializeFrom } from "@remix-run/node";

export default function Product_Sale_Record_Form({
  record,
  products,
  errorMessages,
}: {
  record: SerializeFrom<Omit<ProductSaleRecordWithRelations, "transactions">>;
  products: Product[];
  errorMessages?: ProductSaleRecordUpdateErrors;
}) {
  const submit = useSubmit();
  const { products: products_record, client, vendor } = record;
  const product_options = products.map((product) => ({
    value: product.prod_id,
    label: product.prod_name,
  }));

  const [productsQuantity, setProductsQuantity] = useState<
    { product_id: string; quantity: number }[]
  >(
    products_record.map((entry) => ({
      product_id: entry.product.prod_id,
      quantity: entry.quantity,
    }))
  );
  //calculate expected amount by multiplying quantity by price
  const expectedAmount = productsQuantity.reduce((acc, entry) => {
    const product = products.find((p) => p.prod_id === entry.product_id);
    if (!product) {
      throw new Error(`Product with id: ${entry.product_id} not found`);
    }
    return acc + product.prod_price * entry.quantity;
  }, 0);

  const onProductsChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    setProductsQuantity((prev) => {
      //remove any deleted entries
      const tmp = prev.filter((entry) => {
        return newValue.find((p) => p.value === entry.product_id);
      });
      //add any new entries
      return newValue.map((entry) => {
        const prod_quantity_pair = tmp.find(
          (p) => p.product_id === entry.value
        );
        return prod_quantity_pair
          ? prod_quantity_pair
          : { product_id: entry.value, quantity: 1 };
      });
    });
  };

  const OnProductQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductsQuantity((prev) =>
      prev.map((prod) =>
        prod.product_id === name ? { ...prod, quantity: Number(value) } : prod
      )
    );
  };

  const renderProductsQuantity = productsQuantity.map((prod, index) => {
    return (
      <div
        key={prod.product_id}
        className="mt-4 w-full flex justify-between items-center"
      >
        <label
          htmlFor={`Prod-${index}`}
          className="text-gray-700 text-sm font-bold mb-2 pr-4 w-1/3"
        >
          {}
          {
            products.find((product) => product.prod_id === prod.product_id)
              ?.prod_name
          }
        </label>
        <input
          type="number"
          id={`Prod-${index}`}
          name={prod.product_id}
          min={1}
          defaultValue={prod.quantity}
          onChange={OnProductQuantityChange}
          required
          placeholder="2"
          className="px-3 py-2 border border-gray-300 rounded-md mb-4 w-2/3"
        />
      </div>
    );
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Prepare form data
    const dataObject = {
      mobile_num: formData.get("mobile_num")?.toString() || "",
      transaction_type: formData.get("transaction_type")?.toString() || "",
      total_amount: formData.get("amount_charged")?.toString() || "0",
      products_quantity: productsQuantity,
      isClient: client ? true : false,
    };
    console.log("Final form data: ", dataObject);

    // Submit form
    submit(dataObject, { method: "post", encType: "application/json" });
  };

  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      className="bg-white mt-14 p-6 rounded shadow-md w-80 "
    >
      <>
        <label
          htmlFor="mobile_num"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {`${client ? "Client" : "Vendor"} Mobile Number`}
        </label>
        <input
          type="text"
          name="mobile_num"
          id="mobile_num"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          defaultValue={
            client ? client.client_mobile_num : vendor?.vendor_mobile_num
          }
          required
        />
      </>
      {errorMessages?.mobile_num && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.mobile_num[0]}
        </h2>
      )}
      <label
        htmlFor="products"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Products
      </label>
      <Select
        isMulti
        name="products"
        options={product_options}
        onChange={onProductsChange}
        defaultValue={products_record.map((entry) => {
          const product = products.find((p) => p.prod_id === entry.prod_id);
          if (!product) {
            throw new Error(`Product with id: ${entry.prod_id} not found`);
          }
          return { value: product.prod_id, label: product.prod_name };
        })}
        className="basic-multi-select mb-4"
        classNamePrefix="select"
      />

      {renderProductsQuantity}
      {errorMessages?.products_quantity && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.products_quantity[0]}
        </h2>
      )}
      <div className="text-gray-700 mb-4">
        Expected Total Amount: {expectedAmount}
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
        defaultValue={record.total_amount}
        min={0}
        required
      />
      {errorMessages?.total_amount && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.total_amount[0]}
        </h2>
      )}
      <label
        htmlFor="transaction_type"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Transaction Type
      </label>
      <Select
        options={getAllTransactionMenuOptions().filter((type) => {
          if (client) {
            return type.value === "sold" || type.value === "returned";
          } else {
            return type.value === "bought" || type.value === "returned";
          }
        })}
        name="transaction_type"
        id="transaction_type"
        defaultValue={getSingleTransactionMenuOption(record.transaction_type)}
        className="basic-multi-select mb-4"
        classNamePrefix="select"
        required
      />

      {errorMessages?.transaction_type && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.transaction_type[0]}
        </h2>
      )}
     
      <div className="flex justify-center items-center mt-6">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Update
        </button>
      </div>
    </Form>
  );
}
