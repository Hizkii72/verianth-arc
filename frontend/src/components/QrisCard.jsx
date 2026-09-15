import { useEffect, useRef, useState } from "react";
import { QrCode, Upload, Download, Trash2, Maximize2 } from "lucide-react";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";

export default function QrisCard({ manageable = false }) {
  const { t } = useApp();
  const [qris, setQris] = useState("");
  const [note, setNote] = useState("");
  const [zoom, setZoom] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get("/qris");
      setQris(data.qris || "");
      setNote(data.qris_note || "");
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return toast.error("Maks 2MB");
    const r = new FileReader();
    r.onload = async () => {
      await api.put("/qris", { qris: r.result });
      setQris(r.result);
      toast.success(t("qris.saved"));
    };
    r.readAsDataURL(f);
  };

  const saveNote = async () => {
    await api.put("/qris", { qris_note: note });
    toast.success(t("qris.saved"));
  };

  const remove = async () => {
    await api.put("/qris", { qris: "" });
    setQris("");
    toast.success(t("qris.saved"));
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = qris;
    a.download = "qris-verianth.png";
    a.click();
  };

  return (
    <div className="rounded-2xl border bg-card p-5" data-testid="qris-card">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><QrCode size={16} className="text-[#2cc0ff]" /> {t("qris.title")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{note || t("qris.sub")}</p>
        </div>
        {manageable && (
          <div className="flex items-center gap-2">
            <button onClick={() => fileRef.current?.click()} data-testid="qris-upload-btn" className="aqua-btn rounded-xl px-3 py-1.5 text-xs flex items-center gap-1.5">
              <Upload size={13} /> {qris ? t("qris.replace") : t("qris.upload")}
            </button>
            {qris && <button onClick={remove} data-testid="qris-remove-btn" className="p-2 rounded-lg hover:bg-secondary text-rose-500"><Trash2 size={14} /></button>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
        )}
      </div>

      <div className="mt-4">
        {qris ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button onClick={() => setZoom(true)} data-testid="qris-zoom-btn" className="relative group rounded-2xl overflow-hidden border bg-white p-2">
              <img src={qris} alt="QRIS" className="w-44 h-44 object-contain" data-testid="qris-image" />
              <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Maximize2 size={20} /></span>
            </button>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button onClick={download} data-testid="qris-download-btn" className="rounded-xl border px-4 py-2 text-xs flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
                <Download size={14} /> {t("common.download")}
              </button>
              {manageable && (
                <div className="flex gap-2">
                  <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("qris.noteLabel")} className="h-9 text-xs" data-testid="qris-note-input" />
                  <button onClick={saveNote} data-testid="qris-note-save" className="rounded-xl border px-3 text-xs hover:bg-secondary">{t("common.save")}</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-36 rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground" data-testid="qris-empty">{t("qris.empty")}</div>
        )}
      </div>

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-md">
          <div className="bg-white rounded-xl p-4 flex items-center justify-center">
            <img src={qris} alt="QRIS" className="w-full object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
