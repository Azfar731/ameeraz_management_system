import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import Template_Form from "~/components/templates/TemplateForm";
import { authenticate } from "~/utils/auth/functions.server";
import { getTemplateById, updateTemplate } from "~/utils/templates/db.server";
import {
  TemplateErrorMessages,
  TemplateWithRelations,
} from "~/utils/templates/types";
import { TemplateSchema } from "~/utils/templates/validation.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 3 });
  const { id } = params;
  if (!id) {
    throw new Response("Id not given in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const template = await getTemplateById(id);
  if (!template) {
    throw new Response(`No template exists with id ${id}`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { template };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 3 });
  
  const { id } = params;
  if (!id) {
    throw new Response("No id provided in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const data = await request.json();
  const validationResult = TemplateSchema.safeParse(data);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  //update template
  try {
    const modified_template = await updateTemplate({
      id,
      ...validationResult.data,
    });
    throw replace(`/dashboard/wp/templates/${modified_template.id}`);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errorMessages: {
            name: [
              `Template with name: ${validationResult.data.name} already exists`,
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

export default function Update_Template() {
  const { template } = useLoaderData<{ template: TemplateWithRelations }>();
  const actionData = useActionData<{ errorMessages: TemplateErrorMessages }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Template_Form
        template={template}
        errorMessages={actionData?.errorMessages}
      />
    </div>
  );
}
