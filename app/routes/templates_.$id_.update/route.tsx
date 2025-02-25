import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import Template_Form from "~/components/templates/TemplateForm";
import { getTemplateById, updateTemplate } from "~/utils/templates/db.server";
import { TemplateErrorMessages, TemplateWithRelations } from "~/utils/templates/types";
import { TemplateSchema } from "~/utils/templates/validation.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Id not given in URL");
  }
  const template = await getTemplateById(id);
  if(!template){
    throw new Error(`No template exists with id ${id}`)
  }
  return {template}
}

export async function action({request,params}: ActionFunctionArgs){
    const {id} = params;
    if(!id){
        throw new Error("No id provided in URL")
    }
    const data = await request.json();
    const validationResult = TemplateSchema.safeParse(data);
    if(!validationResult.success){
        return {errorMessages: validationResult.error.flatten().fieldErrors};
    }
    //update template
    const modified_template = await updateTemplate({id, ...validationResult.data})
    throw replace(`/templates/${modified_template.id}`);

}



export default function Update_Template() {
const {template} = useLoaderData<{ template: TemplateWithRelations }>();
  const actionData = useActionData<{errorMessages: TemplateErrorMessages}>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Template_Form template={template} errorMessages={actionData?.errorMessages} />
    </div>
  );
}
