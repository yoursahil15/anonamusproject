import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.endsWith("/api")
    ? configuredApiUrl
    : `${configuredApiUrl}/api`
  : "/api";

const API = axios.create({
  // Use Vite's same-origin proxy during development. Set VITE_API_URL for
  // deployments where the API is hosted separately.
  baseURL: apiBaseUrl,
});

API.interceptors.request.use(

  (config) => {

    const token =
      localStorage.getItem("token");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  }

);

export default API;
