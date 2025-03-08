import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import Template_Form from "~/components/templates/TemplateForm";
import { getTemplateById, updateTemplate } from "~/utils/templates/db.server";
import {
  TemplateErrorMessages,
  TemplateWithRelations,
} from "~/utils/templates/types";
import { TemplateSchema } from "~/utils/templates/validation.server";

export async function loader({ params }: LoaderFunctionArgs) {
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
  const modified_template = await updateTemplate({
    id,
    ...validationResult.data,
  });
  throw replace(`/dashboard/wp/templates/${modified_template.id}`);
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
