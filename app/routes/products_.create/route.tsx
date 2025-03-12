import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData } from "@remix-run/react";
import Product_Form from "~/components/products/Product_Form";
import { authenticate } from "~/utils/auth/functions.server";
import { createProduct } from "~/utils/products/db.server";
import { fetchProductFormData } from "~/utils/products/functions.server";
import { ProductErrors } from "~/utils/products/types";
import { ProductSchema } from "~/utils/products/validation.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 2 });

  const formData = await request.formData();
  const formValues = fetchProductFormData(formData);

  const validationResult = ProductSchema.safeParse(formValues);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  try {
    const new_product = await createProduct({
      ...validationResult.data,
    });

    throw replace(`/products/${new_product.prod_id}`);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
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

export default function Create_Products() {
  const actionData = useActionData<{ errors: ProductErrors }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Product_Form errorMessages={actionData?.errors} />
    </div>
  );
}
