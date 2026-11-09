(() => {
  const config = window.MAHSOUB_SUPABASE_CONFIG;
  let client = null;
  let projectUrl = "";

  function requireClient() {
    if (!client) throw new Error("Supabase client has not been initialized.");
    return client;
  }

  async function initialize() {
    if (!window.supabase?.createClient || !config?.url || !config?.key) {
      throw new Error("Supabase client configuration is unavailable.");
    }

    projectUrl = config.url.replace(/\/+$/, "");
    client = window.supabase.createClient(projectUrl, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "mahsoub-auth-session",
      },
    });

    const [productsResult, assetsResult, settingsResult, sessionResult] = await Promise.all([
      client.from("products").select("*").eq("is_active", true).order("sort_order"),
      client.from("site_assets").select("*").eq("is_active", true),
      client.from("site_settings").select("setting_key,setting_value"),
      client.auth.getSession(),
    ]);

    for (const result of [productsResult, assetsResult, settingsResult, sessionResult]) {
      if (result.error) throw result.error;
    }
    if (!productsResult.data?.length) throw new Error("The Supabase product catalog is empty.");

    const assets = Object.fromEntries(
      (assetsResult.data || []).map((asset) => [asset.asset_key, asset])
    );
    const settings = Object.fromEntries(
      (settingsResult.data || []).map((setting) => [setting.setting_key, setting.setting_value])
    );

    return {
      products: productsResult.data,
      assets,
      settings,
      user: sessionResult.data?.session?.user || null,
    };
  }

  function publicAssetUrl(path) {
    if (!projectUrl || !path) return "";
    const safePath = String(path).split("/").map(encodeURIComponent).join("/");
    return `${projectUrl}/storage/v1/object/public/mahsoub-assets/${safePath}`;
  }

  function onAuthChange(callback) {
    const { data } = requireClient().auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return data.subscription;
  }

  async function signIn(email, password) {
    const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signUp(email, password) {
    const { data, error } = await requireClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await requireClient().auth.signOut();
    if (error) throw error;
  }

  async function placeOrder(items) {
    const { data, error } = await requireClient().rpc("place_order", { p_items: items });
    if (error) throw error;
    return data;
  }

  async function loadOrders() {
    const supabase = requireClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id,status,total,created_at")
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw error;
    if (!orders?.length) return [];

    const { data: items, error: itemError } = await supabase
      .from("order_items")
      .select("order_id,product_name,product_name_ar,unit_price,quantity,serving,line_total")
      .in("order_id", orders.map((order) => order.id));
    if (itemError) throw itemError;

    const itemsByOrder = new Map();
    for (const item of items || []) {
      const group = itemsByOrder.get(item.order_id) || [];
      group.push(item);
      itemsByOrder.set(item.order_id, group);
    }
    return orders.map((order) => ({ ...order, items: itemsByOrder.get(order.id) || [] }));
  }

  window.MAHSOUB_BACKEND = Object.freeze({
    initialize,
    publicAssetUrl,
    onAuthChange,
    signIn,
    signUp,
    signOut,
    placeOrder,
    loadOrders,
  });
})();
