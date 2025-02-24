import { Client, Payment, Product, Vendor } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import {
  Form,
  replace,
  useLoaderData,
  useActionData,
  useNavigate,
  useOutletContext,
  useSubmit,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import Select, { OnChangeValue } from "react-select";
import { getClientByMobile } from "~/utils/client/db.server";
import {
  getAllPaymentMenuOptions,
  getSinglePaymentMenuOption,
} from "~/utils/functions";
import { getAllProducts } from "~/utils/products/db.server";
import { createProductSaleRecord } from "~/utils/productSaleRecord/db.server";
import {
  ProductSaleRecordCreateErrors,
  ProductSaleRecordCreateFormType,
} from "~/utils/productSaleRecord/types";
import { productSaleRecordSchema } from "~/utils/productSaleRecord/validation.server";
import { findVendorByMobileNumber } from "~/utils/vendors/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const mobile_num = searchParams.get("mobile_num");
  if (!mobile_num) {
    throw new Response("Mobile number not provided in URL", {
      status: 400,
      statusText: "Bad Request"
    });
  }

  const isClient = searchParams.get("isClient") === "true";
  let client;
  let vendor;
  if (isClient) {
    client = await getClientByMobile(mobile_num);
    if (!client) {
      throw new Response(`Client with mobile number ${mobile_num} not found`, {
        status: 404,
        statusText: "Not Found"
      });
    }
  } else {
    vendor = await findVendorByMobileNumber(mobile_num);
    if (!vendor) {
      throw new Response(`Vendor with mobile number ${mobile_num} not found`, {
        status: 404,
        statusText: "Not Found"
      });
    }
  }
  const products = await getAllProducts();

  return { products, client, vendor };
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const data: ProductSaleRecordCreateFormType = await request.json();

  console.log("Form Data:", data);

  // Process the form data here
  const validationResult = await productSaleRecordSchema.safeParseAsync(data);
  if (!validationResult.success) {
    console.log("validation failed");
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  // Save the data to the database
  const record = await createProductSaleRecord(validationResult.data);
  console.log("Record created: ", record);
  throw replace(`/products-sale-record/${record.product_record_id}`);
};

export default function Product_Sale_Record_Create_Part3() {
  const { products, client, vendor } = useLoaderData<{
    products: Product[];
    client: Client | undefined;
    vendor: Vendor | undefined;
  }>();
  const actionData = useActionData<{
    errorMessages: ProductSaleRecordCreateErrors;
  }>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const { formData: globalFormData, setFormData } = useOutletContext<{
    formData: ProductSaleRecordCreateFormType;
    setFormData: React.Dispatch<
      React.SetStateAction<ProductSaleRecordCreateFormType>
    >;
  }>();
  const [productsQuantity, setProductsQuantity] = useState<
    { product_id: string; quantity: number }[]
  >(globalFormData.products_quantity);

  const formRef = useRef<HTMLFormElement>(null);
  const isFirstRender = useRef(true);
  const product_options = products.map((product) => ({
    value: product.prod_id,
    label: product.prod_name,
  }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payment_mode = formData.get("mode_of_payment")?.toString() || "";
    // Prepare form data
    const formDatalocal = {
      ...globalFormData,
      amount_charged: amounts.amountCharged,
      amount_paid: amounts.amountPaid,
      products_quantity: productsQuantity,
      mode_of_payment: payment_mode as Payment,
    };
    console.log("Final form data: ", formDatalocal);

    // Submit form
    submit(formDatalocal, { method: "post", encType: "application/json" });
  };

  const GoToPrevPage = () => {
    const form = formRef.current;
    if (!form) return;
    const pageFormData = new FormData(form);
    const payment_mode = pageFormData.get("mode_of_payment")?.toString() || "";
    // const formDataObj = extractFormData(pageFormData);
    setFormData((prev) => ({
      ...prev,
      amount_charged: amounts.amountCharged,
      amount_paid: amounts.amountPaid,
      products_quantity: productsQuantity,
      mode_of_payment: payment_mode as Payment,
    }));
    navigate("/products-sale-record/create/part2");
  };

  //values for maninting amount state
  const [amounts, setAmounts] = useState({
    expectedAmount: 0,
    amountCharged: globalFormData.amount_charged || 0,
    amountPaid: globalFormData.amount_paid || 0,
  });

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

  useEffect(() => {
    const expectedAmount = productsQuantity.reduce((acc, curr) => {
      const product = products.find((p) => p.prod_id === curr.product_id);
      if (!product) {
        throw new Error(`Product with id: ${curr.product_id} not found`);
      }
      return acc + product.prod_price * curr.quantity;
    }, 0);
    if (isFirstRender.current) {
      setAmounts({
        expectedAmount,
        amountCharged: globalFormData.amount_charged || expectedAmount,
        amountPaid: globalFormData.amount_paid || expectedAmount,
      });
      isFirstRender.current = false;
    } else {
      setAmounts({
        expectedAmount,
        amountCharged: expectedAmount,
        amountPaid: expectedAmount,
      });
    }
  }, [
    productsQuantity,
    products,
    globalFormData.amount_charged,
    globalFormData.amount_paid,
  ]);

  const navigation = useNavigation();

  return (
    <div className="flex justify-center items-center h-full m-4 overflow-hidden">
      <Form
        method="post"
        onSubmit={handleSubmit}
        ref={formRef}
        className="bg-white mt-14 p-6 rounded shadow-md w-80 "
      >
        {globalFormData.transaction_type === "sold" ||
        globalFormData.transaction_type === "returned"
          ? client && (
              <>
                <div className="block text-gray-700 text-sm font-bold mb-2">
                  Client Name:
                  <span className="font-semibold">
                    {`${client.client_fname} ${client.client_lname}`}
                  </span>
                </div>
                <div className="block text-gray-700 text-sm font-bold mb-2">
                  Mobile Number:{" "}
                  <span className="font-semibold">
                    {client.client_mobile_num}
                  </span>
                </div>
              </>
            )
          : vendor && (
              <>
                <div className="block text-gray-700 text-sm font-bold mb-2">
                  Vendor Name:
                  <span className="font-semibold">
                    {`${vendor?.vendor_fname} ${vendor?.vendor_lname}`}
                  </span>
                </div>
                <div className="block text-gray-700 text-sm font-bold mb-2">
                  Mobile Number:{" "}
                  <span className="font-semibold">
                    {vendor.vendor_mobile_num}
                  </span>
                </div>
              </>
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
          defaultValue={globalFormData.products_quantity.map((entry) => {
            const product = products.find(
              (p) => p.prod_id === entry.product_id
            );
            if (!product) {
              throw new Error(`Product with id: ${entry.product_id} not found`);
            }
            return { value: product.prod_id, label: product.prod_name };
          })}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />

        {renderProductsQuantity}
        {actionData?.errorMessages.products_quantity && (
          <h2 className="text-red-500 font-semibold">
            {actionData?.errorMessages.products_quantity[0]}
          </h2>
        )}
        <div className="text-gray-700 mb-4">
          Expected Total Amount: {amounts.expectedAmount}
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
          value={amounts.amountCharged}
          onChange={(e) =>
            setAmounts((prev) => ({
              ...prev,
              amountCharged: Number(e.target.value),
            }))
          }
          min={0}
          required
        />
        {actionData?.errorMessages.amount_charged && (
          <h2 className="text-red-500 font-semibold">
            {actionData?.errorMessages.amount_charged[0]}
          </h2>
        )}
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
          value={amounts.amountPaid}
          onChange={(e) =>
            setAmounts((prev) => ({
              ...prev,
              amountPaid: Number(e.target.value),
            }))
          }
          min={0}
          required
        />
        {actionData?.errorMessages.amount_paid && (
          <h2 className="text-red-500 font-semibold">
            {actionData?.errorMessages.amount_paid[0]}
          </h2>
        )}
        <label htmlFor="payment_mode">Mode of Payment</label>
        <Select
          options={getAllPaymentMenuOptions()}
          name="mode_of_payment"
          id="payment_mode"
          defaultValue={getSinglePaymentMenuOption(
            globalFormData.mode_of_payment
          )}
        />
        {actionData?.errorMessages.products_quantity && (
          <h2 className="text-red-500 font-semibold">
            {actionData?.errorMessages.products_quantity[0]}
          </h2>
        )}
        {
          /* {Object.keys(actionData?.errorMessages || {}).map((key) => {
          if (
            key !== "amount_paid" &&
            key !== "amount_charged" &&
            key !== "mode_of_payment" &&
            key !== "products_quantity"
          ) {
            return (
              <h2 key={key} className="text-red-500 font-semibold">
               {`${key}: ${actionData?.errorMessages[key as keyof ProductSaleRecordCreateErrors][0]}`}
              </h2>
            );
          }
          return null;
        })} */
          Object.keys(actionData?.errorMessages || {}).map((key) => {
            return (
              <h2 key={key} className="text-red-500 font-semibold">
                {`${key}: ${
                  actionData?.errorMessages[
                    key as keyof ProductSaleRecordCreateErrors
                  ][0]
                }`}
              </h2>
            );
          })
        }

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={GoToPrevPage}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={
              navigation.state === "loading" ||
              navigation.state === "submitting"
            }
          >
            Next
          </button>
        </div>
      </Form>
    </div>
  );
}
