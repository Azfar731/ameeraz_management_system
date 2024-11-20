import { Client, Product, Vendor } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { useRef, useState } from "react";
import Select, { OnChangeValue } from "react-select";
import { findClientByMobile } from "~/utils/client/db.server";
import {
  getAllPaymentMenuOptions,
  getSinglePaymentMenuOption,
} from "~/utils/functions";
import { getAllProducts } from "~/utils/products/db.server";
import { ProductSaleRecordCreateFormType } from "~/utils/productSaleRecord/types";
import { findVendorByMobileNumber } from "~/utils/vendors/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const mobile_num = searchParams.get("mobile_num");
  if (!mobile_num)
    throw new Error(`Client with mobile number: ${mobile_num} does not exist`);
  const transaction_type = searchParams.get("transaction_type");
  if (!transaction_type) {
    throw new Error(`Transaction type is required`);
  }
  let client;
  let vendor;
  if (transaction_type === "bought") {
    vendor = await findVendorByMobileNumber(mobile_num);
  } else {
    client = await findClientByMobile(mobile_num);
  }
  const products = await getAllProducts();

  return { products, client, vendor };
}

export default function Product_Sale_Record_Create_Part3() {
  const { products, client, vendor } = useLoaderData<{
    products: Product[];
    client: Client | undefined;
    vendor: Vendor | undefined;
  }>();

  const submit = useSubmit();
  const navigate = useNavigate();
  const { formData: globalFormData, setFormData } = useOutletContext<{
    formData: ProductSaleRecordCreateFormType;
    setFormData: React.Dispatch<
      React.SetStateAction<ProductSaleRecordCreateFormType>
    >;
  }>();

  const formRef = useRef<HTMLFormElement>(null);
  const product_options = products.map((product) => ({
    value: product.prod_id,
    label: product.prod_name,
  }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Prepare form data
    const formDatalocal = { ...globalFormData, ...formData };
    console.log("Final form data: ", formDatalocal);

    // Submit form
    submit(formDatalocal, { method: "post", encType: "application/json" });
  };

  function extractFormData(formData: FormData) {
    const amount_charged = Number(formData.get("amount_charged"));
    const amount_paid = Number(formData.get("amount_paid"));
    const quantity = Number(formData.get("quantity"));
    const payment_mode = formData.get("mode_of_payment")?.toString() || "";
    const products = formData
      .getAll("products")
      .map((prod_id) => prod_id.toString());
    return { amount_charged, amount_paid, payment_mode, products, quantity };
  }

  const GoToPrevPage = () => {
    const form = formRef.current;
    if (!form) return;
    const pageFormData = new FormData(form);
    const formDataObj = extractFormData(pageFormData);
    setFormData((prev) => ({ ...prev, ...formDataObj }));
    navigate("/products-sale-record/create/part2");
  };

  //values for maninting amount state
  const [amounts, setAmounts] = useState({
    expectedAmount: 0,
    amountCharged: 0,
    amountPaid: 0,
  });
  
  const onProductsChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    let tmp = 0;
    newValue.forEach((entry) => {
      const product = products.find((p) => p.prod_id === entry.value);
      if (product) {
        tmp += product.prod_price;
      }
    });
    setAmounts((prev) => ({ ...prev, expectedAmount: tmp }));
  };

  return (
    <div className="flex justify-center items-center h-screen">
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
          defaultValue={globalFormData.products.map((id) => {
            const product = products.find((p) => p.prod_id === id);
            if (!product) {
              throw new Error(`Product with id: ${id} not found`);
            }
            return { value: product.prod_id, label: product.prod_name };
          })}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />
        

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

        <label htmlFor="payment_mode">Mode of Payment</label>
        <Select
          options={getAllPaymentMenuOptions()}
          name="mode_of_payment"
          id="payment_mode"
          defaultValue={getSinglePaymentMenuOption(
            globalFormData.mode_of_payment
          )}
        />
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </Form>
    </div>
  );
}
