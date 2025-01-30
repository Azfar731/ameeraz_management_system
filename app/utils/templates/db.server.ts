import { Header_type } from "@prisma/client";
import { prisma_client } from "~/.server/db";

const getAllTemplates = async () => {
    return await prisma_client.template.findMany({include: {variables: true}});
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
    });
};

const getTemplateByName = async (name: string) => {
    return await prisma_client.template.findFirst({
        where: {
            name,
        },
    });
};

const getTemplateById = async (id: string) => {
    return await prisma_client.template.findUnique({
        where: {
            id,
        },
    });
};

export {
    getAllTemplates,
    getTemplatesByHeaderType,
    getTemplateById,
    getTemplateByName,
};
