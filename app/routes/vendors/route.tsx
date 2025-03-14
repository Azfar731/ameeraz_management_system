import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useNavigation,
} from "@remix-run/react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { LoaderFunctionArgs } from "@remix-run/node";
import { fetchVendors } from "~/utils/vendors/db.server";
import { Vendor } from "@prisma/client";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import { getVendorSearchParams } from "~/utils/vendors/functions.server";
import { fetchVendorSchema } from "~/utils/vendors/validations.server";
import { VendorErrors } from "~/utils/vendors/types";
import { setSearchParameters } from "~/utils/functions";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 1 });
  const searchParams = new URL(request.url).searchParams;
  const searchParamValues = getVendorSearchParams(searchParams);

  const validationResult = fetchVendorSchema.safeParse(searchParamValues);
  if (!validationResult.success) {
    return {
      vendors: [],
      errorMessages: validationResult.error.flatten().fieldErrors,
    };
  }

  if (
    validationResult.data.vendor_fname ||
    validationResult.data.vendor_lname ||
    validationResult.data.vendor_mobile_num
  ) {
    const vendors = await fetchVendors(validationResult.data);
    return { vendors, errorMessages: {} };
  }
  return { vendors: [], errorMessages: {} };
}

export default function Vendors() {
  const [, setSearchParams] = useSearchParams();
  const { vendors, errorMessages } = useLoaderData<{
    vendors: Vendor[];
    errorMessages: VendorErrors;
  }>();
  const navigation = useNavigation();
  console.log("Vendors Fetched: ", vendors);

  //table values
  const nodes = [...vendors];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Mobile Number",
      renderCell: (item: Vendor) => item.vendor_mobile_num,
    },
    {
      label: "First Name",
      renderCell: (item: Vendor) => `${item.vendor_fname}`,
    },
    {
      label: "Last Name",
      renderCell: (item: Vendor) => `${item.vendor_lname}`,
    },
    {
      label: "View",
      renderCell: (item: Vendor) => (
        <Link to={`${item.vendor_id}`}>
          <FaExternalLinkAlt />
        </Link>
      ),
    },
  ];

  const theme = useTheme([
    getTheme(),
    {
      HeaderRow: `
              background-color: #eaf5fd;
            `,
      Row: `
              &:nth-of-type(odd) {
                background-color: #d2e9fb;
              }

              &:nth-of-type(even) {
                background-color: #eaf5fd;
              }
            `,
    },
  ]);

  const getFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const mobile_num = (formData.get("mobile_num") as string) || "";
    const fname = (formData.get("fname") as string) || "";
    const lname = (formData.get("lname") as string) || "";
    if (mobile_num || fname || lname) {
      return { mobile_num, fname, lname };
    }
    return null;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formValues = getFormData(form);
    if (!formValues) {
      return;
    }
    setSearchParameters(formValues, setSearchParams);
  };

  return (
    <div className="m-4 pb-4">
      <div className="w-full flex justify-center items-center">
        <h1 className="font-semibold text-6xl text-gray-700">Vendors</h1>
      </div>
      <Form
        method="get"
        className="bg-white rounded w-1/2"
        onSubmit={handleSubmit}
      >
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
        />
        {errorMessages?.vendor_mobile_num && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages?.vendor_mobile_num[0]}
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
          placeholder="Ali"
        />
        {errorMessages?.vendor_fname && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages?.vendor_fname[0]}
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
          placeholder="Khan"
        />
        {errorMessages?.vendor_lname && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages?.vendor_lname[0]}
          </h2>
        )}
        <button
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={
            navigation.state === "loading" || navigation.state === "submitting"
          }
        >
          Fetch
        </button>
      </Form>

      <div className="mt-20">
        <Link
          to="create"
          className="w-44 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Register Vendor <FaPlus />
        </Link>
        <div className="mt-6">
          <CompactTable columns={COLUMNS} data={data} theme={theme} />
        </div>
      </div>
    </div>
  );
}
