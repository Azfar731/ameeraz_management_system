import { User } from "@prisma/client";
import { Form } from "@remix-run/react";
import Select from "react-select";
import { ClearanceLevel } from "~/utils/auth/functions.server";
import { UserErrorMessages } from "~/utils/user/types";

export default function User_Form({
  user,
  currentUserClearanceLevel,
  errorMessage,
}: {
  user?: User;
  currentUserClearanceLevel: number;
  errorMessage?: UserErrorMessages;
}) {
  const role_options = [{value: "worker", label: "Worker"},{value: "manager", label: "Manager" }]
  if(currentUserClearanceLevel === ClearanceLevel.Admin){
    role_options.push({value: "admin", label: "admin"})
  }  
  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80 ">
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {user ? "Update Client" : "Register Client"}
        </h1>
      </div>

      <label
        htmlFor="userName"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        UserName
      </label>
      <input
        type="text"
        name="userName"
        id="userName"
        pattern="^[A-Za-z0-9]+$"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Irha123"
        defaultValue={user?.userName}
        required
      />
      {errorMessage?.userName && (
        <h2 className="text-red-500 font-semibold">{errorMessage.userName[0]}</h2>
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
        defaultValue={user?.fname}
        required
      />
      {errorMessage?.fname && (
        <h2 className="text-red-500 font-semibold">{errorMessage.fname[0]}</h2>
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
        defaultValue={user?.lname}
        required
      />
      {errorMessage?.lname && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.lname[0]}
        </h2>
      )}
      <label
        htmlFor="role"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Client Area
      </label>
      <Select
        name="role"
        options={role_options}
        className="basic-multi-select mt-2 z-10"
        classNamePrefix="select"
        defaultValue={
          user
            ? {
                value: `${user.role}`,
                label: `${user.role}`,
              }
            : undefined
        }
        required
      />
      {errorMessage?.role && (
        <h2 className="text-red-500 font-semibold">
          {errorMessage.role[0]}
        </h2>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {user ? "Update" : "Register"}
        </button>
      </div>
    </Form>
  );
}
