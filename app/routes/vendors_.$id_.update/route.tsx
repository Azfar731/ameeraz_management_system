import { Vendor } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import Vendor_Form from "~/components/vendors/Vendor_Form";
import { getVendorFromId, updateVendor } from "~/utils/vendors/db.server";
import { getVendorFormData } from "~/utils/vendors/functions.server";
import { VendorErrors } from "~/utils/vendors/types";
import { vendorSchema } from "~/utils/vendors/validations.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Id not provided in URL");
  }
  const vendor = await getVendorFromId({ id });
  if (!vendor) {
    throw new Error(`Vendor with id:${id} not found`);
  }
  return { vendor };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Id not provided in URL");
  }
  const formData = await request.formData();
  const vendorData = getVendorFormData(formData);

  const validationResult = vendorSchema.safeParse(vendorData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const vendor = await updateVendor({
    vendor_id: id,
    ...validationResult.data,
  });

  throw replace(`/vendors/${vendor.vendor_id}`);
}

export default function Update_Vendor() {
  const { vendor } = useLoaderData<{ vendor: Vendor }>();
  const actionData = useActionData<{ errors: VendorErrors }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Vendor_Form vendor={vendor} errorMessages={actionData?.errors} />
    </div>
  );
}
