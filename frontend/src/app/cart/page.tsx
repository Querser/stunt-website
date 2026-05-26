"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Minus, Plus, Trash2 } from "lucide-react";

import { api } from "../../lib/api";
import { formatPhone, formatPrice } from "../../lib/format";
import { submitPaymentForm } from "../../lib/payments";
import { useCartStore } from "../../store/useCartStore";
import { Field, SelectInput, TextArea, TextInput } from "../../components/ui/FormControls";

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

function getKindLabel(kind: string) {
  if (kind === "part") return "Запчасть";
  if (kind === "pitbike") return "Питбайк";
  return "Конфиг";
}

export default function CartPage() {
  const { items, removeItem, setQuantity, clearCart, getTotalPrice, getItemsCount } = useCartStore();
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentOptions, setPaymentOptions] = useState(defaultPaymentOptions);

  const total = getTotalPrice();
  const itemsCount = getItemsCount();
  const canSubmit = items.length > 0 && form.name.trim().length > 1 && form.phone.replace(/\D/g, "").length >= 10;

  useEffect(() => {
    api.paymentOptions()
      .then(setPaymentOptions)
      .catch(() => setPaymentOptions(defaultPaymentOptions));
  }, []);

  useEffect(() => {
    if (form.payment_method === "installment" && !paymentOptions.installment_enabled) {
      setForm((prev) => ({ ...prev, payment_method: fallbackPaymentMethod(paymentOptions.paykeeper_enabled) }));
    }
    if (form.payment_method === "paykeeper" && !paymentOptions.paykeeper_enabled) {
      setForm((prev) => ({ ...prev, payment_method: "cash" }));
    }
  }, [form.payment_method, paymentOptions.installment_enabled, paymentOptions.paykeeper_enabled]);

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        subtitle: item.subtitle || null,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.unit_price * item.quantity,
        configuration: {
          ...item.configuration,
          quantity: item.quantity,
        },
      })),
    [items],
  );

  const submitCart = async (event: React.FormEvent) => {
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
        total_price: total,
        configuration: {
          order_type: "cart",
          items_count: itemsCount,
          cart_items: orderItems,
        },
      });
      if (submitPaymentForm(result.payment_form)) {
        clearCart();
        setForm(emptyForm);
        return;
      }
      if (result.payment_url) {
        clearCart();
        setForm(emptyForm);
        window.location.assign(result.payment_url);
        return;
      }
      clearCart();
      setForm(emptyForm);
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не получилось создать заказ. Проверь форму и попробуй еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-28 text-white sm:px-6 md:px-12 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#16d8ff] sm:text-xs sm:tracking-[0.38em]">
              <span className="h-px w-10 bg-[#16d8ff]" />
              Checkout
            </div>
            <h1 className="st-display pr-[0.22em] text-[clamp(2.9rem,6.3vw,5.9rem)] font-black uppercase italic leading-[0.9] text-white">
              Корзина <span className="text-[#16d8ff]">сборки</span>
            </h1>
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/35">{itemsCount} позиций</div>
        </div>

        {isSuccess && (
          <div className="mt-8 flex items-center gap-4 border border-[#16d8ff]/35 bg-[#16d8ff]/10 p-5 text-[#16d8ff]">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <div>
              <div className="font-black uppercase">Заявка создана</div>
              <p className="mt-1 text-sm text-white/55">Она уже лежит в админке вместе со всем составом корзины.</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 border border-red-500/35 bg-red-500/10 p-5 font-mono text-xs font-black uppercase tracking-[0.16em] text-red-200">
            {errorMessage}
          </div>
        )}

        {items.length === 0 ? (
          <section className="mt-10 grid min-h-[420px] place-items-center border border-white/10 bg-[#0b0b0b] p-8 text-center">
            <div>
              <div className="font-mono text-xs font-black uppercase tracking-[0.35em] text-white/35">Cart is empty</div>
              <h1 className="st-display mt-5 text-[2.6rem] font-black uppercase italic sm:text-6xl">
                Пока <span className="text-[#ff00e6]">пусто</span>
              </h1>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/configurator" className="bg-[#16d8ff] px-7 py-4 font-black uppercase tracking-[0.18em] text-black">
                  Собрать байк
                </Link>
                <Link href="/parts" className="border border-white/15 px-7 py-4 font-black uppercase tracking-[0.18em] text-white/70 hover:border-[#ff00e6] hover:text-white">
                  Запчасти
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_560px] 2xl:grid-cols-[minmax(0,1fr)_620px]">
            <section className="grid content-start gap-4">
              {items.map((item) => (
                <article key={item.id} className="grid min-h-0 gap-4 border border-white/10 bg-[#0b0b0b] p-4 sm:p-5 md:grid-cols-[128px_minmax(0,1fr)_112px] md:items-center">
                  <div className="aspect-[4/3] overflow-hidden bg-black">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover opacity-80" />
                    ) : (
                      <div className="grid h-full place-items-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">Stunt</div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 inline-flex border border-[#16d8ff]/30 px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-[#16d8ff]">
                      {getKindLabel(item.kind)}
                    </div>
                    <h2 className="text-xl font-black uppercase italic leading-tight text-white md:text-2xl">{item.title}</h2>
                    {item.subtitle && <p className="mt-2 text-sm leading-6 text-white/45">{item.subtitle}</p>}
                    <div className="mt-3 whitespace-nowrap font-mono text-xl font-black text-[#16d8ff]">{formatPrice(item.unit_price)}</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center">
                    {item.kind === "part" ? (
                      <div className="flex items-center border border-white/10">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          className="grid h-11 w-11 place-items-center text-white/55 hover:text-white"
                          aria-label="Уменьшить количество"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="grid h-11 min-w-12 place-items-center border-x border-white/10 font-mono font-black">{item.quantity}</div>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          className="grid h-11 w-11 place-items-center text-white/55 hover:text-white"
                          aria-label="Увеличить количество"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="font-mono text-xs uppercase tracking-[0.24em] text-white/35">1 шт.</div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="grid h-11 w-11 place-items-center border border-white/10 text-white/45 hover:border-red-500 hover:text-red-400"
                      aria-label="Удалить из корзины"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <form noValidate onSubmit={submitCart} className="h-fit border border-white/10 bg-[#0b0b0b] p-5 sm:p-6 xl:sticky xl:top-28 2xl:p-7">
              <div className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#16d8ff]">Итого</div>
              <div className="mt-3 whitespace-nowrap text-[2.2rem] font-black leading-none text-[#16d8ff] sm:text-4xl">{formatPrice(total)}</div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <Field label="Имя">
                  <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Как звать?" className="px-4 py-3 text-xs" />
                </Field>
                <Field label="Телефон">
                  <TextInput value={form.phone} onChange={(event) => setForm({ ...form, phone: formatPhone(event.target.value) })} placeholder="+7 (999) 000-00-00" className="px-4 py-3 text-xs" />
                </Field>
                <Field label="Telegram / WhatsApp">
                  <TextInput value={form.telegram} onChange={(event) => setForm({ ...form, telegram: event.target.value })} placeholder="@username" className="px-4 py-3 text-xs" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2 xl:grid-cols-2">
                  <Field label="Связь">
                    <SelectInput value={form.contact_method} onChange={(event) => setForm({ ...form, contact_method: event.target.value })} className="px-4 py-3 text-xs">
                      <option value="telegram">Telegram</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="phone">Звонок</option>
                    </SelectInput>
                  </Field>
                  <Field label="Оплата">
                    <SelectInput value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value })} className="px-4 py-3 text-xs">
                      {paymentOptions.paykeeper_enabled && <option value="paykeeper">PayKeeper</option>}
                      {paymentOptions.installment_enabled && <option value="installment">Рассрочка</option>}
                      <option value="cash">Наличные</option>
                    </SelectInput>
                  </Field>
                </div>
                <Field label="Комментарий" className="xl:col-span-2">
                  <TextArea rows={3} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder="Доставка, сроки, вопросы по сборке" className="px-4 py-3 text-xs" />
                </Field>
              </div>

              <button
                disabled={!canSubmit || isSubmitting}
                className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[6px_6px_0_#16d8ff] disabled:opacity-45 sm:text-base"
              >
                {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {form.payment_method === "paykeeper" ? "Перейти к оплате" : form.payment_method === "installment" ? "Перейти к рассрочке" : "Отправить заявку"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
