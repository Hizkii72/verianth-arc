import axios from "axios";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const api = axios.create({ baseURL: API, withCredentials: true });

export const formatRupiah = (n) => "Rp" + (Number(n) || 0).toLocaleString("id-ID");
export const parseRupiah = (s) => Number(String(s).replace(/[^0-9]/g, "")) || 0;
export const fmtDate = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};
