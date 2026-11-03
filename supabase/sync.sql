alter table public.app_data add column if not exists revision bigint not null default 0;
create or replace function public.save_sourdough_data(p_payload jsonb,p_revision bigint) returns jsonb language plpgsql security invoker set search_path='' as $$
declare next_version bigint;
begin
 if auth.uid() is null then raise exception 'Unauthorized'; end if;
 if jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>900000 then raise exception 'Invalid payload';end if;
 update public.app_data set payload=p_payload,updated_at=now(),revision=revision+1 where user_id=auth.uid() and revision=p_revision returning revision into next_version;
 if next_version is null and p_revision=0 then
  insert into public.app_data(user_id,payload,updated_at,revision) values(auth.uid(),p_payload,now(),1) on conflict(user_id) do nothing returning revision into next_version;
 end if;
 if next_version is null then return jsonb_build_object('conflict',true);end if;
 return jsonb_build_object('ok',true,'revision',next_version);
end $$;
revoke all on function public.save_sourdough_data(jsonb,bigint) from public,anon;grant execute on function public.save_sourdough_data(jsonb,bigint) to authenticated;
