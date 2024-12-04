import { LoaderFunctionArgs } from "@remix-run/node";




export async function loader({request}: LoaderFunctionArgs){
    const searchParams = new URL(request.url).searchParams;
    const formValues = fetchFormValues(searchParams)
    console.log("Filtered Search Params: ", formValues);

}

const fetchFormValues = (searchParams: URLSearchParams) => {
    
    for (const [key, value] of searchParams.entries()) {
        if (value === "") {
          searchParams.delete(key);
        }
      }
    
    const formValues = {
        start_date: searchParams.get("start_date"),
        end_date: searchParams.get("end_date"),
        client_mobile_num: searchParams.get("client_mobile_num"),
        vendor_mobile_num: searchParams.get("vendor_mobile_num"),
        transaction_types: searchParams.getAll("transaction_types"),
        products: searchParams.getAll("products"),
        payment_options: searchParams.getAll("payment_options"),
        isClient: searchParams.get("isClient"),
    };
    return formValues;
}