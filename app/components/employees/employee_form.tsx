import { Form } from "@remix-run/react";
import { Employee } from "@prisma/client";
import { EmployeeErrors } from "~/utils/employee/types";
import Select from "react-select";
import { SerializeFrom } from "@remix-run/node";
export default function Employee_Form({
  employee,
  errorMessage,
}: {
  employee?:  SerializeFrom<Employee>;
  errorMessage?: EmployeeErrors;
}) {
  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80 ">
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {employee ? "Update Employee" : "Register Employee"}
        </h1>
      </div>
      <label
        htmlFor="mobile_num"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Mobile Number
      </label>
      <input
        type="text"
        name="mobile_num"
        id="mobile_num"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        pattern="^0[0-9]{10}$"
        placeholder="03334290689"
        defaultValue={employee?.emp_mobile_num}
        required
      />
      {errorMessage?.emp_mobile_num && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.emp_mobile_num[0]}
        </h2>
      )}
      <label
        htmlFor="fname"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        First Name
      </label>
      <input
        type="text"
        name="fname"
        id="fname"
        pattern="^[A-Za-z]+$"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Irha"
        defaultValue={employee?.emp_fname}
        required
      />
      {errorMessage?.emp_fname && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.emp_fname[0]}
        </h2>
      )}
      <label
        htmlFor="lname"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Last Name
      </label>
      <input
        type="text"
        name="lname"
        id="lname"
        pattern="^[A-Za-z]+(\s[A-Za-z]+)*$"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Razzaq"
        defaultValue={employee?.emp_lname}
        required
      />
      {errorMessage?.emp_lname && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.emp_lname[0]}
        </h2>
      )}
      <label
        htmlFor="base_salary"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Base Salary
      </label>
      <input
        type="number"
        name="base_salary"
        id="base_salary"
        min={0}
        defaultValue={employee?.base_salary}
        placeholder="35000"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        required
      />
      {errorMessage?.base_salary && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.base_salary[0]}
        </h2>
      )}
      <label
        htmlFor="percentage"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Percentage
      </label>
      <input
        type="number"
        name="percentage"
        id="percentage"
        min={0}
        max={100}
        placeholder="5"
        defaultValue={employee?.percentage}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        required
      />
      {errorMessage?.percentage && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.percentage[0]}
        </h2>
      )}
      {employee && (
        <>
          <label
            htmlFor="status"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Status
          </label>
          <Select
            name="status"
            id="status"
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Left" },
            ]}
            defaultValue={employee.emp_status? { value: "true", label: "Active" }: { value: "false", label: "Left" }}
            className="basic-multi-select mb-4"
            classNamePrefix="select"
          />
        </>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {employee ? "Update" : "Register"}
        </button>
      </div>
    </Form>
  );
}
