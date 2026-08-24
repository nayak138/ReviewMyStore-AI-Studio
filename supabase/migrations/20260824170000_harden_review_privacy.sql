begin;

-- Reviews can contain customer email addresses and phone numbers. Only the
-- corresponding store owner may read them.
drop policy if exists "Public can insert reviews" on public.reviews;
drop policy if exists "Public can view reviews" on public.reviews;
drop policy if exists "Store owners can view reviews" on public.reviews;
create policy "Store owners can view reviews" on public.reviews
  for select using (
    exists (
      select 1 from public.stores
      where stores.id = reviews.store_id and stores.owner_id = auth.uid()
    )
  );

-- Private feedback is accepted only by the validated backend, which uses a
-- server-only service-role key. Anonymous clients must not insert directly.
drop policy if exists "Public can insert private feedback" on public.private_feedbacks;
revoke insert on public.private_feedbacks from anon, authenticated;

commit;
