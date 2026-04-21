import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("talent_token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("talent_token");
  }
}

const existing = localStorage.getItem("talent_token");
if (existing) setAuthToken(existing);
