import { Product } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import FetchForm from "./FetchForm";
import { getAllProducts } from "~/utils/products/db.server";
import { ActionFunctionArgs } from "@remix-run/node";

export async function loader() {
  const products = await getAllProducts();
  return { products };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const formValues = fetchFormData(formData)


  return null;
}

const fetchFormData = (formData: FormData) => {
  const start_date = formData.get("start_date") || undefined;
  const end_date = formData.get("end_date") || undefined;
  const products = formData.getAll("product");
  const transaction_types = formData.getAll("transaction_type");
  const client_mobile_num = formData.get("client_mobile_num") || undefined;
  const vendor_mobile_num = formData.get("vendor_mobile_num") || undefined;

  return {
    start_date,
    end_date,
    products,
    transaction_types,
    client_mobile_num,
    vendor_mobile_num,
  };
};

export default function View_Product_Sale_Record() {
  const { products } = useLoaderData<{ products: Product[] }>();

  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">
          Product Sales Page
        </h1>
      </div>
      <FetchForm products={products} />
    </div>
  );
}
