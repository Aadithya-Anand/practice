"use client";

import { Input } from "@/components/ui/input";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function LocationInput({ label, value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400">{label}</p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label}`}
        className="bg-zinc-800 text-white border-zinc-700"
      />
    </div>
  );
}
