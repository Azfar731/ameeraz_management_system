import { ActionFunctionArgs } from "@remix-run/node";
import { replace, useActionData } from "@remix-run/react";
import Product_Form from "~/components/products/Product_Form";
import { createProduct } from "~/utils/products/db.server";
import { fetchProductFormData } from "~/utils/products/functions.server";
import { ProductErrors } from "~/utils/products/types";
import { ProductSchema } from "~/utils/products/validation.server";


export async function action({ request }: ActionFunctionArgs) {
   
    const formData = await request.formData();
    const formValues = fetchProductFormData(formData);
  
    const validationResult = ProductSchema.safeParse(formValues);
    if (!validationResult.success) {
      return { errors: validationResult.error.flatten().fieldErrors };
    }
    const new_product = await createProduct({
      ...validationResult.data,
    });
  
    throw replace(`/products/${new_product.prod_id}`);
  }



export default function Create_Products() {
    const actionData = useActionData<{ errors: ProductErrors }>();
    
    return (
      <div className="flex justify-center items-center h-screen">
        <Product_Form  errorMessages={actionData?.errors} />
      </div>
    );
  }
  