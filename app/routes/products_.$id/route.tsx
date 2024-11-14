import { Product } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { getProductFromId } from "~/utils/products/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error(`No Id provided in the URL`);
  }

  const product = await getProductFromId({ id });
  if (!product) {
    throw new Error(`No Product exists with id: ${id}`);
  }
  return { product };
}

export default function View_Product() {
  const { product } = useLoaderData<{ product: Product }>();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to="/products"
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Products
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Product Details
        </h1>
        <h3 className="font-medium text-gray-700">Name</h3>
        <h3 className="text-gray-600">{product.prod_name}</h3>

        <h3 className="font-medium text-gray-700">Quantity</h3>
        <h3 className="text-gray-600">{product.quantity}</h3>

        <Link
          to={`update`}
          className="mt-6 w-1/3 bg-blue-500 hover:bg-blue-700 flex items-center justify-around text-white  font-bold py-2 px-4 rounded"
        >
          Edit <FaEdit />
        </Link>
      </div>
    </div>
  );
}
