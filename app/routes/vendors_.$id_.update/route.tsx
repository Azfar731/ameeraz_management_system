import { Prisma, Vendor } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import Vendor_Form from "~/components/vendors/Vendor_Form";
import { authenticate } from "~/utils/auth/functions.server";
import { getVendorFromId, updateVendor } from "~/utils/vendors/db.server";
import { getVendorFormData } from "~/utils/vendors/functions.server";
import { VendorErrors } from "~/utils/vendors/types";
import { vendorSchema } from "~/utils/vendors/validations.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });
  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const vendor = await getVendorFromId({ id });
  if (!vendor) {
    throw new Response(`Vendor with id:${id} not found`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { vendor };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });

  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const formData = await request.formData();
  const vendorData = getVendorFormData(formData);

  const validationResult = vendorSchema.safeParse(vendorData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  try {
    const vendor = await updateVendor({
      vendor_id: id,
      ...validationResult.data,
    });

    throw replace(`/vendors/${vendor.vendor_id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export default function Update_Vendor() {
  const { vendor } = useLoaderData<{ vendor: Vendor }>();
  const actionData = useActionData<{ errors: VendorErrors }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Vendor_Form vendor={vendor} errorMessages={actionData?.errors} />
    </div>
  );
}
