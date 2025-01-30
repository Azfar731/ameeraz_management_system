import { Prisma } from "@prisma/client";



type TemplateWithRelations = Prisma.TemplateGetPayload<{
    include: {
        variables: true;
    }
}>

type TemplateErrorMessages = {
    name: string[];
    header_type: string[];
    header_variable_name: string[];
    header_var_name: string[];
    variables: string[];
}


export type { TemplateWithRelations, TemplateErrorMessages}