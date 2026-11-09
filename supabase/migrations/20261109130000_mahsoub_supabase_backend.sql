create table if not exists public.products (
  id text primary key,
  name text not null,
  name_ar text not null,
  category text not null,
  price numeric(10, 3) not null check (price >= 0),
  calories integer not null check (calories >= 0),
  carbs numeric(8, 2) not null check (carbs >= 0),
  fat numeric(8, 2) not null check (fat >= 0),
  protein numeric(8, 2) not null check (protein >= 0),
  ingredients jsonb not null default '[]'::jsonb check (jsonb_typeof(ingredients) = 'array'),
  ingredients_ar jsonb not null default '[]'::jsonb check (jsonb_typeof(ingredients_ar) = 'array'),
  servings text[] not null default '{}',
  water boolean not null default false,
  image_path text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
grant select on public.products to anon, authenticated;
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select to anon, authenticated
  using (is_active);

create table if not exists public.site_assets (
  asset_key text primary key,
  path text not null unique,
  content_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.site_assets enable row level security;
grant select on public.site_assets to anon, authenticated;
drop policy if exists "Public can read active site assets" on public.site_assets;
create policy "Public can read active site assets"
  on public.site_assets for select to anon, authenticated
  using (is_active);

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
grant select on public.site_settings to anon, authenticated;
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select to anon, authenticated
  using (true);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted', 'cancelled', 'fulfilled')),
  total numeric(10, 3) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  product_name text not null,
  product_name_ar text not null,
  unit_price numeric(10, 3) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 20),
  serving text not null,
  line_total numeric(10, 3) not null check (line_total >= 0)
);

create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);
create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
grant select on public.orders, public.order_items to authenticated;
drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
  on public.orders for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "Users can read their own order items" on public.order_items;
create policy "Users can read their own order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create or replace function public.place_order(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid := gen_random_uuid();
  v_total numeric(10, 3);
begin
  if v_user_id is null then
    raise exception 'Sign in is required to submit an order';
  end if;

  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 50 then
    raise exception 'Order must contain between 1 and 50 items';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(item.value) <> 'object'
       or coalesce(item.value ->> 'id', '') = ''
       or coalesce(item.value ->> 'serving', '') = ''
       or coalesce(item.value ->> 'quantity', '') !~ '^[1-9][0-9]*$'
       or case
            when coalesce(item.value ->> 'quantity', '') ~ '^[1-9][0-9]*$'
              then (item.value ->> 'quantity')::integer > 20
            else true
          end
  ) then
    raise exception 'Order contains an invalid item or quantity';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    left join public.products as product
      on product.id = item.value ->> 'id'
     and product.is_active
    where product.id is null
       or (product.water and item.value ->> 'serving' <> 'none')
       or (not product.water and not (item.value ->> 'serving' = any(product.servings)))
  ) then
    raise exception 'Order contains an unavailable product or serving';
  end if;

  select sum(product.price * (item.value ->> 'quantity')::integer)
    into v_total
  from jsonb_array_elements(p_items) as item(value)
  join public.products as product
    on product.id = item.value ->> 'id';

  insert into public.orders (id, user_id, total)
  values (v_order_id, v_user_id, v_total);

  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    product_name_ar,
    unit_price,
    quantity,
    serving,
    line_total
  )
  select
    v_order_id,
    product.id,
    product.name,
    product.name_ar,
    product.price,
    (item.value ->> 'quantity')::integer,
    item.value ->> 'serving',
    product.price * (item.value ->> 'quantity')::integer
  from jsonb_array_elements(p_items) as item(value)
  join public.products as product
    on product.id = item.value ->> 'id';

  return v_order_id;
end;
$$;

revoke all on function public.place_order(jsonb) from public, anon;
grant execute on function public.place_order(jsonb) to authenticated;

