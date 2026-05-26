import { API_URL } from "./config";
import type { Accessory, Bike, GraphicOption, OrderPayload, OrderResponse, Part, PaymentOptions, PaymentStatus } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    let message = `API error ${response.status}: ${path}`;
    try {
      const payload = await response.json();
      if (typeof payload?.detail === "string") message = payload.detail;
    } catch {
      // Keep the HTTP fallback when backend does not return JSON.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const api = {
  bikes: () => request<Bike[]>("/bikes"),
  bigBikes: () => request<Bike[]>("/bikes?bike_type=BIG_BIKE"),
  bike: (id: string | number) => request<Bike>(`/bikes/${id}`),
  graphics: (frameTypeId: number) => request<GraphicOption[]>(`/graphics/${frameTypeId}`),
  accessories: () => request<Accessory[]>("/accessories"),
  parts: () => request<Part[]>("/parts"),
  paymentOptions: () => request<PaymentOptions>("/payments/options"),
  paymentStatus: (orderId: string | number) => request<PaymentStatus>(`/orders/${orderId}/payment-status`),
  createOrder: (payload: OrderPayload) =>
    request<OrderResponse>("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
};
