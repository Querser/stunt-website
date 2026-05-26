"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CircleAlert } from "lucide-react";

import { api } from "../../lib/api";
import type { PaymentStatus } from "../../lib/types";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const result = searchParams.get("result");
  const paymentId = searchParams.get("payment_id") || searchParams.get("id");
  const orderId = searchParams.get("order_id") || searchParams.get("orderid");
  const isInstallment = searchParams.get("installment") === "1";
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    api.paymentStatus(orderId)
      .then((payload) => {
        if (!cancelled) setStatus(payload);
      })
      .catch(() => {
        if (!cancelled) setStatusError("Статус пока не получен");
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const isPaid = status?.is_paid || (!orderId && result === "success");
  const title = isInstallment
    ? <>Рассрочка <span className="text-[#16d8ff]">создана</span></>
    : isPaid
      ? <>Оплата <span className="text-[#16d8ff]">подтверждена</span></>
      : <>Платеж <span className="text-[#ff00e6]">проверяется</span></>;

  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-28 text-white sm:px-6 md:px-12 md:pt-36">
      <section className="mx-auto grid min-h-[560px] max-w-[1100px] place-items-center border border-white/10 bg-[#080808] p-6 text-center sm:p-10">
        <div className="max-w-3xl">
          <div className="mx-auto grid h-16 w-16 place-items-center border border-[#16d8ff]/40 text-[#16d8ff]">
            {isPaid || isInstallment ? <CheckCircle2 className="h-8 w-8" /> : <CircleAlert className="h-8 w-8" />}
          </div>

          <div className="mt-8 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-[#16d8ff] sm:text-xs">
            Payment result
          </div>
          <h1 className="st-display mt-5 text-[clamp(3.2rem,9vw,7rem)] font-black uppercase italic leading-[0.9]">
            {title}
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/50 sm:text-lg sm:leading-8">
            {isInstallment
              ? "Заявка создана в базе. Если подключен внешний кабинет Ванта, статус придет через webhook; пока менеджер видит заказ и способ оплаты."
              : isPaid
                ? "Спасибо. Заказ отмечен как оплаченный в системе Stunt Tech."
                : "Заказ создан. Статус оплаты меняется только после серверного подтверждения платежной системы, поэтому редирект клиента сам по себе не ставит оплату."}
          </p>

          {(paymentId || orderId || status) && (
            <div className="mx-auto mt-7 inline-grid gap-2 border border-white/10 px-4 py-3 text-left font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              {orderId && <span>Order / {orderId}</span>}
              {paymentId && <span>Payment / {paymentId}</span>}
              {status && <span>Status / {status.status}</span>}
              {statusError && <span>{statusError}</span>}
            </div>
          )}

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/catalog" className="bg-white px-7 py-4 font-black uppercase tracking-[0.16em] text-black shadow-[6px_6px_0_#16d8ff]">
              Каталог
            </Link>
            <Link href="/garage" className="border border-white/15 px-7 py-4 font-black uppercase tracking-[0.16em] text-white/65 hover:border-[#ff00e6] hover:text-white">
              Связаться
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050505]" />}>
      <PaymentResultContent />
    </Suspense>
  );
}
