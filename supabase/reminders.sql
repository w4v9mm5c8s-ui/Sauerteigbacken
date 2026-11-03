alter table public.sourdough_push_jobs add column if not exists message text not null default 'Dein Backtimer ist abgelaufen.';
alter table public.sourdough_push_jobs add column if not exists repeat_hours integer not null default 0 check(repeat_hours=0 or repeat_hours between 1 and 8760);
create or replace function public.schedule_sourdough_reminder(p_subscription uuid,p_key text,p_due timestamptz,p_message text,p_repeat_hours integer default 0) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.sourdough_push_subscriptions where id=p_subscription and user_id=auth.uid()) then raise exception 'Unauthorized';end if;
 if p_key is null or length(p_key)<1 or length(p_key)>180 or p_due is null or p_due<now() or p_due>now()+interval '366 days' or p_message is null or length(p_message)>180 or p_repeat_hours is null or not(p_repeat_hours=0 or p_repeat_hours between 1 and 8760) then raise exception 'Invalid reminder';end if;
 if (select count(*) from public.sourdough_push_jobs where user_id=auth.uid() and state in ('pending','sending'))>=500 and not exists(select 1 from public.sourdough_push_jobs where user_id=auth.uid() and subscription_id=p_subscription and timer_key=p_key) then raise exception 'Too many reminders';end if;
 insert into public.sourdough_push_jobs(user_id,subscription_id,timer_key,due_at,message,repeat_hours) values(auth.uid(),p_subscription,p_key,p_due,p_message,p_repeat_hours) on conflict(user_id,subscription_id,timer_key) do update set due_at=excluded.due_at,message=excluded.message,repeat_hours=excluded.repeat_hours,state='pending',attempts=0,claimed_at=null returning id into result;return result;
end $$;
revoke all on function public.schedule_sourdough_reminder(uuid,text,timestamptz,text,integer) from public,anon;
grant execute on function public.schedule_sourdough_reminder(uuid,text,timestamptz,text,integer) to authenticated;
create or replace function public.claim_sourdough_push() returns setof public.sourdough_push_jobs language sql security definer set search_path='' as $$
 update public.sourdough_push_jobs set state='sending',claimed_at=now(),attempts=attempts+1 where id in (select id from public.sourdough_push_jobs where due_at<=now() and (due_at>now()-interval '1 hour' or repeat_hours>0) and attempts<3 and (state='pending' or (state='sending' and claimed_at<now()-interval '3 minutes')) order by due_at limit 50 for update skip locked) returning *;
$$;
