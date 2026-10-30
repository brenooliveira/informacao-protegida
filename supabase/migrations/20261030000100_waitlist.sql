-- Fase 2: subconjunto do schema aprovado para a lista de espera.
begin;
create table public.waitlist (
 id uuid primary key default gen_random_uuid(),
 normalized_email text not null unique check (normalized_email=lower(btrim(normalized_email)) and length(normalized_email) between 3 and 254 and position('@' in normalized_email)>1),
 status text not null default 'active' check(status='active'),
 unsubscribe_token_digest text not null unique check(unsubscribe_token_digest ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index waitlist_created_at_idx on public.waitlist(created_at);
create table public.consent_records (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid check(owner_id is null), -- FK/Auth e demais finalidades entram na Fase 3.
 waitlist_id uuid not null references public.waitlist(id) on delete cascade,
 purpose text not null check(purpose='waitlist'),
 text_version text not null,
 consent_text text not null,
 granted_at timestamptz not null default now(),
 revoked_at timestamptz,
 ip_truncated inet not null check (
  ((family(ip_truncated)=4 and masklen(ip_truncated)=24) or (family(ip_truncated)=6 and masklen(ip_truncated)=48)) and ip_truncated=network(ip_truncated)::inet
 ),
 created_at timestamptz not null default now(),
 unique(waitlist_id,purpose)
);
create table public.rate_limits (
 scope text not null check(scope in ('waitlist-hour','waitlist-day','unsubscribe-hour')),
 subject_digest text not null check(subject_digest ~ '^[a-f0-9]{64}$'),
 window_start timestamptz not null,
 request_count integer not null check(request_count>0),
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key(scope,subject_digest,window_start)
);
create index rate_limits_expires_at_idx on public.rate_limits(expires_at);
alter table public.waitlist enable row level security;
alter table public.consent_records enable row level security;
alter table public.rate_limits enable row level security;
create policy waitlist_deny_client on public.waitlist for all to anon,authenticated using(false) with check(false);
create policy consent_deny_client on public.consent_records for all to anon,authenticated using(false) with check(false);
create policy limits_deny_client on public.rate_limits for all to anon,authenticated using(false) with check(false);
revoke all on public.waitlist,public.consent_records,public.rate_limits from public,anon,authenticated;
grant select,insert,update,delete on public.waitlist,public.consent_records,public.rate_limits to service_role;

create function public.consume_waitlist_limit(p_scope text,p_subject text,p_limit integer,p_seconds integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare used integer; window_start_at timestamptz;
begin
 if p_limit<1 or p_seconds<60 then raise exception 'Invalid limits'; end if;
 window_start_at:=pg_catalog.to_timestamp(floor(extract(epoch from now())/p_seconds)*p_seconds);
 insert into public.rate_limits(scope,subject_digest,window_start,request_count,expires_at)
 values(p_scope,p_subject,window_start_at,1,window_start_at+pg_catalog.make_interval(secs=>p_seconds)+interval '1 day')
 on conflict(scope,subject_digest,window_start) do update set request_count=public.rate_limits.request_count+1,updated_at=now()
 where public.rate_limits.request_count<p_limit returning request_count into used;
 return used is not null;
end; $$;
revoke all on function public.consume_waitlist_limit(text,text,integer,integer) from public,anon,authenticated;

create function public.join_waitlist(p_email text,p_subject_digest text,p_ip_truncated inet,p_token_digest text)
returns text language plpgsql security definer set search_path='' as $$
declare new_id uuid;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('waitlist:'||p_subject_digest,0));
 if not public.consume_waitlist_limit('waitlist-hour',p_subject_digest,5,3600) then return 'rate_limited'; end if;
 if not public.consume_waitlist_limit('waitlist-day',p_subject_digest,10,86400) then return 'rate_limited'; end if;
 insert into public.waitlist(normalized_email,unsubscribe_token_digest) values(p_email,p_token_digest)
 on conflict(normalized_email) do nothing returning id into new_id;
 if new_id is not null then
  insert into public.consent_records(waitlist_id,purpose,text_version,consent_text,ip_truncated)
  values(new_id,'waitlist','waitlist-v1-2026-10-30','Quero receber por e-mail notícias sobre o lançamento do Informação Protegida. Posso cancelar minha inscrição a qualquer momento.',p_ip_truncated);
 end if;
 return 'accepted'; -- mesma resposta e token candidato novo em duplicatas, sem revelar cadastro.
end; $$;
revoke all on function public.join_waitlist(text,text,inet,text) from public,anon,authenticated;
grant execute on function public.join_waitlist(text,text,inet,text) to service_role;

create function public.leave_waitlist(p_token_digest text,p_subject_digest text)
returns text language plpgsql security definer set search_path='' as $$
begin
 if not public.consume_waitlist_limit('unsubscribe-hour',p_subject_digest,20,3600) then return 'rate_limited'; end if;
 delete from public.waitlist where unsubscribe_token_digest=p_token_digest;
 return 'accepted';
end; $$;
revoke all on function public.leave_waitlist(text,text) from public,anon,authenticated;
grant execute on function public.leave_waitlist(text,text) to service_role;

create function public.cleanup_waitlist() returns void language plpgsql security definer set search_path='' as $$
begin
 delete from public.rate_limits where expires_at<now();
 delete from public.waitlist where created_at<now()-interval '180 days';
end; $$;
revoke all on function public.cleanup_waitlist() from public,anon,authenticated;
grant execute on function public.cleanup_waitlist() to service_role;
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('waitlist-retention','17 3 * * *','select public.cleanup_waitlist();');
commit;
