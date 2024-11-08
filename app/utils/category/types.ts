import { Prisma } from "@prisma/client";

type CategoryWithServices = Prisma.CategoryGetPayload<{
    include: {
        services: true;
    };
}>;

type CategoryErrors = {
    cat_name?: string[];
};


type FormValues = {
    [key: string]: string | string[];
  };

export type { CategoryErrors, CategoryWithServices, FormValues };
