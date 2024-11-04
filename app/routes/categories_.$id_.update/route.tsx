import Category_Form from "~/components/categories/category_form";

import { useActionData, useLoaderData } from "@remix-run/react";
import { CategoryErrors } from "~/utils/category/types";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  replace,
} from "@remix-run/node";
import { prisma_client } from ".server/db";
import { categorySchema } from "~/utils/category/validation";
import { fetchCategoryFromId } from "~/utils/category/functions.server";
import { Category } from "@prisma/client";
import { capitalizeFirstLetter } from "~/utils/functions";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error(`No id provided in the URL`);
  }

  const category = await fetchCategoryFromId({ id, include_services: false });
  if (!category) {
    throw new Error(`No category found with id: ${id}`);
  }
  return { category };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Id not provided in the URL");
  }
  const formData = await request.formData();
  const name = formData.get("name");

  const validationResult = categorySchema.safeParse({ cat_name: name });
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const { cat_name } = validationResult.data;

  const updated_cateogry = await update_category_fn({ cat_name, id });
  throw replace(`/categories/${updated_cateogry.cat_id}`);
}

const update_category_fn = async ({
  cat_name,
  id,
}: {
  cat_name: string;
  id: string;
}) => {
  const category = await prisma_client.category.update({
    where: { cat_id: id },
    data: {
      cat_name: capitalizeFirstLetter(cat_name.toLowerCase()),
    },
  });
  return category;
};

export default function Update_Category() {
  const { category } = useLoaderData<{ category: Category }>();
  const actionData = useActionData<{ errors: CategoryErrors }>();

  return (
    <div className="flex justify-center">
      <Category_Form category={category} errorMessage={actionData?.errors} />
    </div>
  );
}
