import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ActionFunctionArgs } from "@remix-run/node";
import { replace, useActionData } from "@remix-run/react";
import Vendor_Form from "~/components/vendors/Vendor_Form";
import { authenticate } from "~/utils/auth/functions.server";
import { createVendor } from "~/utils/vendors/db.server";
import { getVendorFormData } from "~/utils/vendors/functions.server";
import { VendorErrors } from "~/utils/vendors/types";
import { vendorSchema } from "~/utils/vendors/validations.server";
export async function action({ request }: ActionFunctionArgs) {

  await authenticate({request, requiredClearanceLevel: 2 });
  const formData = await request.formData();
  const vendorData = getVendorFormData(formData);

  const validationResult = vendorSchema.safeParse(vendorData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  try {
    const vendor = await createVendor(validationResult.data);
    throw replace(`/vendors/${vendor.vendor_id}`);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errors: {
            vendor_mobile_num: [
              `Vendor with mobile number: ${validationResult.data.vendor_mobile_num} already exists`,
            ],
          },
        };
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}

export default function Create_Vendor() {
  const actionData = useActionData<{ errors: VendorErrors }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Vendor_Form errorMessages={actionData?.errors} />
    </div>
  );
}
