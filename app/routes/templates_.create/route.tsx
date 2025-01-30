import { ActionFunctionArgs } from "@remix-run/node";
import { replace, useActionData } from "@remix-run/react";
import Template_Form from "~/components/templates/TemplateForm";
import { createTemplate } from "~/utils/templates/db.server";
import { TemplateErrorMessages } from "~/utils/templates/types";
import { TemplateSchema } from "~/utils/templates/validation.server";



export async function action({request}: ActionFunctionArgs){
    const data = await request.json();
    const validationResult = TemplateSchema.safeParse(data);
    if(!validationResult.success){
        return {errorMessages: validationResult.error.flatten().fieldErrors};
    }
    //create template
    const new_template = await createTemplate(validationResult.data)
    throw replace(`/templates/${new_template.id}`);
}


export default function Create_Template(){

    const actionData = useActionData<{errorMessages: TemplateErrorMessages}>();
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Template_Form errorMessages={actionData?.errorMessages} />
    </div>
  );
}