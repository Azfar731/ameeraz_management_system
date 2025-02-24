import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { generate_heading } from "~/utils/render_functions";
import { getTemplateById } from "~/utils/templates/db.server";
import { TemplateWithRelations } from "~/utils/templates/types";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("No Id provided in the URL", {
      status: 400,
      statusText: "Bad Request"
    });
  }
  const template = await getTemplateById(id);
  if (!template) {
    throw new Response(`No Template exists with id: ${id}`, {
      status: 404,
      statusText: "Not Found"
    });
  }
  return { template };
}

export default function Template_Details() {
  const { template } = useLoaderData<{ template: TemplateWithRelations }>();
  const renderered_variables: JSX.Element[] = [];

  if (template.variables?.length > 0) {
    template.variables.forEach((variable, index) => {
      renderered_variables.push(
        <h4 key={`variable${index} name`}>{variable.name}</h4>
      );
      renderered_variables.push(
        <h4 key={`variable${index} type`}>{`${variable.type}(client property: ${variable.client_property})`}</h4>
      );
    });
  }
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to="/templates"
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to All Templates
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Template Details
        </h1>
        <h3 className="font-medium text-gray-700">Name</h3>
        <h3 className="text-gray-600">{template.name}</h3>

        <h3 className="font-medium text-gray-700">Header Type</h3>
        <h3 className="text-gray-600">{template.header_type}</h3>

        {template.header_type === "text" && (
          <>
            <h3 className="font-medium text-gray-700">Header Variable Name</h3>
            <h3 className="text-gray-600">{template.header_var_name}</h3>
          </>
        )}
        
        {template.variables?.length > 0 && generate_heading("Variables", "Name", "Type")}
        {renderered_variables}

        <Link
          to={`update`}
          className="mt-6 w-1/3 bg-blue-500 hover:bg-blue-700 flex items-center justify-around text-white  font-bold py-2 px-4 rounded"
        >
          Edit <FaEdit />
        </Link>
      </div>
    </div>
  );
}
