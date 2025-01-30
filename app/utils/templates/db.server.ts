import { Header_type, WP_Variable_Type } from "@prisma/client";
import { prisma_client } from "~/.server/db";

const getAllTemplates = async () => {
    return await prisma_client.template.findMany({
        include: { variables: true },
    });
};

const getTemplatesByHeaderType = async ({
    header_type,
}: {
    header_type: Header_type;
}) => {
    return await prisma_client.template.findMany({
        where: {
            header_type,
        },
        include: { variables: true },
    });
};

const getTemplateByName = async (name: string) => {
    return await prisma_client.template.findFirst({
        where: {
            name,
        },
        include: { variables: true },
    });
};

const getTemplateById = async (id: string) => {
    return await prisma_client.template.findUnique({
        where: {
            id,
        },
        include: { variables: true },
    });
};

const createTemplate = async (
    { name, header_type, header_var_name, variables }: {
        name: string;
        header_type: Header_type;
        header_var_name: string;
        variables?: { name: string; type: WP_Variable_Type }[];
    },
) => {
    const template = await prisma_client.template.create({
        data: {
            name,
            header_type,
            header_var_name,
            variables: {
                create: variables,
            },
        },
    });

    return template;
};

const updateTemplate = async (
    { id, name, header_type, header_var_name, variables }: {
        id: string;
        name: string;
        header_type: Header_type;
        header_var_name: string;
        variables?: { name: string; type: WP_Variable_Type }[];
    },
) => {
    return await prisma_client.template.update({
        where: { id },
        data: {
            name,
            header_type,
            header_var_name,
            variables: {
                deleteMany: {},
                create: variables,
            },
        },
    });
};



export {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    getTemplateByName,
    getTemplatesByHeaderType,
    updateTemplate
};
