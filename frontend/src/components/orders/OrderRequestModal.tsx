"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import { api } from "../../lib/api";
import { formatPhone, formatPrice } from "../../lib/format";
import { submitPaymentForm } from "../../lib/payments";
import { Field, SelectInput, TextArea, TextInput } from "../ui/FormControls";

type OrderRequestModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  totalPrice: number;
  configuration: Record<string, unknown>;
  submitLabel?: string;
  commentPlaceholder?: string;
  onClose: () => void;
};

const emptyForm = {
  name: "",
  phone: "",
  telegram: "",
  contact_method: "telegram",
  payment_method: "paykeeper",
  comment: "",
};

const defaultPaymentOptions = {
  paykeeper_enabled: true,
  installment_enabled: false,
};

function fallbackPaymentMethod(paykeeperEnabled: boolean) {
  return paykeeperEnabled ? "paykeeper" : "cash";
}

export function OrderRequestModal({
  open,
  title,
  subtitle,
  totalPrice,
  configuration,
  submitLabel = "Отправить заявку",
  commentPlaceholder = "Комментарий к заказу",
  onClose,
}: OrderRequestModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentOptions, setPaymentOptions] = useState(defaultPaymentOptions);

  useEffect(() => {
    if (!open) return;
    api.paymentOptions()
      .then(setPaymentOptions)
      .catch(() => setPaymentOptions(defaultPaymentOptions));
  }, [open]);

  useEffect(() => {
    if (form.payment_method === "installment" && !paymentOptions.installment_enabled) {
      setForm((prev) => ({ ...prev, payment_method: fallbackPaymentMethod(paymentOptions.paykeeper_enabled) }));
    }
    if (form.payment_method === "paykeeper" && !paymentOptions.paykeeper_enabled) {
      setForm((prev) => ({ ...prev, payment_method: "cash" }));
    }
  }, [form.payment_method, paymentOptions.installment_enabled, paymentOptions.paykeeper_enabled]);

  const closeModal = () => {
    setForm(emptyForm);
    setIsSuccess(false);
    setIsSubmitting(false);
    setErrorMessage("");
    onClose();
  };

  if (!open) return null;

  const canSubmit = form.name.trim().length > 1 && form.phone.replace(/\D/g, "").length >= 10;

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const result = await api.createOrder({
        customer_name: form.name,
        phone: form.phone,
        telegram: form.telegram,
        contact_method: form.contact_method,
        payment_method: form.payment_method,
        comment: form.comment,
        total_price: totalPrice,
        configuration,
      });
      if (submitPaymentForm(result.payment_form)) {
        return;
      }
      if (result.payment_url) {
        window.location.assign(result.payment_url);
        return;
      }
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не получилось создать заказ. Проверь форму и попробуй еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/82 p-4 text-white backdrop-blur-sm">
      <div className="relative w-full max-w-2xl border border-white/10 bg-[#080808] p-5 shadow-[0_0_60px_rgba(0,0,0,0.75)] sm:p-7">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center border border-white/10 text-white/55 transition-colors hover:border-[#ff00e6] hover:text-white"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center">
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#16d8ff] sm:text-xs">
              Request accepted
            </div>
            <h2 className="st-display mt-5 text-[2.6rem] font-black uppercase italic sm:text-6xl">
              Заявка <span className="text-[#ff00e6]">создана</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md leading-7 text-white/55">
              Она уже лежит в админке. Менеджер увидит состав и свяжется с клиентом.
            </p>
            <button
              type="button"
              onClick={closeModal}
              className="mt-8 bg-white px-7 py-4 font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_#16d8ff]"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={submitOrder}>
            <div className="pr-12">
              <div className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#16d8ff] sm:text-xs">
                One click request
              </div>
              <h2 className="mt-4 text-3xl font-black uppercase italic leading-tight sm:text-5xl">{title}</h2>
              {subtitle && <p className="mt-4 leading-7 text-white/50">{subtitle}</p>}
              <div className="mt-5 whitespace-nowrap font-mono text-2xl font-black text-[#16d8ff] sm:text-3xl">
                {formatPrice(totalPrice)}
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              {errorMessage && (
                <div className="border border-red-500/35 bg-red-500/10 p-4 font-mono text-xs font-black uppercase tracking-[0.16em] text-red-200">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Имя">
                  <TextInput required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Как звать?" />
                </Field>
                <Field label="Телефон">
                  <TextInput required value={form.phone} onChange={(event) => setForm({ ...form, phone: formatPhone(event.target.value) })} placeholder="+7 (999) 000-00-00" />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Telegram / WhatsApp">
                  <TextInput value={form.telegram} onChange={(event) => setForm({ ...form, telegram: event.target.value })} placeholder="@username" />
                </Field>
                <Field label="Способ связи">
                  <SelectInput value={form.contact_method} onChange={(event) => setForm({ ...form, contact_method: event.target.value })}>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Звонок</option>
                  </SelectInput>
                </Field>
              </div>

              <Field label="Способ оплаты">
                <SelectInput value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value })}>
                  {paymentOptions.paykeeper_enabled && <option value="paykeeper">PayKeeper</option>}
                  {paymentOptions.installment_enabled && <option value="installment">Рассрочка</option>}
                  <option value="cash">Наличные</option>
                </SelectInput>
              </Field>

              <Field label="Комментарий">
                <TextArea rows={4} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder={commentPlaceholder} />
              </Field>
            </div>

            <button
              disabled={!canSubmit || isSubmitting}
              className="mt-8 flex min-h-14 w-full items-center justify-center gap-3 bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[6px_6px_0_#16d8ff] disabled:opacity-45 sm:px-8 sm:py-5 sm:text-base"
            >
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {form.payment_method === "paykeeper" ? "Перейти к оплате" : form.payment_method === "installment" ? "Перейти к рассрочке" : submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
