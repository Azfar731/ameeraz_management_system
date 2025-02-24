import { Link, useLoaderData } from "@remix-run/react";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Employee } from "@prisma/client";
import { getEmployeeFromId } from "~/utils/employee/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const employee = await getEmployeeFromId(id);
  if (!employee) {
    throw new Response(`Employee with id:${id} not found`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { employee };
}

export default function View_Employee() {
  const { employee: emp } = useLoaderData<{ employee: Employee }>();
  console.log(emp);
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to="/employees"
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Employees
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Employee Details
        </h1>
        <h3 className="font-medium text-gray-700">First Name</h3>
        <h3 className="text-gray-600">{emp.emp_fname}</h3>

        <h3 className="font-medium text-gray-700">Last Name</h3>
        <h3 className="text-gray-600">{emp.emp_lname}</h3>

        <h3 className="font-medium text-gray-700">Mobile Number</h3>
        <h3 className="text-gray-600">{emp.emp_mobile_num}</h3>

        <h3 className="font-medium text-gray-700">Base Salaray</h3>
        <h3 className="text-gray-600">{emp.base_salary}</h3>

        <h3 className="font-medium text-gray-700">Percentage</h3>
        <h3 className="text-gray-600">{`${emp.percentage}%`}</h3>

        <h3 className="font-medium text-gray-700">Status</h3>
        <h3 className="text-gray-600">{emp.emp_status ? "Active" : "Left"}</h3>
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
