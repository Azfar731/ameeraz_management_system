import { Prisma } from "@prisma/client";



type TemplateWithRelations = Prisma.TemplateGetPayload<{
    include: {
        variables: true;
    }
}>


export type { TemplateWithRelations}