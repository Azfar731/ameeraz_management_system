import Category_Form from "~/components/categories/category_form";

import { useActionData } from "@remix-run/react";
import { CategoryErrors } from "~/utils/category/types";
import { ActionFunctionArgs, replace } from "@remix-run/node";
import { categorySchema } from "~/utils/category/validation";
import { createCategory } from "~/utils/category/db.server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function action({ request }: ActionFunctionArgs) {
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
    if (error instanceof PrismaClientKnownRequestError) {
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
