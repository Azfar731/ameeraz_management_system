import { Media_Type } from "@prisma/client";
import { prisma_client } from "~/.server/db";

const getAllMedia = async () => {
    return await prisma_client.media.findMany();
};

const getMediaFromName = async (name: string) => {
    return await prisma_client.media.findFirst({ where: { name } });
};

const createMedia = async (data: {
    name: string;
    id: string;
    type: Media_Type;
}) => {
    return await prisma_client.media.create({
        data,
    });
};

const deleteMedia = async(id: string) => {
    return await prisma_client.media.delete({where: {id}});
}

export { createMedia, getAllMedia , getMediaFromName, deleteMedia};
