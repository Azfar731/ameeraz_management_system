import Category_Form from "~/components/categories/category_form";

import { useActionData } from "@remix-run/react";
import { CategoryErrors } from "~/utils/category/types";
import { ActionFunctionArgs, replace } from "@remix-run/node";
import { prisma_client } from "~/.server/db";
import { categorySchema } from "~/utils/category/validation";
import { capitalizeFirstLetter } from "~/utils/functions";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const cat_name = formData.get("name");

  const validationResult = categorySchema.safeParse({ cat_name });
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const new_cateogry = await create_category_fn(validationResult.data);
  throw replace(`/categories/${new_cateogry.cat_id}`);
}

const create_category_fn = async ({ cat_name }: { cat_name: string }) => {
  const category = await prisma_client.category.create({
    data: {
      cat_name: capitalizeFirstLetter(cat_name.toLowerCase()),
    },
  });
  return category;
};

export default function Create_Category() {
  const actionData = useActionData<{ errors: CategoryErrors }>();

  return (
    <div className="flex justify-center">
      <Category_Form errorMessage={actionData?.errors} />
    </div>
  );
}
