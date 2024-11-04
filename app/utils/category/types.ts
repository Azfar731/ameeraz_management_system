import { Prisma, Category } from "@prisma/client";
import {  } from "@prisma/client";



type CategoryWithServices = Prisma.CategoryGetPayload<{
    include: {
      services: true;
    };
  }>;

  
type CategoryErrors = {
    cat_name?: string[];
    
};



export type {CategoryWithServices, CategoryErrors}