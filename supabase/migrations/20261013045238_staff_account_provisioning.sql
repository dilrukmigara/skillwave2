-- Staff directory contains identities only. Passwords remain in Supabase Auth.
create table public.staff_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email text not null unique check (char_length(email) <= 254 and email = lower(email)),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index staff_accounts_creator_idx on public.staff_accounts(created_by);
alter table public.staff_accounts enable row level security;
revoke all on public.staff_accounts from public, anon, authenticated;
grant select on public.staff_accounts to authenticated;
create policy staff_directory_read on public.staff_accounts for select to authenticated using (
  user_id = (select auth.uid()) or (select private.current_role()) = 'superadmin'
);
grant select, insert, delete on public.profiles, public.user_roles, public.staff_accounts to service_role;

-- Atomic provisioning after Auth creation. Only the private server credential can call it.
create function public.provision_staff(p_user_id uuid, p_email text, p_name text, p_role text, p_creator uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_role = 'lecturer' then
    if p_creator is null or not exists(select 1 from public.user_roles where user_id = p_creator and role = 'superadmin') then
      raise exception 'Superadmin access required';
    end if;
  elsif p_role = 'superadmin' then
    if p_creator is not null or exists(select 1 from public.user_roles where role = 'superadmin') then
      raise exception 'Initial owner already configured';
    end if;
  else
    raise exception 'Invalid staff role';
  end if;
  insert into public.profiles(id, full_name, email) values (p_user_id, p_name, lower(p_email));
  insert into public.user_roles(user_id, role) values (p_user_id, p_role);
  insert into public.staff_accounts(user_id, email, created_by) values (p_user_id, lower(p_email), p_creator);
end;
$$;
revoke all on function public.provision_staff(uuid,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.provision_staff(uuid,text,text,text,uuid) to service_role;