insert into public.products (
  id, name, name_ar, category, price, calories, carbs, fat, protein,
  ingredients, ingredients_ar, servings, water, image_path, is_active, sort_order
) values
  ('matcha', 'Matcha', 'ماتشا', 'matcha', 1.500, 39, 12, 2.2, 1,
   '["Matcha","Erythritol","Almond Milk"]'::jsonb,
   '["ماتشا","إريثريتول","حليب اللوز"]'::jsonb,
   array['Hot','Iced'], false, 'attached_assets/generated_images/matcha.jpg', true, 1),
  ('chocolate-milk', 'Chocolate Milk', 'حليب كاكاو', 'chocolate', 1.000, 50, 4.8, 0.9, 4,
   '["Skimmed Milk","Organic Cocoa Powder"]'::jsonb,
   '["حليب خالي الدسم","مسحوق كاكاو عضوي"]'::jsonb,
   array['Hot','Iced'], false, 'attached_assets/generated_images/chocolate-milk.jpg', true, 2),
  ('coffee-latte', 'Coffee Latte', 'كوفي لاتيه', 'coffee', 1.250, 57, 10, 1, 2,
   '["Low-fat Milk","Espresso Shot","Zero-Calorie Caramel Syrup","Stevia","Erythritol"]'::jsonb,
   '["حليب قليل الدسم","شوت إسبريسو","سيرب كراميل خالي من السعرات","ستيفيا","إريثريتول"]'::jsonb,
   array['Hot','Iced'], false, 'attached_assets/generated_images/coffee-latte.jpg', true, 3),
  ('americano', 'Americano', 'أمريكانو', 'coffee', 1.000, 0, 0, 0, 0,
   '["Espresso Shot","Water","Ice"]'::jsonb,
   '["شوت إسبريسو","ماء","ثلج"]'::jsonb,
   array['Hot','Iced'], false, 'attached_assets/generated_images/americano.jpg', true, 4),
  ('water', 'Water', 'ماء', 'water', 0.250, 0, 0, 0, 0,
   '["Regular bottled water"]'::jsonb,
   '["ماء عادي معبأ"]'::jsonb,
   '{}'::text[], true, 'attached_assets/generated_images/water.jpg', true, 5)
on conflict (id) do nothing;

insert into public.site_assets (asset_key, path, content_type, size_bytes, is_active)
values
  ('brand_logo', 'attached_assets/IMG_1707_1793637320300.jpeg', 'image/jpeg', 42921, true),
  ('product_matcha', 'attached_assets/generated_images/matcha.jpg', 'image/jpeg', 94679, true),
  ('product_chocolate_milk', 'attached_assets/generated_images/chocolate-milk.jpg', 'image/jpeg', 104127, true),
  ('product_coffee_latte', 'attached_assets/generated_images/coffee-latte.jpg', 'image/jpeg', 99430, true),
  ('product_americano', 'attached_assets/generated_images/americano.jpg', 'image/jpeg', 120861, true),
  ('product_water', 'attached_assets/generated_images/water.jpg', 'image/jpeg', 111009, true),
  ('hero_poster', 'attached_assets/generated_images/mahsoub-hero-final-poster.jpg', 'image/jpeg', 28569, true),
  ('hero_poster_archive', 'attached_assets/generated_images/mahsoub-hero-poster.jpg', 'image/jpeg', 92209, false),
  ('scale_illustration_archive', 'attached_assets/generated_images/digital-kitchen-scale.svg', 'image/svg+xml', 2084, false),
  ('hero_video_approved', 'attached_assets/generated_videos/mahsoub-hero-final.mp4', 'video/mp4', 597571, true),
  ('hero_video_archive', 'attached_assets/generated_videos/mahsoub-hero.mp4', 'video/mp4', 907460, false),
  ('hero_video_pour_archive', 'attached_assets/generated_videos/mahsoub-hero-pour.mp4', 'video/mp4', 974162, false)
on conflict (asset_key) do nothing;

insert into public.site_settings (setting_key, setting_value)
values (
  'brand',
  '{"name":"MAHSOUB","name_ar":"محسوب","tagline_en":"Every Sip Counts.","tagline_ar":"كل رشفة محسوبة.","contact_email":"saraahdi04@icloud.com","instagram":"@ma7sob.kw","instagram_url":"https://www.instagram.com/ma7sob.kw/"}'::jsonb
)
on conflict (setting_key) do nothing;

insert into storage.buckets (id, name, public)
values ('mahsoub-assets', 'mahsoub-assets', true)
on conflict (id) do nothing;
