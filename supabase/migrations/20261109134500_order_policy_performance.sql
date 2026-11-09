create index if not exists order_items_product_id_idx
  on public.order_items (product_id);

drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can read their own order items" on public.order_items;
create policy "Users can read their own order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );
