import { ActionFunctionArgs, redirect } from "@remix-run/node";
import Client_Form from "~/components/clients/client_form";
import { prisma_client } from ".server/db";
import { ClientValues } from "~/utils/types";
import { useActionData } from "@remix-run/react";
export async function action({request}: ActionFunctionArgs){
    const formData = await request.formData()
    const {client_fname,client_lname,client_mobile_num,client_area} = getClientFormData(formData)  
    if(client_fname && client_lname && client_mobile_num && client_area){
        const client = await create_client({client_fname,client_lname,client_mobile_num,client_area})
        throw redirect(`/clients/${client.client_id}`)
    }else{
        return {msg: "All values must be provided"}
    }

}

const getClientFormData =  (formData: FormData)=>{
    const fname = formData.get("fname")  as string   || ""
    const lname = formData.get("lname") as string || ""
    const mobile_num = formData.get("mobile_num") as string || ""
    const area = formData.get("area") as string || ""
    
    return {client_fname: fname,client_lname: lname,client_mobile_num: mobile_num,client_area:area}
}

const create_client = async ({client_fname,client_lname,client_mobile_num,client_area}: ClientValues) => {
    const client = await prisma_client.client.create({data: {
        client_fname,
        client_lname,
        client_area,
        client_mobile_num
    } })
    return client
}

export default function Create_Client() {
  
  const actionData = useActionData<{msg: string}>()
  return (
    <div className="flex justify-center items-center h-screen">
      <Client_Form errorMessage={actionData?.msg}/>
    </div>
  );
}
