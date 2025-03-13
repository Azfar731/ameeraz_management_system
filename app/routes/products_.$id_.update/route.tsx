import { Prisma, Product } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import Product_Form from "~/components/products/Product_Form";
import { authenticate } from "~/utils/auth/functions.server";
import { getProductFromId, updateProduct } from "~/utils/products/db.server";
import { fetchProductFormData } from "~/utils/products/functions.server";
import { ProductErrors } from "~/utils/products/types";
import { ProductSchema } from "~/utils/products/validation.server";

export async function loader({request, params }: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 3 });

  const { id } = params;
  if (!id) {
    throw new Response("No Id provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const product = await getProductFromId({ id });
  if (!product) {
    throw new Response(`No Product exists with id: ${id}`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { product };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 3 });

  const { id } = params;
  if (!id) {
    throw new Response("No Id provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const formData = await request.formData();
  const formValues = fetchProductFormData(formData);

  const validationResult = ProductSchema.safeParse(formValues);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  try {
    const updated_product = await updateProduct({
      prod_id: id,
      ...validationResult.data,
    });

    throw replace(`/products/${updated_product.prod_id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errors: {
            prod_name: [
              `Product with name: ${validationResult.data.prod_name} already exists`,
            ],
          },
        };
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}

export default function Update_Products() {
  const { product } = useLoaderData<{ product: Product }>();
  const actionData = useActionData<{ errors: ProductErrors }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Product_Form product={product} errorMessages={actionData?.errors} />
    </div>
  );
}
