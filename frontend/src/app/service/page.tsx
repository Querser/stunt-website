"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, ShieldAlert, Wrench, Zap } from "lucide-react";
import { API_URL } from "../../lib/config";
import { formatPhone } from "../../lib/format";
import { Field, SelectInput, TextArea, TextInput } from "../../components/ui/FormControls";

export default function ServicePage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    telegram: "",
    contact_method: "telegram",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitServiceRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          phone: form.phone,
          telegram: form.telegram,
          contact_method: form.contact_method,
          comment: form.comment,
          payment_method: "service",
          total_price: 0,
          configuration: { order_type: "service", request: form.comment },
        }),
      });
      if (res.ok) {
        setIsSuccess(true);
        setForm({ name: "", phone: "", telegram: "", contact_method: "telegram", comment: "" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] font-sans text-white selection:bg-[#00D4FF] selection:text-black">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FF00FF]/10 blur-[200px] pointer-events-none" />

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-6 md:px-12 md:pb-28 md:pt-40">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-14 text-center md:mb-24">
          <h1 className="st-display mx-auto mb-5 max-w-[1180px] text-[3rem] font-black uppercase italic sm:text-6xl md:mb-8 md:text-7xl xl:text-[7rem]">
            STUNT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF00FF] to-[#00D4FF] drop-shadow-[0_0_30px_rgba(255,0,255,0.4)]">СЕРВИС</span>
          </h1>
          <p className="mx-auto max-w-2xl font-mono text-sm uppercase leading-7 tracking-[0.16em] text-white/50 sm:text-lg sm:tracking-widest sm:leading-relaxed">
            Обслуживаем, тюнингуем и восстанавливаем байки после жестких раздач. Мы не просто крутим гайки, мы строим стант-пушки.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3 md:gap-8">
          {[
            { icon: <Wrench className="w-12 h-12 text-[#FF00FF] drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]"/>, title: "Тюнинг", desc: "Установка дублеров, бугелей, пег. Настройка подвески под стант." },
            { icon: <Zap className="w-12 h-12 text-[#00D4FF] drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]"/>, title: "Ремонт ДВС", desc: "Капиталка, замена поршневой, настройка клапанов и карбюратора." },
            { icon: <ShieldAlert className="w-12 h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"/>, title: "Жесткое ТО", desc: "Замена масла, колодок, цепей. Полная подготовка к соревам." }
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden border border-white/10 bg-[#0A0A0A] p-6 transition-all duration-500 hover:-translate-y-2 hover:border-[#00D4FF]/50 hover:shadow-[0_0_40px_rgba(0,212,255,0.15)] sm:p-8 lg:p-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] group-hover:bg-[#00D4FF]/20 transition-colors" />
              <div className="mb-6 sm:mb-8">{item.icon}</div>
              <h3 className="mb-4 text-2xl font-black uppercase italic text-white transition-colors group-hover:text-[#00D4FF] sm:text-3xl">{item.title}</h3>
              <p className="font-mono text-xs uppercase leading-6 tracking-[0.16em] text-white/40 sm:text-sm sm:tracking-widest sm:leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <form onSubmit={submitServiceRequest} className="relative mt-16 overflow-hidden border border-[#FF00FF]/30 bg-black p-5 shadow-[0_0_50px_rgba(255,0,255,0.15)] sm:p-8 md:mt-32 md:p-12">
          <div className="absolute inset-0 bg-[#FF00FF]/5 pointer-events-none" />
          <div className="relative z-10 grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
              <h2 className="mb-5 text-3xl font-black uppercase italic text-white md:mb-6 md:text-5xl">Запишись на ремонт</h2>
              <p className="max-w-lg font-mono text-xs uppercase leading-6 tracking-[0.16em] text-white/50 sm:text-sm sm:tracking-widest">
                Опиши проблему, оставь контакт, и механик сориентирует по прайсу и ближайшему окну сервиса.
              </p>
              {isSuccess && (
                <div className="mt-8 border border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF] px-5 py-4 font-mono uppercase tracking-widest text-xs">
                  Заявка принята. Менеджер свяжется с тобой.
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Имя">
                  <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Имя" />
                </Field>
                <Field label="Телефон">
                  <TextInput required value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} placeholder="+7 (999) 000-00-00" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Telegram / WhatsApp">
                  <TextInput value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="@username" />
                </Field>
                <Field label="Способ связи">
                  <SelectInput value={form.contact_method} onChange={(e) => setForm({ ...form, contact_method: e.target.value })}>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Звонок</option>
                  </SelectInput>
                </Field>
              </div>
              <Field label="Комментарий">
                <TextArea required rows={5} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Что случилось с байком?" />
              </Field>
              <button disabled={isSubmitting} className="flex min-h-14 w-full items-center justify-center gap-3 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition-all hover:bg-[#FF00FF] hover:text-white disabled:opacity-50 sm:px-12 sm:py-5 sm:text-base sm:tracking-widest">
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Отправить заявку
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
