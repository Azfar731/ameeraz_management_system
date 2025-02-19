
import FormData from "form-data";
import fs from "fs";
import axios from "axios";
async function upload_media({filePath, type}:{filePath: string, type: string}) {
    // const tmpPath = path.join("/tmp", filePath.name);
    // const buffer = await filePath.arrayBuffer();
    // await fs.promises.writeFile(tmpPath, Buffer.from(buffer));

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
                error.response.data,
            );
        } else {
            console.error("Upload Error:", error);
        }
        throw new Error("Upload failed");
    } finally {
        fs.unlink(filePath, () => {}); // Delete temp file after upload
    }
}

export { upload_media };
