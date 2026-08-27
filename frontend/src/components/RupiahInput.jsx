import { Input } from "./ui/input";
import { parseRupiah } from "../lib/api";

export function RupiahInput({ value, onChange, ...props }) {
  const display = value ? "Rp" + Number(value).toLocaleString("id-ID") : "";
  return (
    <Input
      {...props}
      value={display}
      onChange={(e) => onChange(parseRupiah(e.target.value))}
      placeholder={props.placeholder || "Rp0"}
      inputMode="numeric"
    />
  );
}
