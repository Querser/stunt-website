export type BikeType = "PITBIKE" | "BIG_BIKE";

export interface ImageAsset {
  image_url: string;
  is_main?: boolean;
}

export interface PitConfig {
  name: string;
  wheels: string;
  price_add: number;
}

export interface Bike {
  id: number;
  name: string;
  price: number;
  description?: string | null;
  specs?: string | null;
  pit_configs?: PitConfig[] | null;
  bike_type: BikeType;
  has_pts: boolean;
  in_stock: boolean;
  frame_type_id?: number | null;
  images: ImageAsset[];
}

export interface GraphicOption {
  id: number;
  name: string;
  price_add: number;
  image_overlay_url: string;
}

export interface Accessory {
  id: number;
  name: string;
  price: number;
  description?: string | null;
  image_url: string;
  in_stock: boolean;
}

export interface PartCategory {
  id: number;
  name: string;
}

export interface Part {
  id: number;
  category_id: number;
  name: string;
  price: number;
  description?: string | null;
  image_url: string;
  in_stock: boolean;
  category: PartCategory;
  sku?: string | null;
  source?: "woocommerce" | string | null;
  source_url?: string | null;
  stock_text?: string | null;
  gallery_urls?: string[];
}

export interface OrderPayload {
  customer_name: string;
  phone: string;
  telegram?: string;
  contact_method?: string;
  comment?: string;
  payment_method?: string;
  total_price: number;
  configuration: Record<string, unknown>;
}

export interface PaymentFormResponse {
  provider: string;
  action_url: string;
  method: "POST" | "GET" | string;
  fields: Record<string, string>;
}

export interface OrderResponse {
  message: string;
  order_id: number;
  payment_url?: string | null;
  payment_invoice_id?: string | null;
  payment_form?: PaymentFormResponse | null;
}

export interface PaymentStatus {
  order_id: number;
  status: string;
  is_paid: boolean;
  payment_method?: string | null;
  payment_provider?: string | null;
  payment_id?: string | null;
}

export interface PaymentOptions {
  paykeeper_enabled: boolean;
  installment_enabled: boolean;
}

export type CartItemKind = "bike_configurator" | "pitbike" | "part";

export interface CartItem {
  id: string;
  kind: CartItemKind;
  title: string;
  subtitle?: string;
  image_url?: string;
  unit_price: number;
  quantity: number;
  configuration: Record<string, unknown>;
}
