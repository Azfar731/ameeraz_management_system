import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData } from "@remix-run/react";
import Template_Form from "~/components/templates/TemplateForm";
import { authenticate } from "~/utils/auth/functions.server";
import { createTemplate } from "~/utils/templates/db.server";
import { TemplateErrorMessages } from "~/utils/templates/types";
import { TemplateSchema } from "~/utils/templates/validation.server";

export async function loader({request}: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 3 });
  console.log("Loader function called");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 3 });

  const data = await request.json();
  const validationResult = TemplateSchema.safeParse(data);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  //create template
  try {
    const new_template = await createTemplate(validationResult.data);
    throw replace(`/dashboard/wp/templates/${new_template.id}`);
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

export default function Create_Template() {
  const actionData = useActionData<{ errorMessages: TemplateErrorMessages }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Template_Form errorMessages={actionData?.errorMessages} />
    </div>
  );
}
