import { Vendor } from "@prisma/client";
import { prisma_client } from "~/.server/db";

// Function to get all vendors
const getAllVendors = async () => {
    return await prisma_client.vendor.findMany();
};

const fetchVendors = async ({
    vendor_fname,
    vendor_lname,
    vendor_mobile_num,
}: {
    vendor_mobile_num?: string | undefined;
    vendor_fname?: string | undefined;
    vendor_lname?: string | undefined;
}) => {
    if (vendor_mobile_num) {
        const vendor = await prisma_client.vendor.findFirst({
            where: {
                vendor_mobile_num,
            },
        });

        return vendor ? [vendor] : [];
    } else {
        const vendors = await prisma_client.vendor.findMany({
            where: {
                vendor_fname: vendor_fname?.toLowerCase(),
                vendor_lname: vendor_lname?.toLowerCase(),
            },
        });

        return vendors;
    }
};

// Function to get a vendor by ID with optional related records
const getVendorFromId = async (
    { id, includeRelations = false }: {
        id: string;
        includeRelations?: boolean;
    },
) => {
    return await prisma_client.vendor.findFirst({
        where: { vendor_id: id },
        include: {
            records: includeRelations,
        },
    });
};

// Function to create a new vendor
const createVendor = async (
    { vendor_fname, vendor_lname, vendor_mobile_num }: Omit<
        Vendor,
        "vendor_id" | "created_at"
    >,
) => {
    return await prisma_client.vendor.create({
        data: {
            vendor_fname: vendor_fname.toLowerCase(),
            vendor_lname: vendor_lname.toLowerCase(),
            vendor_mobile_num,
        },
    });
};

// Function to update an existing vendor
const updateVendor = async (
    { vendor_id, vendor_fname, vendor_lname, vendor_mobile_num }: Omit<Vendor, "created_at">,
) => {
    return await prisma_client.vendor.update({
        where: { vendor_id },
        data: {
            vendor_fname: vendor_fname.toLowerCase(),
            vendor_lname: vendor_lname.toLowerCase(),
            vendor_mobile_num,
        },
    });
};

// Function to delete a vendor by ID
const deleteVendor = async ({ vendor_id }: { vendor_id: string }) => {
    return await prisma_client.vendor.delete({
        where: { vendor_id },
    });
};

const findVendorByMobileNumber = async (mobile_num: string) => {
    return await prisma_client.vendor.findFirst({
        where: { vendor_mobile_num: mobile_num },
    });
};

export {
    createVendor,
    deleteVendor,
    fetchVendors,
    findVendorByMobileNumber,
    getAllVendors,
    getVendorFromId,
    updateVendor,
};
