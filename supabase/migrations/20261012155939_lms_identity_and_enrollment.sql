-- Privileged lookups live outside exposed API schemas and only inspect auth.uid().
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  created_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('lecturer', 'superadmin'))
);
-- A user without a staff record is a student. Metadata cannot grant a role.
create function private.current_role() returns text language sql stable security definer set search_path = '' as $$
  select case when auth.uid() is null then null else coalesce((select role from public.user_roles where user_id = auth.uid()), 'student') end;
$$;
revoke all on function private.current_role() from public, anon;
grant execute on function private.current_role() to authenticated;

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 150),
  description text not null default '' check (char_length(description) <= 2000),
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  title text not null check (char_length(title) between 2 and 120),
  lecturer_id uuid references public.profiles(id) on delete restrict,
  starts_on date,
  mode text not null check (mode in ('online','physical','hybrid')),
  enrollment_open boolean not null default true,
  created_at timestamptz not null default now()
);
create index batches_course_idx on public.batches(course_id);
create index batches_lecturer_idx on public.batches(lecturer_id);
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete restrict,
  batch_id uuid not null references public.batches(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','active','rejected','revoked')),
  created_at timestamptz not null default now(),
  unique(student_id, batch_id)
);
create index enrollments_batch_idx on public.enrollments(batch_id);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.courses enable row level security;
alter table public.batches enable row level security;
alter table public.enrollments enable row level security;

revoke all on public.profiles, public.user_roles, public.courses, public.batches, public.enrollments from anon, authenticated;
grant select on public.profiles, public.user_roles, public.courses, public.batches, public.enrollments to authenticated;
grant insert(id,full_name,email) on public.profiles to authenticated;
grant insert(user_id,role), delete on public.user_roles to authenticated;
grant insert(title,description,published), update(title,description,published) on public.courses to authenticated;
grant insert(course_id,title,lecturer_id,starts_on,mode,enrollment_open), update(lecturer_id,enrollment_open) on public.batches to authenticated;
grant insert(student_id,batch_id), update(status) on public.enrollments to authenticated;

create policy profiles_self_create on public.profiles for insert to authenticated with check (
  id = (select auth.uid()) and email = (select auth.jwt()->>'email')
);
create policy profiles_visible on public.profiles for select to authenticated using (
  id = (select auth.uid()) or (select private.current_role()) = 'superadmin'
  or ((select private.current_role()) = 'lecturer' and exists (
    select 1 from public.enrollments e join public.batches b on b.id = e.batch_id
    where e.student_id = profiles.id and b.lecturer_id = (select auth.uid()) and e.status = 'active'
  ))
);
create policy roles_visible on public.user_roles for select to authenticated using (user_id = (select auth.uid()) or (select private.current_role()) = 'superadmin');
-- Superadmins can appoint/revoke lecturers. Creating/removing superadmins requires an owner-side operation.
create policy appoint_lecturer on public.user_roles for insert to authenticated with check ((select private.current_role()) = 'superadmin' and role = 'lecturer' and user_id <> (select auth.uid()));
create policy revoke_lecturer on public.user_roles for delete to authenticated using ((select private.current_role()) = 'superadmin' and role = 'lecturer' and user_id <> (select auth.uid()));

create policy courses_visible on public.courses for select to authenticated using (published or (select private.current_role()) = 'superadmin');
create policy courses_create on public.courses for insert to authenticated with check ((select private.current_role()) = 'superadmin');
create policy courses_update on public.courses for update to authenticated using ((select private.current_role()) = 'superadmin') with check ((select private.current_role()) = 'superadmin');
-- Batch metadata is a catalog; it contains no private lesson or meeting URLs.
create policy batches_visible on public.batches for select to authenticated using (
  (select private.current_role()) = 'superadmin' or ((select private.current_role()) = 'lecturer' and lecturer_id = (select auth.uid()))
  or exists(select 1 from public.courses c where c.id = batches.course_id and c.published)
);
create policy batches_create on public.batches for insert to authenticated with check ((select private.current_role()) = 'superadmin');
create policy batches_update on public.batches for update to authenticated using ((select private.current_role()) = 'superadmin') with check ((select private.current_role()) = 'superadmin');
create policy enrollments_visible on public.enrollments for select to authenticated using (
  student_id = (select auth.uid()) or (select private.current_role()) = 'superadmin'
  or ((select private.current_role()) = 'lecturer' and exists(select 1 from public.batches b where b.id = enrollments.batch_id and b.lecturer_id = (select auth.uid())))
);
create policy enrollment_request on public.enrollments for insert to authenticated with check (
  student_id = (select auth.uid()) and (select private.current_role()) = 'student' and status = 'pending'
  and exists(select 1 from public.batches b join public.courses c on c.id = b.course_id where b.id = enrollments.batch_id and b.enrollment_open and c.published)
);
create policy enrollment_decide on public.enrollments for update to authenticated using ((select private.current_role()) = 'superadmin') with check ((select private.current_role()) = 'superadmin');

-- Database invariant: only appointed lecturers may be assigned to a batch.
create function private.check_batch_lecturer() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.lecturer_id is not null and not exists(select 1 from public.user_roles where user_id = new.lecturer_id and role = 'lecturer') then
    raise exception 'Choose an appointed lecturer.' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function private.check_batch_lecturer() from public, anon, authenticated;
create trigger check_batch_lecturer before insert or update of lecturer_id on public.batches for each row execute function private.check_batch_lecturer();
-- Revocation immediately removes teaching permissions; stale assignments are inert because policies check current_role.
