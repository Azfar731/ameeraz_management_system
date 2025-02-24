import { Form, useNavigation } from "@remix-run/react";
import { Vendor } from "@prisma/client";
import { VendorErrors } from "~/utils/vendors/types";
import { SerializeFrom } from "@remix-run/node";

export default function Vendor_Form({
  vendor,
  errorMessages,
}: {
  vendor?: SerializeFrom<Vendor>;
  errorMessages?: VendorErrors;
}) {
  const navigation = useNavigation();
  return (
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80">
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {vendor ? "Update Vendor" : "Register Vendor"}
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
        placeholder="03334290689"
        defaultValue={vendor?.vendor_mobile_num}
        required
      />
      {errorMessages?.vendor_mobile_num && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.vendor_mobile_num[0]}
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Ali"
        defaultValue={vendor?.vendor_fname}
        required
      />
      {errorMessages?.vendor_fname && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.vendor_fname[0]}
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="Khan"
        defaultValue={vendor?.vendor_lname}
        required
      />
      {errorMessages?.vendor_lname && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.vendor_lname[0]}
        </h2>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          disabled={
            navigation.state === "loading" || navigation.state === "submitting"
          }
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {vendor ? "Update" : "Register"}
        </button>
      </div>
    </Form>
  );
}
