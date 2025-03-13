import Category_Form from "~/components/categories/category_form";

import { useActionData } from "@remix-run/react";
import { CategoryErrors } from "~/utils/category/types";
import { ActionFunctionArgs, LoaderFunctionArgs, replace } from "@remix-run/node";
import { categorySchema } from "~/utils/category/validation";
import { createCategory } from "~/utils/category/db.server";
import { authenticate } from "~/utils/auth/functions.server";
import { Prisma } from "@prisma/client";

export async function loader({request}: LoaderFunctionArgs){
  await authenticate({request, requiredClearanceLevel: 2 });
  return null;
}
export async function action({ request }: ActionFunctionArgs) {

  await authenticate({request, requiredClearanceLevel: 2 });

  const formData = await request.formData();
  const cat_name = formData.get("name");

  const validationResult = categorySchema.safeParse({ cat_name });
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  try {
    const new_cateogry = await createCategory(validationResult.data);
    throw replace(`/categories/${new_cateogry.cat_id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errors: {
            cat_name: [
              `Category with name: ${validationResult.data.cat_name} already exists`,
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

export default function Create_Category() {
  const actionData = useActionData<{ errors: CategoryErrors }>();

  return (
    <div className="flex justify-center">
      <Category_Form errorMessage={actionData?.errors} />
    </div>
  );
}
