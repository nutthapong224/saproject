import axios from "axios";
const API_URL = "https://saproject.onrender.com/api-v1/";

export const API = axios.create({
  baseURL: API_URL,
  responseType: "json",
});

export const apiRequest = async ({ url, token, data, method }) => {
  try {
    const result = await API(url, {
      method: method || "GET",
      data: data,
      headers: {
        "content-type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return result.data; // Ensure the response data is returned
  } catch (error) {
    console.log(error);
    return { status: "failed", message: error.message }; // Return error details
  }
};

export const handleFileUpload = async (uploadFile) => {
  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("upload_preset", "jobfinder");

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dnohgikvp/image/upload",
      formData
    );
    return response.data.secure_url; // Return the URL of the uploaded image
  } catch (error) {
    console.log(error);
    throw new Error("Image upload failed");
  }
};

export const updateURL = ({
  pageNum,
  query,
  cmpLoc,
  sort,
  navigate,
  location,
  jobType,
  exp,
}) => {
  const params = new URLSearchParams();

  if (pageNum && pageNum > 1) {
    params.set("page", pageNum);
  }
  if (query) {
    params.set("search", query);
  }
  if (cmpLoc) {
    params.set("location", cmpLoc);
  }
  if (sort) {
    params.set("sort", sort);
  }
  if (jobType) {
    params.set("jobType", jobType);
  }
  if (exp) {
    params.set("exp", exp);
  }

  const newURL = `${location.pathname}?${params.toString()}`;
  navigate(newURL, { replace: true });
  return newURL;
};
