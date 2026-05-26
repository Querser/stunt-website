import type { PaymentFormResponse } from "./types";

export function submitPaymentForm(paymentForm?: PaymentFormResponse | null) {
  if (!paymentForm?.action_url || !paymentForm.fields) return false;

  const form = document.createElement("form");
  form.method = paymentForm.method || "POST";
  form.action = paymentForm.action_url;
  form.acceptCharset = "utf-8";
  form.style.display = "none";

  Object.entries(paymentForm.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  return true;
}
