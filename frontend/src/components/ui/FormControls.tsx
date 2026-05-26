import type { ReactNode } from "react";

const fieldClass =
  "w-full border border-white/10 bg-[#101010] px-5 py-4 font-mono text-sm uppercase tracking-widest text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#16d8ff]";

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.35em] text-white/45">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className || ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} resize-none ${props.className || ""}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClass} ${props.className || ""}`} />;
}
