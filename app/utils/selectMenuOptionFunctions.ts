import { Product } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";

function getProductOptions(products: SerializeFrom<Product>[]) {
    return products.map((product) => {
        return {
            value: product.prod_id,
            label: product.prod_name,
        };
    });
}


export { getProductOptions}


  
