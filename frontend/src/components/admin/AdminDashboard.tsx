"use client";

/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/immutability, react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Trash2, Edit2, X, CheckCircle, XCircle, LogOut, UploadCloud, Loader2, Settings, Send } from "lucide-react";
import { API_URL } from "../../lib/config";

type TabType = "orders" | "bikes" | "parts" | "accessories" | "graphics" | "settings";
type OrderTypeFilter = "all" | "cart" | "bike_configurator" | "pitbike" | "part" | "service";

const orderTypeFilters: { id: OrderTypeFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "cart", label: "Корзины" },
  { id: "bike_configurator", label: "Конфиг" },
  { id: "pitbike", label: "Питбайки" },
  { id: "part", label: "Запчасти" },
  { id: "service", label: "Сервис" },
];

function getOrderType(order: any): Exclude<OrderTypeFilter, "all"> {
  const value = order.configuration?.order_type || order.configuration?.type;
  if (value === "cart" || value === "part" || value === "pitbike" || value === "service" || value === "bike_configurator") return value;
  return "bike_configurator";
}

function getOrderTypeLabel(order: any) {
  const type = getOrderType(order);
  if (type === "cart") return "Корзина";
  if (type === "part") return "Запчасть";
  if (type === "pitbike") return "Питбайк";
  if (type === "service") return "Сервис";
  return "Конфиг";
}

function getOrderTitle(order: any) {
  const configuration = order.configuration || {};
  const type = getOrderType(order);
  if (type === "cart") {
    const count = configuration.cart_items?.length || configuration.items_count || 0;
    return `Корзина / ${count} поз.`;
  }
  if (type === "part") return configuration.item_name || "Запчасть";
  if (type === "service") return "Запись на сервис";
  return configuration.bike || "Техника не указана";
}

