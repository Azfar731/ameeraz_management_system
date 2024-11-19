import { Product } from "@prisma/client";

function getProductOptions(products: Product[]) {
    return products.map((product) => {
        return {
            value: product.prod_id,
            label: product.prod_name,
        };
    });
}


export { getProductOptions}


  
