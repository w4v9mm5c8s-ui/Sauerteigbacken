create table public.sourdough_push_subscriptions (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,endpoint text not null,p256dh text not null,auth text not null,created_at timestamptz not null default now(),unique(user_id,endpoint));
alter table public.sourdough_push_subscriptions enable row level security;
create policy push_owner on public.sourdough_push_subscriptions for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert,update,delete on public.sourdough_push_subscriptions to authenticated;
create table public.sourdough_push_jobs (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,subscription_id uuid not null references public.sourdough_push_subscriptions(id) on delete cascade,timer_key text not null,due_at timestamptz not null,state text not null default 'pending' check(state in ('pending','sending','sent','failed')),claimed_at timestamptz,attempts int not null default 0,unique(user_id,subscription_id,timer_key));
alter table public.sourdough_push_jobs enable row level security;
create policy jobs_owner_read on public.sourdough_push_jobs for select to authenticated using ((select auth.uid())=user_id);
create policy jobs_owner_delete on public.sourdough_push_jobs for delete to authenticated using ((select auth.uid())=user_id);
grant select,delete on public.sourdough_push_jobs to authenticated;
create function public.schedule_sourdough_push(p_subscription uuid,p_key text,p_due timestamptz) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.sourdough_push_subscriptions where id=p_subscription and user_id=auth.uid()) then raise exception 'Unauthorized';end if;
 if length(p_key)>180 or p_due<now() or p_due>now()+interval '24 hours' then raise exception 'Invalid reminder';end if;
 if (select count(*) from public.sourdough_push_jobs where user_id=auth.uid() and state='pending')>=50 then raise exception 'Too many reminders';end if;
 insert into public.sourdough_push_jobs(user_id,subscription_id,timer_key,due_at) values(auth.uid(),p_subscription,p_key,p_due) on conflict(user_id,subscription_id,timer_key) do update set due_at=excluded.due_at,state='pending',attempts=0 returning id into result;return result;
end $$;
revoke all on function public.schedule_sourdough_push(uuid,text,timestamptz) from public,anon;grant execute on function public.schedule_sourdough_push(uuid,text,timestamptz) to authenticated;
create function public.claim_sourdough_push() returns setof public.sourdough_push_jobs language sql security definer set search_path='' as $$
 update public.sourdough_push_jobs set state='sending',claimed_at=now(),attempts=attempts+1 where id in (select id from public.sourdough_push_jobs where due_at<=now() and due_at>now()-interval '1 hour' and attempts<3 and (state='pending' or (state='sending' and claimed_at<now()-interval '3 minutes')) order by due_at limit 50 for update skip locked) returning *;
$$;
revoke all on function public.claim_sourdough_push() from public,anon,authenticated;grant execute on function public.claim_sourdough_push() to service_role;
create function public.sourdough_push_secrets() returns jsonb language sql security definer set search_path='' as $$
 select jsonb_object_agg(name,decrypted_secret) from vault.decrypted_secrets where name in ('sourdough_vapid_public','sourdough_vapid_private','sourdough_push_worker');
$$;
revoke all on function public.sourdough_push_secrets() from public,anon,authenticated;grant execute on function public.sourdough_push_secrets() to service_role;
create index sourdough_push_due on public.sourdough_push_jobs(due_at) where state='pending';
create index sourdough_push_subscription_idx on public.sourdough_push_jobs(subscription_id);
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
