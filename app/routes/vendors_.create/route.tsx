import { ActionFunctionArgs } from "@remix-run/node";
import { replace, useActionData } from "@remix-run/react";
import Vendor_Form from "~/components/vendors/Vendor_Form";
import { createVendor } from "~/utils/vendors/db.server";
import { getVendorFormData } from "~/utils/vendors/functions.server";
import { VendorErrors } from "~/utils/vendors/types";
import { vendorSchema } from "~/utils/vendors/validations.server";
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const vendorData = getVendorFormData(formData);

  const validationResult = vendorSchema.safeParse(vendorData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const vendor = await createVendor(validationResult.data);

  throw replace(`/vendors/${vendor.vendor_id}`);
}

export default function Create_Vendor() {
  const actionData = useActionData<{ errors: VendorErrors }>();

  return (
    <div className="flex justify-center items-center h-screen">
      <Vendor_Form errorMessages={actionData?.errors} />
    </div>
  );
}
