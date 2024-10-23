import { Form } from "@remix-run/react"
import Select from "react-select"
import areasList from "./areas.json"
import { ClientValues } from "~/utils/types"


export default function Client_Form({clientValues,errorMessage}: {clientValues?: ClientValues;errorMessage?:string } ){
    
    const area_options = areasList.areas.map(area => ({value: area, label:area}))
    return(
    <Form method="post" className="bg-white mt-14 p-6 rounded shadow-md w-80 ">
    <div className="w-full flex justify-center items-center">
    <h1 className="block text-gray-700 text-2xl font-bold mt-4">{clientValues? "Update Client":"Register Client"}</h1>
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
      defaultValue={clientValues?.client_mobile_num}
      required
    />
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
      defaultValue={clientValues?.client_fname}
      required
    />
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
      defaultValue={clientValues?.client_lname}
      required
    />
    <label htmlFor="area" className="block text-gray-700 text-sm font-bold mt-4">Client Area</label>
    <Select
      name="area"
      options={area_options}
      className="basic-multi-select mt-2 z-10"
      classNamePrefix="select"
      defaultValue={clientValues? {value: clientValues.client_area,label:clientValues.client_area}: undefined}
      required
    />
    {errorMessage && (
      <h2 className="text-red-500 font-semibold">{errorMessage}</h2>
    )}
    <button
      type="submit"
      className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Register
    </button>
    </Form>)
}