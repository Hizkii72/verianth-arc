import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export function usePersonal(kind) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => api.get(`/personal/${kind}`).then(r => setItems(r.data)).finally(() => setLoading(false)), [kind]);
  useEffect(() => { load(); }, [load]);
  const create = async (data) => { const r = await api.post(`/personal/${kind}`, { data }); await load(); return r.data; };
  const update = async (id, data) => { await api.put(`/personal/${kind}/${id}`, { data }); await load(); };
  const remove = async (id) => { await api.delete(`/personal/${kind}/${id}`); await load(); };
  return { items, loading, create, update, remove };
}

export const today = () => new Date().toISOString().slice(0, 10);