function getOrderMeta(order: any): string[] {
  const configuration = order.configuration || {};
  const type = getOrderType(order);

  if (type === "cart") {
    return (configuration.cart_items || [])
      .slice(0, 5)
      .map((item: any) => `${item.title || "Позиция"} x${item.quantity || 1}`) as string[];
  }

  if (type === "part") {
    return [
      configuration.category && `Категория: ${configuration.category}`,
      configuration.quantity && `Кол-во: ${configuration.quantity}`,
    ].filter(Boolean) as string[];
  }

  if (type === "pitbike") {
    return [
      configuration.pit_config && `Комплектация: ${configuration.pit_config}`,
      configuration.wheels && `Колеса: ${configuration.wheels}`,
    ].filter(Boolean) as string[];
  }

  if (type === "service") {
    return [configuration.request && `Запрос: ${configuration.request}`].filter(Boolean) as string[];
  }

  return [
    configuration.graphic && `Графика: ${configuration.graphic}`,
    configuration.accessories?.length > 0 && `Допы: ${configuration.accessories.join(", ")}`,
  ].filter(Boolean) as string[];
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderTypeFilter>("all");

  const [data, setData] = useState<Record<TabType, any[]>>({ orders: [], bikes: [], parts: [], accessories: [], graphics: [], settings: [] });
  const [refs, setRefs] = useState<{ categories: any[], frameTypes: any[] }>({ categories: [], frameTypes: [] });
  const [telegramSettings, setTelegramSettings] = useState({
    recipientsText: "",
    botConfigured: false,
    statusText: "",
    isSaving: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [modal, setModal] = useState<{ isOpen: boolean, type: string, mode: "add" | "edit", item: any }>({
    isOpen: false, type: "", mode: "add", item: null
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchRefs();
      fetchData();
    }
  }, [token, activeTab]);

  const fetchRefs = async () => {
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [catRes, frameRes] = await Promise.all([
        fetch(`${API_URL}/admin/categories`, { headers }),
        fetch(`${API_URL}/admin/frame_types`, { headers })
      ]);
      setRefs({ categories: await catRes.json(), frameTypes: await frameRes.json() });
    } catch (err) { console.error("Ошибка загрузки справочников:", err); }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      if (activeTab === "settings") {
        const res = await fetch(`${API_URL}/admin/settings/telegram`, { headers });
        if (res.status === 401) return handleLogout();
        const result = await res.json();
        setTelegramSettings((prev) => ({
          ...prev,
          recipientsText: (result.recipients || []).join("\n"),
          botConfigured: Boolean(result.bot_configured),
        }));
        setIsLoading(false);
        return;
      }
      const endpoints: Record<TabType, string> = {
        orders: "/orders", bikes: "/bikes?local_only=true", parts: "/parts", accessories: "/accessories", graphics: "/admin/graphics", settings: "/admin/settings/telegram"
      };
      const res = await fetch(`${API_URL}${endpoints[activeTab]}`, { headers });
      if (res.status === 401) return handleLogout();
      const result = await res.json();
      setData((prev) => ({ ...prev, [activeTab]: Array.isArray(result) ? result : [] }));
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  const parseTelegramRecipients = () => telegramSettings.recipientsText
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  const saveTelegramSettings = async () => {
    setTelegramSettings((prev) => ({ ...prev, isSaving: true, statusText: "" }));
    try {
      const res = await fetch(`${API_URL}/admin/settings/telegram`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ recipients: parseTelegramRecipients() }),
      });
      if (res.status === 401) return handleLogout();
      if (!res.ok) throw new Error("Не удалось сохранить получателей");
      const result = await res.json();
      setTelegramSettings((prev) => ({
        ...prev,
        recipientsText: (result.recipients || []).join("\n"),
        botConfigured: Boolean(result.bot_configured),
        statusText: "Получатели сохранены",
      }));
    } catch (err: any) {
      setTelegramSettings((prev) => ({ ...prev, statusText: err.message || "Ошибка сохранения" }));
    } finally {
      setTelegramSettings((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const sendTelegramTest = async () => {
    setTelegramSettings((prev) => ({ ...prev, isSaving: true, statusText: "" }));
    try {
      await saveTelegramSettings();
      const res = await fetch(`${API_URL}/admin/settings/telegram/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ message: "Тестовое уведомление из админки" }),
      });
      if (res.status === 401) return handleLogout();
      if (!res.ok) throw new Error("Не удалось отправить тест");
      setTelegramSettings((prev) => ({ ...prev, statusText: "Тестовое уведомление отправлено" }));
    } catch (err: any) {
      setTelegramSettings((prev) => ({ ...prev, statusText: err.message || "Ошибка отправки" }));
    } finally {
      setTelegramSettings((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // ФУНКЦИЯ ЗАГРУЗКИ ФОТО НА СЕРВЕР
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }, // Без Content-Type, fetch сам поставит multipart/form-data
        body: formData
      });
      const result = await res.json();

      if (res.ok && result.url) {
        setModal(prev => ({ ...prev, item: { ...prev.item, [fieldName]: result.url } }));
      } else {
        alert("Ошибка загрузки файла");
      }
    } catch {
      alert("Ошибка сети при загрузке");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/admin/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password: password.trim() })
    });
    if (res.ok) {
      const { access_token } = await res.json();
      localStorage.setItem("adminToken", access_token);
      setToken(access_token);
    } else alert("Неверный логин или пароль");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`${API_URL}/orders/${id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const serializePitConfigs = (value: string) => value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", wheels = "", price = "0"] = line.split("|").map((part) => part.trim());
      return { name, wheels, price_add: Number(price) || 0 };
    })
    .filter((config) => config.name && config.wheels);

  const deserializePitConfigs = (configs: any[] | undefined) => (configs || [])
    .map((config) => `${config.name}|${config.wheels}|${config.price_add || 0}`)
    .join("\n");

  const serializeGallery = (value: string) => value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleDelete = async (type: string, id: number) => {
    if (!confirm("Удалить безвозвратно?")) return;
    const endpoint = type === "bikes" ? `/bikes/${id}` : type === "graphics" ? `/graphics/${id}` : `/items/${type}/${id}`;
    await fetch(`${API_URL}${endpoint}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
    fetchData();
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const { type, mode, item } = modal;
    let endpoint = "";
    const method = mode === "edit" ? "PUT" : "POST";
    let payload: any = {};

    try {
      if (type === "orders") {
        endpoint = `/orders/${item.id}`;
        const previousConfiguration = item.configuration || {};
        const orderType = getOrderType(item);
        const nextConfiguration: any = { ...previousConfiguration };

        if (orderType === "part") {
          nextConfiguration.item_name = item.conf_item_name || previousConfiguration.item_name;
        } else if (orderType === "service") {
          nextConfiguration.request = item.conf_request || previousConfiguration.request;
        } else if (orderType !== "cart") {
          nextConfiguration.bike = item.conf_bike || previousConfiguration.bike;
          nextConfiguration.graphic = item.conf_graphic || previousConfiguration.graphic;
          if (typeof item.conf_accs === "string") {
            nextConfiguration.accessories = item.conf_accs.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        }

        payload = {
          customer_name: item.customer_name, phone: item.phone, total_price: Number(item.total_price),
          telegram: item.telegram || null,
          contact_method: item.contact_method || null,
          comment: item.comment || null,
          payment_method: item.payment_method || null,
          configuration: nextConfiguration
        };
      } else if (type === "bikes") {
        endpoint = mode === "edit" ? `/bikes/${item.id}` : `/bikes`;
        payload = {
          name: item.name, price: Number(item.price), description: item.description || null, specs: item.specs || null,
          pit_configs: item.bike_type === "PITBIKE" ? serializePitConfigs(item.pit_configs_text || "") : null,
          bike_type: item.bike_type || "PITBIKE",
          has_pts: Boolean(item.has_pts), in_stock: Boolean(item.in_stock),
          frame_type_id: item.bike_type === "PITBIKE" ? null : (item.frame_type_id ? Number(item.frame_type_id) : null),
          image_url: item.image_url || item.images?.find((image:any) => image.is_main)?.image_url || item.images?.[0]?.image_url || null,
          gallery_urls: serializeGallery(item.gallery_urls_text || "")
        };
        if (mode === "add") {
          if(!item.image_url) throw new Error("Загрузите фото мотоцикла");
          payload.bike_type = item.bike_type || "PITBIKE";
          payload.image_url = item.image_url;
        }
      } else if (type === "graphics") {
        if(!item.image_overlay_url && mode === "add") throw new Error("Загрузите оверлей графики");
        endpoint = mode === "edit" ? `/graphics/${item.id}` : `/graphics`;
        payload = {
          name: item.name, price_add: Number(item.price_add || 10000),
          image_overlay_url: item.image_overlay_url, frame_type_id: Number(item.frame_type_id)
        };
      } else {
        if(!item.image_url && mode === "add") throw new Error("Загрузите фото объекта");
        endpoint = mode === "edit" ? `/items/${type}/${item.id}` : `/items/${type}`;
        payload = {
          name: item.name, price: Number(item.price), description: item.description || null,
          image_url: item.image_url
        };
        if (mode === "edit") payload.in_stock = Boolean(item.in_stock);
        if (type === "part") payload.category_id = Number(item.category_id);
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method, headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Ошибка при сохранении");

      setModal({ isOpen: false, type: "", mode: "add", item: null });
      fetchData();
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const openModal = (type: string, mode: "add" | "edit", item: any = {}) => {
    const defaultItem = { ...item };
    if (mode === "add") {
       defaultItem.in_stock = true;
       defaultItem.has_pts = false;
       if(type === "part" && refs.categories.length) defaultItem.category_id = refs.categories[0].id;
       if(type === "graphics" && refs.frameTypes.length) defaultItem.frame_type_id = refs.frameTypes[0].id;
       if(type === "bikes") {
         defaultItem.bike_type = "PITBIKE";
         if(refs.frameTypes.length) defaultItem.frame_type_id = refs.frameTypes[0].id;
       }
    }
    if (type === "orders" && mode === "edit") {
      defaultItem.conf_bike = item.configuration?.bike || "";
      defaultItem.conf_item_name = item.configuration?.item_name || "";
      defaultItem.conf_request = item.configuration?.request || "";
      defaultItem.conf_graphic = item.configuration?.graphic || "";
      defaultItem.conf_accs = (item.configuration?.accessories || []).join(', ');
    }
    if (type === "bikes") {
      defaultItem.image_url = item.images?.find((image:any) => image.is_main)?.image_url || item.images?.[0]?.image_url || "";
      defaultItem.gallery_urls_text = (item.images || [])
        .filter((image:any) => !image.is_main)
        .map((image:any) => image.image_url)
        .join("\n");
      defaultItem.pit_configs_text = deserializePitConfigs(item.pit_configs || [
        { name: "Lite", wheels: "12/12", price_add: 0 },
        { name: "Lite", wheels: "14/14", price_add: 5000 },
        { name: "Pro", wheels: "12/12", price_add: 15000 },
      ]);
    }
    setModal({ isOpen: true, type, mode, item: defaultItem });
  };

  const list = activeTab === "settings" ? [] : data[activeTab] || [];
  const filteredList = list
    .filter((item: any) => {
      const searchable = activeTab === "orders"
        ? `${item.customer_name || ""} ${item.phone || ""} ${getOrderTitle(item)} ${getOrderMeta(item).join(" ")}`
        : `${item.name || ""} ${item.category?.name || ""} ${item.frame_type?.name || ""}`;
      return searchable.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter((item: any) => activeTab !== "orders" || orderTypeFilter === "all" || getOrderType(item) === orderTypeFilter);

  // ================= ЭКРАН ЛОГИНА =================
  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00D4FF]/20 blur-[120px] rounded-full pointer-events-none" />
        <form onSubmit={handleLogin} className="relative z-10 w-full max-w-sm space-y-5 border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl sm:space-y-6 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black uppercase italic text-white">Stunt<span className="text-[#00D4FF]">Admin</span></h2>
          </div>
          <input required type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Логин" className="w-full border border-white/10 bg-[#111] p-4 text-white outline-none focus:border-[#00D4FF]" />
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" className="w-full border border-white/10 bg-[#111] p-4 text-white outline-none focus:border-[#00D4FF]" />
          <button type="submit" className="mt-4 w-full bg-[#00D4FF] py-4 font-black uppercase tracking-widest text-black transition-colors hover:bg-white">Войти</button>
        </form>
      </div>
    );
  }

  // ================= ДАШБОРД =================
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white md:flex-row">
      <aside className="flex w-full flex-col border-r border-white/5 bg-[#0A0A0A] p-5 md:sticky md:top-0 md:h-screen md:w-64 md:p-6">
        <h2 className="mb-5 text-2xl font-black uppercase italic text-white md:mb-10">Stunt<span className="text-[#00D4FF]">Admin</span></h2>
        <nav className="grid flex-1 grid-cols-2 gap-2 md:block md:space-y-3">
          {[
            { id: "orders", label: "Заказы", color: "text-white", bg: "bg-white/10" },
            { id: "bikes", label: "Техника", color: "text-[#00D4FF]", bg: "bg-[#00D4FF]/10" },
            { id: "graphics", label: "Графика", color: "text-green-400", bg: "bg-green-400/10" },
            { id: "parts", label: "Запчасти", color: "text-yellow-500", bg: "bg-yellow-500/10" },
            { id: "accessories", label: "Допы", color: "text-[#FF00FF]", bg: "bg-[#FF00FF]/10" },
            { id: "settings", label: "Настройки", color: "text-[#00D4FF]", bg: "bg-[#00D4FF]/10" }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex w-full items-center justify-between border px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 sm:text-sm ${activeTab === tab.id ? `${tab.bg} ${tab.color} shadow-lg border-white/10` : "border-transparent text-white/50 hover:bg-white/5"}`}>
              {tab.label} {activeTab === tab.id && <ChevronRightIcon className="w-4 h-4" />}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-4 flex w-full items-center justify-center gap-3 bg-white/5 py-4 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-500 md:mt-8"><LogOut className="w-4 h-4"/> Выйти</button>
      </aside>

      <main className="w-full flex-1 overflow-y-auto p-5 md:h-screen md:p-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase md:text-4xl">Управление базой</h1>
            <p className="text-white/40 font-mono text-sm mt-2 tracking-widest">РАЗДЕЛ: {activeTab.toUpperCase()}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {activeTab !== "settings" && (
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск..." className="w-full border border-white/10 bg-[#111] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#00D4FF] sm:w-64" />
              </div>
            )}
            {activeTab !== "orders" && activeTab !== "parts" && activeTab !== "settings" && (
              <button onClick={() => openModal(activeTab === "bikes" ? "bikes" : activeTab === "graphics" ? "graphics" : "accessory", "add")} className="flex items-center justify-center gap-2 bg-[#00D4FF] px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-white">
                <Plus className="w-4 h-4" /> Добавить
              </button>
            )}
            {activeTab === "parts" && (
              <div className="border border-[#00D4FF]/25 bg-[#00D4FF]/10 px-5 py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#00D4FF]">
                Внешний каталог
              </div>
            )}
          </div>
        </div>

        {activeTab === "settings" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl md:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center border border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF]">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase italic">Telegram уведомления</h2>
                  <p className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                    Новые заказы будут улетать выбранным получателям
                  </p>
                </div>
              </div>

              <div className={`mb-5 border px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] ${
                telegramSettings.botConfigured
                  ? "border-green-400/35 bg-green-400/10 text-green-300"
                  : "border-red-500/35 bg-red-500/10 text-red-300"
              }`}>
                {telegramSettings.botConfigured ? "Бот подключен через переменные окружения" : "Токен бота не настроен на сервере"}
              </div>

              <label className="mb-3 block font-mono text-xs font-black uppercase tracking-[0.2em] text-white/45">
                Получатели
              </label>
              <textarea
                value={telegramSettings.recipientsText}
                onChange={(event) => setTelegramSettings((prev) => ({ ...prev, recipientsText: event.target.value }))}
                rows={8}
                placeholder={"123456789\n-1001234567890\n@channel_name"}
                className="w-full border border-white/10 bg-[#111] p-4 font-mono text-sm text-white outline-none placeholder:text-white/20 focus:border-[#00D4FF]"
              />
              <p className="mt-3 text-sm leading-6 text-white/40">
                Указывай по одному получателю на строку: личный chat_id, group chat_id или публичный канал вида @channel. Для личных сообщений пользователь сначала должен открыть бота и нажать Start.
              </p>

              {telegramSettings.statusText && (
                <div className="mt-5 border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#00D4FF]">
                  {telegramSettings.statusText}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={telegramSettings.isSaving}
                  onClick={saveTelegramSettings}
                  className="flex h-14 items-center justify-center gap-3 bg-[#00D4FF] px-6 font-black uppercase tracking-widest text-black transition-colors hover:bg-white disabled:opacity-50"
                >
                  {telegramSettings.isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Сохранить
                </button>
                <button
                  type="button"
                  disabled={telegramSettings.isSaving || !telegramSettings.botConfigured}
                  onClick={sendTelegramTest}
                  className="flex h-14 items-center justify-center gap-3 border border-white/10 px-6 font-black uppercase tracking-widest text-white/70 transition-colors hover:border-[#FF00FF] hover:text-white disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  Тест
                </button>
              </div>
            </section>

            <aside className="border border-white/10 bg-[#0A0A0A] p-6 md:p-8">
              <h3 className="text-xl font-black uppercase italic text-white">Как добавить получателя</h3>
              <div className="mt-6 grid gap-5 text-sm leading-7 text-white/48">
                <div>
                  <div className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#00D4FF]">Личный chat_id</div>
                  <p className="mt-2">1. Человек открывает Telegram-бота Stunt Tech и нажимает Start.</p>
                  <p>2. Он открывает @userinfobot или @getmyid_bot и копирует свой ID.</p>
                  <p>3. Вставь этот номер отдельной строкой, например 123456789.</p>
                </div>

                <div>
                  <div className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#00D4FF]">Группа</div>
                  <p className="mt-2">1. Добавь бота Stunt Tech в группу.</p>
                  <p>2. Напиши любое сообщение в группе.</p>
                  <p>3. Узнай ID группы через @RawDataBot или @getidsbot. Обычно он выглядит как -1001234567890.</p>
                </div>

                <div>
                  <div className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#00D4FF]">Канал @channel</div>
                  <p className="mt-2">1. Сделай бота администратором канала с правом публиковать сообщения.</p>
                  <p>2. Если канал публичный, укажи username канала: @channel_name.</p>
                  <p>3. Если канал приватный, используй числовой ID канала. Обычно он тоже начинается с -100.</p>
                </div>
              </div>
              <div className="mt-6 border border-[#FF00FF]/30 bg-[#FF00FF]/10 p-4 font-mono text-[10px] font-black uppercase leading-5 tracking-[0.16em] text-[#FF00FF]">
                После сохранения нажми тест. Если сообщение не пришло, проверь Start у личного пользователя, права бота в группе или админские права в канале.
              </div>
              <div className="mt-4 border border-white/10 bg-white/[0.03] p-4 font-mono text-[10px] font-black uppercase leading-5 tracking-[0.16em] text-white/35">
                Токен бота не хранится в браузере и не показывается в админке. Здесь хранится только список получателей.
              </div>
            </aside>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {orderTypeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setOrderTypeFilter(filter.id)}
                className={`whitespace-nowrap border px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${
                  orderTypeFilter === filter.id
                    ? "border-[#00D4FF] bg-[#00D4FF] text-black"
                    : "border-white/10 bg-[#0A0A0A] text-white/45 hover:border-white/25 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {/* ТАБЛИЦА */}
        {activeTab !== "settings" && <div className="overflow-hidden border border-white/5 bg-[#0A0A0A] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-widest text-white/40 font-mono">
                  {activeTab === "orders" ? (<><th className="p-5">Заказчик</th><th className="p-5">Конфигурация</th><th className="p-5 text-right">Сумма</th><th className="p-5 text-center">Статус</th><th className="p-5 text-right">Управление</th></>) :
                   activeTab === "graphics" ? (<><th className="p-5">Паттерн</th><th className="p-5">Совместимость</th><th className="p-5 text-right">Наценка</th><th className="p-5 text-right">Управление</th></>) :
                    (<><th className="p-5">Объект</th><th className="p-5">Тип</th><th className="p-5 text-right">Цена</th><th className="p-5 text-center">Наличие</th><th className="p-5 text-right">Управление</th></>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {isLoading ? <tr><td colSpan={6} className="p-10 text-center text-white/30 font-mono uppercase tracking-widest">Синхронизация...</td></tr> :
                  filteredList.map((item: any) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">

                      {/* РЕНДЕР ЗАКАЗОВ */}
                      {activeTab === "orders" && (
                        <>
                          <td className="p-5">
                            <div className="font-mono text-[#00D4FF] text-xs mb-1">#{item.id.toString().padStart(4, '0')}</div>
                            <div className="font-bold text-base">{item.customer_name}</div>
                            <div className="text-xs text-white/40 font-mono mt-1">{item.phone}</div>
                          </td>
                          <td className="p-5">
                            <div className="mb-2 inline-flex border border-[#00D4FF]/30 bg-[#00D4FF]/10 px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#00D4FF]">
                              {getOrderTypeLabel(item)}
                            </div>
                            <div className="font-bold uppercase tracking-wide">{getOrderTitle(item)}</div>
                            {getOrderMeta(item).map((line) => (
                              <div key={line} className="mt-1 text-[10px] font-bold uppercase text-white/40">{line}</div>
                            ))}
                            {item.comment && <div className="text-[10px] text-white/35 uppercase mt-1">Комментарий: {item.comment}</div>}
                          </td>
                          <td className="p-5 text-right font-mono font-bold text-lg">{item.total_price.toLocaleString()} ₽</td>
                          <td className="p-5 text-center">
                            <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest outline-none bg-[#111] border border-white/20 text-white focus:border-[#00D4FF]">
                              <option value="NEW">Новый</option><option value="PAID">Оплачен</option><option value="BUILDING">В сборке</option><option value="COMPLETED">Готов</option>
                            </select>
                          </td>
                          <td className="p-5 text-right"><button onClick={() => openModal("orders", "edit", item)} className="p-2 text-white/30 hover:text-[#00D4FF] bg-white/5 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button></td>
                        </>
                      )}

                      {/* РЕНДЕР ГРАФИКИ И ТОВАРОВ */}
                      {activeTab !== "orders" && (
                         <>
                          <td className="p-5 flex items-center gap-4">
                            <div className="w-16 h-12 bg-black rounded-lg overflow-hidden shrink-0 border border-white/10">
                              <img src={item.images?.[0]?.image_url || item.image_url || item.image_overlay_url} className="w-full h-full object-cover" alt="Товар"/>
                            </div>
                            <div>
                               <div className="font-bold uppercase tracking-wide text-base flex items-center gap-2">
                                 {item.name} {item.has_pts && <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] border border-white/20">ПТС</span>}
                               </div>
                               {item.description && <div className="text-[10px] text-white/40 truncate max-w-[200px] mt-1">{item.description}</div>}
                               {item.source === "woocommerce" && item.sku && <div className="mt-1 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-[#00D4FF]">SKU / {item.sku}</div>}
                            </div>
                          </td>
                          <td className="p-5 font-mono text-xs text-white/50">
                            {activeTab === "graphics" ? item.frame_type?.name : item.bike_type === "BIG_BIKE" ? "СТАНТ" : item.bike_type === "PITBIKE" ? "ПИТБАЙК" : item.category?.name || "УНИВЕРСАЛЬНО"}
                          </td>
                          <td className="p-5 text-right font-mono font-bold text-lg">{activeTab === "graphics" ? <span className="text-green-400">+{item.price_add.toLocaleString()} ₽</span> : `${item.price.toLocaleString()} ₽`}</td>

                          {activeTab !== "graphics" && (
                            <td className="p-5 text-center">{item.in_stock ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto"/> : <XCircle className="w-5 h-5 text-red-500 mx-auto"/>}</td>
                          )}

                          <td className="p-5 text-right">
                            {item.source === "woocommerce" ? (
                              <a href={item.source_url} target="_blank" rel="noreferrer" className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#00D4FF] hover:text-white">
                                Открыть товар
                              </a>
                            ) : (
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(activeTab === "bikes" ? "bikes" : activeTab === "graphics" ? "graphics" : activeTab === "parts" ? "part" : "accessory", "edit", item)} className="p-2 text-white/30 hover:text-[#00D4FF] bg-white/5 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(activeTab === "bikes" ? "bikes" : activeTab === "graphics" ? "graphics" : activeTab === "parts" ? "part" : "accessory", item.id)} className="p-2 text-white/30 hover:text-red-500 bg-white/5 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            )}
                          </td>
                         </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>}

        {/* УНИВЕРСАЛЬНАЯ МОДАЛКА */}
        <AnimatePresence>
          {modal.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="relative my-8 w-full max-w-2xl border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:p-8">
                <button onClick={() => setModal({ isOpen: false, type: "", mode: "add", item: null })} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white sm:right-6 sm:top-6"><X className="w-5 h-5" /></button>

                <h2 className="mb-6 border-b border-white/10 pb-5 pr-12 text-2xl font-black uppercase italic sm:mb-8 sm:pb-6 sm:text-3xl">
                  {modal.mode === "add" ? "Добавление" : "Редактирование"}
                  <span className="text-[#00D4FF] ml-2">{modal.type === "orders" ? "Заказа" : modal.type === "graphics" ? "Графики" : "Объекта"}</span>
                </h2>

                <form onSubmit={handleSubmitModal} className="space-y-6 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">

                  {modal.type === "orders" && (
                    <>
	                      <div className="grid grid-cols-2 gap-4">
	                        <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Имя заказчика</label><input required type="text" value={modal.item?.customer_name || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, customer_name: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
	                        <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Телефон</label><input required type="text" value={modal.item?.phone || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, phone: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
	                      </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Telegram / WhatsApp</label><input type="text" value={modal.item?.telegram || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, telegram: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
                          <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Способ связи</label><input type="text" value={modal.item?.contact_method || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, contact_method: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
                        </div>
                        {getOrderType(modal.item) === "cart" ? (
                          <div className="border border-white/10 bg-[#111] p-4">
                            <label className="mb-3 block font-mono text-xs font-bold uppercase text-white/50">Состав корзины</label>
                            <div className="grid gap-2">
                              {(modal.item?.configuration?.cart_items || []).map((cartItem: any) => (
                                <div key={cartItem.id || cartItem.title} className="flex items-start justify-between gap-4 border-b border-white/5 pb-2 text-xs last:border-0 last:pb-0">
                                  <span className="font-bold uppercase text-white/75">{cartItem.title}</span>
                                  <span className="whitespace-nowrap font-mono text-[#00D4FF]">x{cartItem.quantity || 1}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">
                              {getOrderType(modal.item) === "part" ? "Запчасть" : getOrderType(modal.item) === "service" ? "Запрос сервиса" : "Модель техники"}
                            </label>
                            <input
                              type="text"
                              value={modal.item?.conf_bike || modal.item?.conf_item_name || modal.item?.conf_request || ""}
                              onChange={e => {
                                const configKey = getOrderType(modal.item) === "part" ? "conf_item_name" : getOrderType(modal.item) === "service" ? "conf_request" : "conf_bike";
                                setModal({ ...modal, item: { ...modal.item, [configKey]: e.target.value } });
                              }}
                              className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]"
                            />
                          </div>
                        )}
	                      <div className="grid grid-cols-2 gap-4">
                          {getOrderType(modal.item) === "bike_configurator" && (
	                          <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Графика</label><input type="text" value={modal.item?.conf_graphic || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, conf_graphic: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
                          )}
	                        <div className={getOrderType(modal.item) === "bike_configurator" ? "" : "col-span-2"}><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Итоговая сумма (₽)</label><input type="number" value={modal.item?.total_price || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, total_price: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] font-mono font-bold" /></div>
	                      </div>
                        <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Способ оплаты</label><input type="text" value={modal.item?.payment_method || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, payment_method: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
	                      {getOrderType(modal.item) === "bike_configurator" && (
                          <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Допы (через запятую)</label><textarea rows={2} value={modal.item?.conf_accs || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, conf_accs: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
                        )}
                        <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Комментарий</label><textarea rows={3} value={modal.item?.comment || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, comment: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
	                    </>
	                  )}

                  {modal.type === "graphics" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Название паттерна</label><input required type="text" value={modal.item?.name || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, name: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
                        <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Наценка (₽)</label><input required type="number" value={modal.item?.price_add || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, price_add: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] font-mono font-bold text-green-400" /></div>
                      </div>
                      <div>
                        <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Совместимость с рамой</label>
                        <select required value={modal.item?.frame_type_id || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, frame_type_id: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] appearance-none">
                          {refs.frameTypes.map((ft:any) => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                        </select>
                      </div>
                      {/* БЛОК ЗАГРУЗКИ КАРТИНКИ */}
                      <div>
                        <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Файл прозрачного PNG (Оверлей)</label>
                        <div className="flex items-center gap-4">
                          {modal.item?.image_overlay_url && <img src={modal.item.image_overlay_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover bg-white/5 border border-white/20"/>}
                          <label className="flex-1 cursor-pointer bg-[#111] hover:bg-[#00D4FF]/10 border border-white/10 hover:border-[#00D4FF] p-4 rounded-xl flex items-center justify-center transition-colors">
                             {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-[#00D4FF]"/> : <><UploadCloud className="w-5 h-5 mr-2 text-[#00D4FF]"/><span className="text-white/80 font-bold text-sm uppercase">Загрузить файл</span></>}
                             <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'image_overlay_url')} />
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {modal.type !== "orders" && modal.type !== "graphics" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Название</label><input required type="text" value={modal.item?.name || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, name: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
                        <div><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Цена (₽)</label><input required type="number" value={modal.item?.price || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, price: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] font-mono font-bold" /></div>

                        {modal.type === "part" && (
                          <div className="col-span-2">
                            <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Категория запчасти</label>
                            <select value={modal.item?.category_id || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, category_id: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] appearance-none">
                               {refs.categories.map((cat:any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                          </div>
                        )}

                        {modal.type === "bikes" && (
                          <>
                             <div>
                               <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Класс техники</label>
	                               <select value={modal.item?.bike_type || "PITBIKE"} onChange={e => setModal({ ...modal, item: { ...modal.item, bike_type: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] appearance-none disabled:opacity-50">
                                 <option value="PITBIKE">Питбайк (Готовый)</option>
                                 <option value="BIG_BIKE">Стант-Байк (В Конфигуратор)</option>
                               </select>
                             </div>
                             <div>
                                <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Базовая Рама</label>
                                <select disabled={modal.item?.bike_type === "PITBIKE"} value={modal.item?.frame_type_id || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, frame_type_id: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] appearance-none disabled:opacity-50">
                                  <option value="">Не выбрана</option>
                                  {refs.frameTypes.map((ft:any) => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                                </select>
                             </div>
                          </>
                        )}
                      </div>

                      <div className="col-span-2"><label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Описание</label><textarea rows={3} value={modal.item?.description || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, description: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF]" /></div>
	                      {modal.type === "bikes" && (
	  <div className="col-span-2 mt-4">
    <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">
      Характеристики (по одной на строку, формат: Название: Значение)
    </label>
    <textarea rows={4} value={modal.item?.specs || ""}
      onChange={e => setModal({ ...modal, item: { ...modal.item, specs: e.target.value } })}
      placeholder="Двигатель: 300cc&#10;Охлаждение: Водяное"
      className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] text-sm font-mono" />
  </div>
	)}
                      {modal.type === "bikes" && modal.item?.bike_type === "PITBIKE" && (
  <div className="col-span-2 mt-4">
    <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">
      Комплектации питбайка (формат: Название|Колёса|Наценка)
    </label>
    <textarea rows={4} value={modal.item?.pit_configs_text || ""}
      onChange={e => setModal({ ...modal, item: { ...modal.item, pit_configs_text: e.target.value } })}
      placeholder="Lite|12/12|0&#10;Lite|14/14|5000&#10;Pro|12/12|15000"
      className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] text-sm font-mono" />
  </div>
)}
                      <div className="flex gap-8 py-4 border-y border-white/10">
                         <label className="flex items-center gap-3 text-sm uppercase font-bold cursor-pointer group">
                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${modal.item?.in_stock ?? true ? 'bg-green-500 border-green-500' : 'border-white/20'}`}>
                               {(modal.item?.in_stock ?? true) && <CheckCircle className="w-4 h-4 text-black"/>}
                            </div>
                            <input type="checkbox" checked={modal.item?.in_stock ?? true} onChange={e => setModal({ ...modal, item: { ...modal.item, in_stock: e.target.checked } })} className="hidden"/>
                            В наличии
                         </label>
                         {modal.type === "bikes" && (
                           <label className="flex items-center gap-3 text-sm uppercase font-bold cursor-pointer group text-[#00D4FF]">
                              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${modal.item?.has_pts ? 'bg-[#00D4FF] border-[#00D4FF]' : 'border-white/20'}`}>
                                 {modal.item?.has_pts && <CheckCircle className="w-4 h-4 text-black"/>}
                              </div>
                              <input type="checkbox" checked={modal.item?.has_pts || false} onChange={e => setModal({ ...modal, item: { ...modal.item, has_pts: e.target.checked } })} className="hidden"/>
                              Документы ПТС
                           </label>
                         )}
                      </div>

                      {/* БЛОК ЗАГРУЗКИ КАРТИНКИ (Разрешено редактировать для запчастей, для байков только создание) */}
	                      {modal.type !== "orders" && (
	                        <div>
	                          <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Основная фотография</label>
                          <div className="flex items-center gap-4">
                            {modal.item?.image_url && <img src={modal.item.image_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover bg-white/5 border border-white/20"/>}
                            <label className="flex-1 cursor-pointer bg-[#111] hover:bg-[#00D4FF]/10 border border-white/10 hover:border-[#00D4FF] p-4 rounded-xl flex items-center justify-center transition-colors">
                               {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-[#00D4FF]"/> : <><UploadCloud className="w-5 h-5 mr-2 text-[#00D4FF]"/><span className="text-white/80 font-bold text-sm uppercase">Загрузить файл</span></>}
                               <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'image_url')} />
                            </label>
                          </div>
	                        </div>
	                      )}
                      {modal.type === "bikes" && (
                        <div>
                          <label className="text-xs font-bold font-mono uppercase text-white/50 block mb-2">Галерея (URL по одному на строку)</label>
                          <textarea rows={3} value={modal.item?.gallery_urls_text || ""} onChange={e => setModal({ ...modal, item: { ...modal.item, gallery_urls_text: e.target.value } })} className="w-full bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-[#00D4FF] text-sm font-mono" />
                        </div>
                      )}
                    </>
                  )}

                  <button type="submit" disabled={isUploading} className="w-full bg-[#00D4FF] disabled:opacity-50 text-black font-black uppercase tracking-widest py-5 rounded-xl mt-8 hover:bg-white transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                    {isUploading ? "Дождитесь загрузки..." : "Сохранить изменения"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  )
}
