import { useRef } from "react";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form, replace, useActionData, useNavigate, useOutletContext, useSubmit } from "@remix-run/react";
import { findClientByMobile } from "~/utils/client/db.server";
import { ProductSaleRecordCreateFormType } from "~/utils/productSaleRecord/types";
import { findVendorByMobileNumber } from "~/utils/vendors/db.server";
export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const mobile_num = formData.get("mobile_num")?.toString() || "";
    if (!mobile_num) {
      return { msg: "No mobile number received" };
    }
    const transaction_type = formData.get("transaction_type")?.toString() || "";
    if(transaction_type === ""){
      throw new Error("Transaction type is required");
    }

      //fetch vendor if transaction type is bought
    if(transaction_type === "bought"){
        const vendor = await findVendorByMobileNumber(mobile_num);
        if (!vendor) {
          return { error: `No vendor with mobile number: ${mobile_num} found` };
        }
    }else{
        //fetch client if transaction type is not bought
        const client = await findClientByMobile(mobile_num);
        if (!client) {
          return { error: `No client with mobile number: ${mobile_num} found` };
        }
    }
    
    // Redirect to the next part of the process
    const searchParams = new URLSearchParams({ mobile_num, transaction_type });
    throw replace(`../part3?${searchParams.toString()}`);
    
  }


export default function Product_Sale_Record_Create_Part2() {
  const { formData, setFormData } = useOutletContext<{
    formData: ProductSaleRecordCreateFormType;
    setFormData: React.Dispatch<React.SetStateAction<ProductSaleRecordCreateFormType>>;
  }>();
  const submit = useSubmit()
  const navigate = useNavigate()
  const actionData = useActionData<{ error: string }>();
  const {transaction_type } = formData;
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const mobile_num = formData.get("mobile_num")?.toString() || "";
    setFormData((prev) => ({ ...prev, mobile_num: mobile_num }));
    submit(form);
  }

  const GoToPrevPage = () => {
    const form = formRef.current;
    if (!form) return;

    const pageFormData = new FormData(form);

    // Get references to deals and services
    const mobile_num = pageFormData.get("mobile_num")?.toString() || "";
   

    // Update form data state
    setFormData((prev) => ({ ...prev, mobile_num }));

    // Navigate to the previous page
    navigate("/products-sale-record/create");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Form
        method="post"
        onSubmit={handleSubmit}
        ref={formRef}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <input type="hidden" name="transaction_type" value={transaction_type} />
        <label
          htmlFor="mobile_num"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
         {` Enter ${transaction_type === "bought"? "Vendor"  :"Client" } Mobile Number`}
        </label>
        <input
          type="text"
          id="mobile_num"
          name="mobile_num"
          pattern="^0[0-9]{10}$"
          placeholder="03334290689"
          defaultValue={formData.mobile_num}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          required
        />
        {actionData ? (
          <div className="text-red-700">{actionData.error}</div>
        ) : undefined}
       <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={GoToPrevPage}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </Form>
    </div>
  );
}
