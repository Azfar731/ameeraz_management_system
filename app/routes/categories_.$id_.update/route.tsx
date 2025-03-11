import Category_Form from "~/components/categories/category_form";

import { useActionData, useLoaderData } from "@remix-run/react";
import { CategoryErrors } from "~/utils/category/types";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  replace,
} from "@remix-run/node";
import { categorySchema } from "~/utils/category/validation";
import { Category } from "@prisma/client";
import { getCategoryFromId, updateCategory } from "~/utils/category/db.server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authenticate } from "~/utils/auth/functions.server";
export async function loader({ request, params }: LoaderFunctionArgs) {

  await authenticate({request, requiredClearanceLevel: 2 });

  const { id } = params;
  if (!id) {
    throw new Response("No id provided in the URL", {
      status: 400,
      statusText: "Bad Request: Missing ID parameter",
    });
  }

  const category = await getCategoryFromId({ id, include_services: false });
  if (!category) {
    throw new Response(`No category found with id: ${id}`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { category };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in the URL", {
      status: 400,
      statusText: "Bad Request: Missing ID parameter",
    });
  }
  const formData = await request.formData();
  const name = formData.get("name");

  const validationResult = categorySchema.safeParse({ cat_name: name });
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const { cat_name } = validationResult.data;
  try {
    const updated_cateogry = await updateCategory({ cat_name, cat_id: id });
    throw replace(`/categories/${updated_cateogry.cat_id}`);
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

export default function Update_Category() {
  const { category } = useLoaderData<{ category: Category }>();
  const actionData = useActionData<{ errors: CategoryErrors }>();

  return (
    <div className="flex justify-center">
      <Category_Form category={category} errorMessage={actionData?.errors} />
    </div>
  );
}
