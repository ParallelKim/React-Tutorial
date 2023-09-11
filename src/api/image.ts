import { storage } from "./fb/storage";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const handleImageUpload = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, `images/${path}`);
    uploadBytesResumable(storageRef, file);
    const urls = await getDownloadURL(storageRef);

    console.log("image successfully uploaded");
    return urls;
  } catch (err) {
    console.error("error occured while uploading image", err);
    return null;
  }
};
