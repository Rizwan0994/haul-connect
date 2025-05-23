import axios from "axios";

// const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const backendApiClient = axios.create({
  baseURL: "https://haul-connect.onrender.com/api",
  withCredentials: true,
});

backendApiClient.interceptors.request.use(
  (config) => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      console.log("Token:", token);
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default backendApiClient;
