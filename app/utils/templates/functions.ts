import { Header_type } from "@prisma/client";


const getAllHeaderTypeMenuOptions = () => {
    return [
        {value: "none", label: "None"},
        {value: "image", label: "Image"},
        {value: "text", label: "Text"},
        {value: "video", label: "Video"},
    ]
} 

const getSingleHeaderTypeMenuOption = (header_type: Header_type) => {
    switch (header_type) {
        case "none":
            return {value: "none", label: "None"};
        case "image":
            return {value: "image", label: "Image"};
        case "text":
            return {value: "text", label: "Text"};
        case "video":
            return {value: "video", label: "Video"};
        default:
            throw new Error(
                `Unsupported Header Type: ${header_type} passed to function`
            );
    }
}


export {getAllHeaderTypeMenuOptions, getSingleHeaderTypeMenuOption}