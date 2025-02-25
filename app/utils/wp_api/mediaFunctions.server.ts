import FormData from "form-data";
import fs from "fs";
import axios from "axios";
async function upload_media(
    { filePath, type }: { filePath: string; type: string },
) {
    const formData = new FormData();
    formData.append("messaging_product", "whatsapp");
    formData.append("file", fs.createReadStream(filePath), {
        contentType: type,
    });

    const config = {
        method: "post",
        url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/media`,
        headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            ...formData.getHeaders(),
        },
        data: formData,
    };

    try {
        const response = await axios(config);
        return response.data.id; // Returns the media_id
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error(
                "Meta API Error:",
                error.response.status,
                
            );
            console.error("Meta API Error Data:", error.response.data);
        } else {
            console.error("Upload Error:", error);
        }
        throw new Error("Upload failed");
    } finally {
        fs.unlink(filePath, () => {}); // Delete temp file after upload
    }
}

async function send_delete_request(id: string) {
    const config = {
        method: "delete",
        url: `https://graph.facebook.com/${process.env.VERSION}/${id}`,
        headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
    };
    try {
        const response = await axios(config);

        console.log("response of delete request", response.data);
        if (response.data.success) {
            return true; // Returns the media_id}
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error(
                "Meta API Error:",
                error.response.data,
            );
        } else {
            console.error("Delete Error:", error);
        }
        return false;
    }
}

export { send_delete_request, upload_media };
