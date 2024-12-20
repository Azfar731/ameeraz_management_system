import { prisma_client } from "~/.server/db";
import argon2 from "argon2";
import { Role } from "@prisma/client";
import { getClearanceLevel } from "../auth/functions.server";
const createUser = async (
    {
        userName,
        password,
        fname,
        lname,
        role,
    }: {
        userName: string;
        password: string;
        fname: string;
        lname: string;
        role: Role;
    },
) => {
    // Hash the password using argon2
    const hashedPassword = await argon2.hash(password);

    // Create the user in the database
    return prisma_client.user.create({
        data: {
            userName,
            password: hashedPassword,
            role,
            fname,
            lname,
            clearance_level: getClearanceLevel(role),
        },
    });
};

const updateUser = async (
    { id, updates }: {
        id: string;
        updates: {
            userName?: string;
            password?: string;
            fname?: string;
            lname?: string;
        };
    },
) => {
    const updateData = { ...updates };

    // If a new password is provided, hash it before updating
    if (updates.password) {
        updateData.password = await argon2.hash(updates.password);
    }

    // Update the user in the database
    return prisma_client.user.update({
        where: { id },
        data: updateData,
    });
};

const getAllUsers = async () => {
    return prisma_client.user.findMany();
};

const getUserFromId = async (id: string) => {
    return prisma_client.user.findFirst({ where: { id } });
};

const getUserFromUserName = async (userName: string) => {
    return prisma_client.user.findFirst({ where: { userName } });
};

export {
    createUser,
    getAllUsers,
    getUserFromId,
    getUserFromUserName,
    updateUser,
};
