const cloudName = "etlhamgl";
const uploadPreset = "insta_presetbackend";

export async function uploadPostImage(file) {
  if (!file) return null;

  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    data.append("folder", "posts");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: data
    });

    const result = await res.json();
    return result.secure_url;
  } catch (err) {
    console.log("error uploading post image:", err);
    return null;
  }
}

export async function uploadProfilePicture(file) {
  if (!file) return null;

  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    data.append("folder", "profile_pictures");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: data
    });

    const result = await res.json();
    return result.secure_url;
  } catch (err) {
    console.log("error uploading profile pic:", err);
    return null;
  }
}
