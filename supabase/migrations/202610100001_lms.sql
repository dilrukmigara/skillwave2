-- SkillWave: all authorization is enforced in Postgres, not browser role checks.
-- PostgreSQL gen_random_uuid() is built-in; no extra extension required.
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 full_name text not null default '', role text not null default 'student' check(role in ('student','admin','superadmin'))
);
create function public.new_student() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')); return new; end $$;
create trigger new_student after insert on auth.users for each row execute function public.new_student();
create table public.courses(id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', price numeric(12,2) not null default 0 check(price>=0), published boolean not null default false);
create table public.batches(id uuid primary key default gen_random_uuid(), course_id uuid not null references courses, name text not null, starts_on date, ends_on date, check(ends_on is null or starts_on is null or ends_on>=starts_on));
create table public.staff_assignments(user_id uuid references profiles, course_id uuid references courses, primary key(user_id,course_id));
create table public.enrollments(student_id uuid references profiles, course_id uuid references courses, active boolean not null default true, created_at timestamptz not null default now(), primary key(student_id,course_id));
create table public.batch_members(student_id uuid references profiles, batch_id uuid references batches, primary key(student_id,batch_id));
create table public.lessons(id uuid primary key default gen_random_uuid(), course_id uuid not null references courses, module text not null default 'Getting started', title text not null, youtube_id text not null check(youtube_id ~ '^[A-Za-z0-9_-]{11}$'), notes text not null default '', position integer not null default 0, is_free boolean not null default false, published boolean not null default false);
create table public.progress(student_id uuid references profiles, lesson_id uuid references lessons, completed_at timestamptz not null default now(), primary key(student_id,lesson_id));
create table public.live_sessions(id uuid primary key default gen_random_uuid(), batch_id uuid not null references batches, title text not null, starts_at timestamptz not null, meeting_url text not null check(meeting_url ~ '^https://'), recording_id text check(recording_id is null or recording_id ~ '^[A-Za-z0-9_-]{11}$'));
create table public.announcements(id uuid primary key default gen_random_uuid(), batch_id uuid not null references batches, title text not null, body text not null, created_at timestamptz not null default now());
create table public.assignments(id uuid primary key default gen_random_uuid(), batch_id uuid not null references batches, title text not null, instructions text not null, due_at timestamptz not null, is_final boolean not null default false);
create unique index one_final_per_batch on assignments(batch_id) where is_final;
create table public.submissions(id uuid primary key default gen_random_uuid(), assignment_id uuid not null references assignments, student_id uuid not null references profiles, file_path text not null, status text not null default 'submitted' check(status in ('submitted','revision','passed','failed')), marks integer check(marks between 0 and 100), feedback text not null default '', reviewed_by uuid references profiles, submitted_at timestamptz not null default now(), unique(assignment_id,student_id));
create table public.payments(id uuid primary key default gen_random_uuid(), student_id uuid not null references profiles, batch_id uuid not null references batches, file_path text not null, reference text not null, status text not null default 'pending' check(status in ('pending','approved','rejected')), feedback text not null default '', reviewed_by uuid references profiles, created_at timestamptz not null default now());
create unique index one_pending_payment on payments(student_id,batch_id) where status='pending';
create table public.certificate_requests(id uuid primary key default gen_random_uuid(), submission_id uuid not null unique references submissions, requested_by uuid not null references profiles, status text not null default 'pending' check(status in ('pending','returned','issued')), reason text not null default '', created_at timestamptz not null default now());
create table public.certificates(id uuid primary key default gen_random_uuid(), request_id uuid not null references certificate_requests, student_id uuid not null references profiles, student_name text not null, course_title text not null, issued_by uuid not null references profiles, issued_at timestamptz not null default now(), revoked_at timestamptz, revocation_reason text, signatory text not null default '', signatory_title text not null default '');
create unique index one_valid_certificate_per_request on certificates(request_id) where revoked_at is null;
create table public.settings(key text primary key, value jsonb not null);
insert into settings values('bank','{"bank":"","account_name":"","account_number":"","branch":""}'),('certificate','{"signatory":"","title":""}');
create table public.audit_log(id bigint generated always as identity primary key, actor uuid, action text not null, entity text not null, record_id text, created_at timestamptz not null default now());
create table public.exams(id uuid primary key default gen_random_uuid(), batch_id uuid not null references batches, title text not null, opens_at timestamptz not null, closes_at timestamptz not null, duration_minutes integer not null check(duration_minutes between 1 and 300), pass_mark integer not null default 50 check(pass_mark between 0 and 100), max_attempts integer not null default 1 check(max_attempts between 1 and 10), published boolean not null default false, check(closes_at>opens_at));
create table public.exam_questions(id uuid primary key default gen_random_uuid(), exam_id uuid not null references exams, prompt text not null, kind text not null check(kind in ('mcq','written')), options jsonb not null default '[]', points integer not null default 1 check(points>0), position integer not null default 0, check(kind!='mcq' or jsonb_array_length(options)>=2));
create table public.exam_keys(question_id uuid primary key references exam_questions on delete cascade, correct_index integer not null check(correct_index>=0));
create table public.exam_attempts(id uuid primary key default gen_random_uuid(), exam_id uuid not null references exams, student_id uuid not null references profiles, started_at timestamptz not null default now(), deadline timestamptz not null, submitted_at timestamptz, answers jsonb not null default '{}', score numeric, status text not null default 'in_progress' check(status in ('in_progress','review','passed','failed')), feedback text not null default '');
create unique index one_running_attempt on exam_attempts(student_id,exam_id) where status='in_progress';
create function public.is_super() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from profiles where id=auth.uid() and role='superadmin') $$;
create function public.manages(cid uuid) returns boolean language sql stable security definer set search_path=public as $$ select is_super() or exists(select 1 from staff_assignments s join profiles p on p.id=s.user_id where s.user_id=auth.uid() and s.course_id=cid and p.role='admin') $$;
create function public.enrolled(cid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from enrollments where student_id=auth.uid() and course_id=cid and active) $$;
create function public.batch_access(bid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from batches b where b.id=bid and (manages(b.course_id) or (enrolled(b.course_id) and exists(select 1 from batch_members m where m.batch_id=b.id and m.student_id=auth.uid())))) $$;
create function public.manages_batch(bid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from batches where id=bid and manages(course_id)) $$;
-- RLS is enabled on every application table; special transitions have no client write policy.
do $$ declare t text; begin foreach t in array array['profiles','courses','batches','staff_assignments','enrollments','batch_members','lessons','progress','live_sessions','announcements','assignments','submissions','payments','certificate_requests','certificates','settings','audit_log','exams','exam_questions','exam_keys','exam_attempts'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;
create policy profile_read on profiles for select to authenticated using(id=auth.uid() or is_super() or exists(select 1 from enrollments e where e.student_id=profiles.id and manages(e.course_id)) or exists(select 1 from payments p join batches b on b.id=p.batch_id where p.student_id=profiles.id and manages(b.course_id)));
create policy courses_read on courses for select using(published or enrolled(id) or manages(id));
create policy courses_write on courses for all to authenticated using(manages(id)) with check(manages(id));
create policy batches_read on batches for select using(exists(select 1 from courses c where c.id=course_id and c.published) or batch_access(id));
create policy batches_write on batches for all to authenticated using(manages(course_id)) with check(manages(course_id));
create policy staff_read on staff_assignments for select to authenticated using(user_id=auth.uid() or is_super());
create policy staff_write on staff_assignments for all to authenticated using(is_super()) with check(is_super());
create policy enrollment_read on enrollments for select to authenticated using(student_id=auth.uid() or manages(course_id));
create policy enrollment_write on enrollments for all to authenticated using(is_super()) with check(is_super());
create policy members_read on batch_members for select to authenticated using(student_id=auth.uid() or manages_batch(batch_id));
create policy members_write on batch_members for all to authenticated using(is_super()) with check(is_super());
create policy lessons_read on lessons for select using(manages(course_id) or (published and (enrolled(course_id) or (is_free and exists(select 1 from courses c where c.id=course_id and c.published)))));
create policy lessons_write on lessons for all to authenticated using(manages(course_id)) with check(manages(course_id));
create policy progress_read on progress for select to authenticated using(student_id=auth.uid());
create policy progress_write on progress for all to authenticated using(student_id=auth.uid()) with check(student_id=auth.uid() and exists(select 1 from lessons l where l.id=lesson_id and enrolled(l.course_id)));
do $$ declare t text; begin foreach t in array array['live_sessions','announcements','assignments'] loop execute format('create policy batch_read on %I for select to authenticated using(batch_access(batch_id))',t); execute format('create policy staff_write on %I for all to authenticated using(manages_batch(batch_id)) with check(manages_batch(batch_id))',t); end loop; end $$;
create policy submissions_read on submissions for select to authenticated using(student_id=auth.uid() or exists(select 1 from assignments a where a.id=assignment_id and manages_batch(a.batch_id)));
create policy payments_read on payments for select to authenticated using(student_id=auth.uid() or manages_batch(batch_id));
create policy requests_read on certificate_requests for select to authenticated using(exists(select 1 from submissions s where s.id=submission_id and (s.student_id=auth.uid() or exists(select 1 from assignments a where a.id=s.assignment_id and manages_batch(a.batch_id)))));
create policy certificates_read on certificates for select to authenticated using(student_id=auth.uid() or is_super() or exists(select 1 from certificate_requests r where r.id=request_id));
create policy settings_read on settings for select using(true);
create policy settings_write on settings for all to authenticated using(is_super()) with check(is_super());
create policy audit_read on audit_log for select to authenticated using(is_super());
create policy exams_read on exams for select to authenticated using(manages_batch(batch_id) or (published and batch_access(batch_id)));
create policy exams_write on exams for all to authenticated using(manages_batch(batch_id)) with check(manages_batch(batch_id));
create policy questions_read on exam_questions for select to authenticated using(exists(select 1 from exams e where e.id=exam_id and (manages_batch(e.batch_id) or (e.published and batch_access(e.batch_id) and exists(select 1 from exam_attempts a where a.exam_id=e.id and a.student_id=auth.uid() and a.status='in_progress' and a.deadline>now())))));
create policy questions_write on exam_questions for all to authenticated using(exists(select 1 from exams e where e.id=exam_id and manages_batch(e.batch_id))) with check(exists(select 1 from exams e where e.id=exam_id and manages_batch(e.batch_id)));
create policy keys_staff_only on exam_keys for all to authenticated using(exists(select 1 from exam_questions q join exams e on e.id=q.exam_id where q.id=question_id and manages_batch(e.batch_id))) with check(exists(select 1 from exam_questions q join exams e on e.id=q.exam_id where q.id=question_id and manages_batch(e.batch_id)));
create policy attempts_read on exam_attempts for select to authenticated using(student_id=auth.uid() or exists(select 1 from exams e where e.id=exam_id and manages_batch(e.batch_id)));
-- All consequential writes generate an audit event; no user may alter the audit trail.
create function public.audit_change() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into audit_log(actor,action,entity,record_id) values(auth.uid(),TG_OP,TG_TABLE_NAME,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id',to_jsonb(new)->>'student_id',to_jsonb(new)->>'user_id',to_jsonb(new)->>'key')); return coalesce(new,old); end $$;
do $$ declare t text; begin foreach t in array array['profiles','courses','batches','staff_assignments','enrollments','batch_members','payments','submissions','certificate_requests','certificates','settings','exams','exam_attempts'] loop execute format('create trigger audit after insert or update or delete on %I for each row execute function audit_change()',t); end loop; end $$;
create function public.set_user_role(uid uuid, new_role text) returns void language plpgsql security definer set search_path=public as $$ begin if not is_super() then raise exception 'Superadmin only'; end if; if uid=auth.uid() then raise exception 'Cannot change your own role'; end if; update profiles set role=new_role where id=uid; end $$;
create function public.update_name(new_name text) returns void language plpgsql security definer set search_path=public as $$ begin if length(trim(new_name))<2 then raise exception 'Enter your full name'; end if; update profiles set full_name=trim(new_name) where id=auth.uid(); end $$;
create function public.submit_payment(bid uuid, path text, bank_reference text) returns void language plpgsql security definer set search_path=public as $$ begin
 if auth.uid() is null or path not like auth.uid()::text||'/payments/%' or length(trim(bank_reference))<2 then raise exception 'Invalid payment'; end if;
 if not exists(select 1 from batches b join courses c on c.id=b.course_id where b.id=bid and c.published) then raise exception 'Course unavailable'; end if;
 if not exists(select 1 from storage.objects where bucket_id='lms-private' and name=path and owner_id=auth.uid()::text) then raise exception 'Upload the payment slip first'; end if;
 insert into payments(student_id,batch_id,file_path,reference) values(auth.uid(),bid,path,bank_reference); end $$;
create function public.review_payment(pid uuid, approve boolean, note text) returns void language plpgsql security definer set search_path=public as $$ declare p payments; cid uuid; begin
 select * into p from payments where id=pid for update; if p.id is null or not manages_batch(p.batch_id) then raise exception 'Access denied'; end if;
 if p.status!='pending' then raise exception 'Payment already reviewed'; end if;
 if not approve and length(trim(note))=0 then raise exception 'Rejection reason required'; end if;
 update payments set status=case when approve then 'approved' else 'rejected' end,feedback=note,reviewed_by=auth.uid() where id=pid;
 if approve then select course_id into cid from batches where id=p.batch_id; insert into enrollments values(p.student_id,cid,true,now()) on conflict(student_id,course_id) do update set active=true; insert into batch_members values(p.student_id,p.batch_id) on conflict do nothing; end if; end $$;
create function public.submit_assignment(aid uuid,path text) returns void language plpgsql security definer set search_path=public as $$ declare a assignments; previous submissions; begin
 select * into a from assignments where id=aid for update;
 if a.id is null or not batch_access(a.batch_id) or not exists(select 1 from batch_members where student_id=auth.uid() and batch_id=a.batch_id) then raise exception 'Access denied'; end if;
 if now()>a.due_at then raise exception 'Deadline has passed'; end if;
 if path not like auth.uid()::text||'/assignments/%' or not exists(select 1 from storage.objects where bucket_id='lms-private' and name=path and owner_id=auth.uid()::text) then raise exception 'Upload your work first'; end if;
 select * into previous from submissions where student_id=auth.uid() and assignment_id=aid for update;
 if previous.id is not null and previous.status!='revision' then raise exception 'Already submitted; wait for your review'; end if;
 insert into submissions(assignment_id,student_id,file_path) values(aid,auth.uid(),path) on conflict(assignment_id,student_id) do update set file_path=excluded.file_path,status='submitted',marks=null,feedback='',reviewed_by=null,submitted_at=now(); end $$;
create function public.review_submission(sid uuid,result text,score integer,note text) returns void language plpgsql security definer set search_path=public as $$ declare s submissions; begin
 select * into s from submissions where id=sid for update;
 if s.id is null or not exists(select 1 from assignments a where a.id=s.assignment_id and manages_batch(a.batch_id)) then raise exception 'Access denied'; end if;
 if result not in ('passed','failed','revision') or score not between 0 and 100 or score is null then raise exception 'Invalid review'; end if;
 if exists(select 1 from certificate_requests where submission_id=sid and status in ('pending','issued')) then raise exception 'Certificate request must be resolved first'; end if;
 update submissions set status=result,marks=score,feedback=note,reviewed_by=auth.uid() where id=sid; end $$;
create function public.request_certificate(sid uuid) returns void language plpgsql security definer set search_path=public as $$ declare s submissions; begin
 select * into s from submissions where id=sid for update;
 if s.status is distinct from 'passed' or not exists(select 1 from assignments a where a.id=s.assignment_id and a.is_final and manages_batch(a.batch_id)) then raise exception 'A reviewed, passed final assignment is required'; end if;
 insert into certificate_requests(submission_id,requested_by) values(sid,auth.uid()) on conflict(submission_id) do update set status='pending',reason='',requested_by=auth.uid() where certificate_requests.status='returned'; end $$;
create function public.issue_certificate(rid uuid,approve boolean,note text) returns void language plpgsql security definer set search_path=public as $$ declare r certificate_requests; s submissions; cname text; pname text; begin
 if not is_super() then raise exception 'Only Superadmin can issue certificates'; end if;
 select * into r from certificate_requests where id=rid for update;
 if r.status is distinct from 'pending' then raise exception 'Request is not pending'; end if;
 select * into s from submissions where id=r.submission_id for update;
 if approve then
 if s.status!='passed' or not exists(select 1 from assignments where id=s.assignment_id and is_final) then raise exception 'Final assignment must be passed'; end if;
 select c.title into cname from assignments a join batches b on b.id=a.batch_id join courses c on c.id=b.course_id where a.id=s.assignment_id;
 select full_name into pname from profiles where id=s.student_id;
 if length(trim(pname))<2 then raise exception 'Student full name is required'; end if;
 insert into certificates(request_id,student_id,student_name,course_title,issued_by,signatory,signatory_title) values(rid,s.student_id,pname,cname,auth.uid(),coalesce((select value->>'signatory' from settings where key='certificate'),''),coalesce((select value->>'title' from settings where key='certificate'),''));
 elsif length(trim(note))=0 then raise exception 'Return reason required'; end if;
 update certificate_requests set status=case when approve then 'issued' else 'returned' end,reason=note where id=rid; end $$;
create function public.revoke_certificate(cid uuid,note text) returns void language plpgsql security definer set search_path=public as $$ begin if not is_super() or length(trim(note))=0 then raise exception 'Superadmin and reason required'; end if; update certificates set revoked_at=now(),revocation_reason=note where id=cid and revoked_at is null; if found then update certificate_requests set status='returned',reason='Certificate revoked: '||note where id=(select request_id from certificates where id=cid); end if; end $$;
create function public.verify_certificate(cid uuid) returns table(id uuid,student_name text,course_title text,issued_at timestamptz,valid boolean) language sql stable security definer set search_path=public as $$ select id,student_name,course_title,issued_at,revoked_at is null from certificates where id=cid $$;
create function public.start_exam(eid uuid) returns uuid language plpgsql security definer set search_path=public as $$ declare e exams; aid uuid; begin
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||eid::text,0));
 select * into e from exams where id=eid;
 if e.id is null or not e.published or not batch_access(e.batch_id) or not exists(select 1 from batch_members where batch_id=e.batch_id and student_id=auth.uid()) then raise exception 'Exam unavailable'; end if;
 select id into aid from exam_attempts where exam_id=eid and student_id=auth.uid() and status='in_progress'; if aid is not null then return aid; end if;
 if now()<e.opens_at or now()>=e.closes_at then raise exception 'Exam unavailable'; end if;
 if (select count(*) from exam_attempts where exam_id=eid and student_id=auth.uid())>=e.max_attempts then raise exception 'Attempt limit reached'; end if;
 if not exists(select 1 from exam_questions where exam_id=eid) or exists(select 1 from exam_questions q left join exam_keys k on k.question_id=q.id where q.exam_id=eid and q.kind='mcq' and (k.question_id is null or k.correct_index>=jsonb_array_length(q.options))) then raise exception 'Exam questions are not ready'; end if;
 insert into exam_attempts(exam_id,student_id,deadline) values(eid,auth.uid(),least(e.closes_at,now()+make_interval(mins=>e.duration_minutes))) returning id into aid; return aid; end $$;
create function public.save_exam_answers(aid uuid,response jsonb,finish boolean default false) returns void language plpgsql security definer set search_path=public as $$ declare a exam_attempts; earned numeric; total numeric; written boolean; pass integer; begin
 select * into a from exam_attempts where id=aid for update;
 if a.student_id is distinct from auth.uid() or a.status!='in_progress' then raise exception 'Attempt unavailable'; end if;
 if jsonb_typeof(response)!='object' then raise exception 'Invalid answers'; end if;
 if now()<=a.deadline then update exam_attempts set answers=response where id=aid; a.answers=response; end if;
 if finish or now()>a.deadline then
 select coalesce(sum(q.points),0),coalesce(sum(case when q.kind='mcq' and (a.answers->>q.id::text)=k.correct_index::text then q.points else 0 end),0),coalesce(bool_or(q.kind='written'),false) into total,earned,written from exam_questions q left join exam_keys k on k.question_id=q.id where q.exam_id=a.exam_id;
 select pass_mark into pass from exams where id=a.exam_id;
 update exam_attempts set submitted_at=now(),score=case when written then null else round(100*earned/nullif(total,0),2) end,status=case when written then 'review' when 100*earned/nullif(total,0)>=pass then 'passed' else 'failed' end where id=aid; end if; end $$;
create function public.review_exam(aid uuid,score_percent integer,note text) returns void language plpgsql security definer set search_path=public as $$ declare a exam_attempts; e exams; begin select * into a from exam_attempts where id=aid for update; select * into e from exams where id=a.exam_id; if not manages_batch(e.batch_id) or a.status!='review' or score_percent is null or score_percent not between 0 and 100 then raise exception 'Invalid review'; end if; update exam_attempts set score=score_percent,status=case when score_percent>=e.pass_mark then 'passed' else 'failed' end,feedback=note where id=aid; end $$;
-- Freeze questions/settings once an attempt exists so marking remains reproducible.
create function public.freeze_exam() returns trigger language plpgsql security definer set search_path=public as $$ declare eid uuid; begin if TG_TABLE_NAME='exams' then eid=old.id; elsif TG_TABLE_NAME='exam_keys' then select exam_id into eid from exam_questions where id=coalesce(new.question_id,old.question_id); else eid=coalesce(new.exam_id,old.exam_id); end if; if exists(select 1 from exam_attempts where exam_id=eid) or (TG_TABLE_NAME='exam_questions' and TG_OP='UPDATE' and exists(select 1 from exam_attempts where exam_id=(to_jsonb(old)->>'exam_id')::uuid)) then raise exception 'Exam already has attempts; create a new exam to change it'; end if; return coalesce(new,old); end $$;
create trigger freeze_exam before update or delete on exams for each row execute function freeze_exam();
create trigger freeze_questions before insert or update or delete on exam_questions for each row execute function freeze_exam();
create trigger freeze_keys before insert or update or delete on exam_keys for each row execute function freeze_exam();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('lms-private','lms-private',false,10485760,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
create policy upload_own on storage.objects for insert to authenticated with check(bucket_id='lms-private' and (storage.foldername(name))[1]=auth.uid()::text and (storage.foldername(name))[2] in ('payments','assignments'));
create policy read_authorized_file on storage.objects for select to authenticated using(bucket_id='lms-private' and ((storage.foldername(name))[1]=auth.uid()::text or is_super() or exists(select 1 from payments p where p.file_path=name and manages_batch(p.batch_id)) or exists(select 1 from submissions s join assignments a on a.id=s.assignment_id where s.file_path=name and manages_batch(a.batch_id))));
-- No public execute permission for state-changing RPCs.
revoke execute on all functions in schema public from public,anon;
grant execute on function public.is_super(),public.manages(uuid),public.enrolled(uuid),public.batch_access(uuid),public.manages_batch(uuid) to anon,authenticated;
grant execute on function public.verify_certificate(uuid) to anon,authenticated;
grant execute on function public.set_user_role(uuid,text),public.update_name(text),public.submit_payment(uuid,text,text),public.review_payment(uuid,boolean,text),public.submit_assignment(uuid,text),public.review_submission(uuid,text,integer,text),public.request_certificate(uuid),public.issue_certificate(uuid,boolean,text),public.revoke_certificate(uuid,text),public.start_exam(uuid),public.save_exam_answers(uuid,jsonb,boolean),public.review_exam(uuid,integer,text) to authenticated;
-- Atomically store question and answer key; no half-created MCQ questions.
create function public.add_exam_question(eid uuid,prompt_text text,question_kind text,choices jsonb,correct integer,weight integer,sort_order integer) returns void language plpgsql security definer set search_path=public as $$ declare qid uuid; begin
 if not exists(select 1 from exams where id=eid and manages_batch(batch_id)) then raise exception 'Access denied'; end if;
 if question_kind='mcq' and (correct is null or correct<0 or correct>=jsonb_array_length(choices)) then raise exception 'Choose a valid correct answer'; end if;
 insert into exam_questions(exam_id,prompt,kind,options,points,position) values(eid,prompt_text,question_kind,choices,weight,sort_order) returning id into qid;
 if question_kind='mcq' then insert into exam_keys values(qid,correct); end if; end $$;
revoke execute on function public.add_exam_question(uuid,text,text,jsonb,integer,integer,integer) from public,anon;
grant execute on function public.add_exam_question(uuid,text,text,jsonb,integer,integer,integer) to authenticated;

-- Explicit Data API privileges, independent of project default privileges.
grant usage on schema public to anon, authenticated;
grant select on public.courses,public.batches,public.lessons,public.settings to anon;
grant select on public.profiles,public.courses,public.batches,public.staff_assignments,public.enrollments,public.batch_members,public.lessons,public.progress,public.live_sessions,public.announcements,public.assignments,public.submissions,public.payments,public.certificate_requests,public.certificates,public.settings,public.audit_log,public.exams,public.exam_questions,public.exam_keys,public.exam_attempts to authenticated;
grant insert,update,delete on public.courses,public.batches,public.staff_assignments,public.enrollments,public.batch_members,public.lessons,public.progress,public.live_sessions,public.announcements,public.assignments,public.settings,public.exams,public.exam_questions,public.exam_keys to authenticated;
-- No direct client mutation grants/policies for payments, results, roles or certificates.
create index batches_course_idx on batches(course_id);
create index staff_course_idx on staff_assignments(course_id);
create index enrollment_course_idx on enrollments(course_id);
create index member_batch_idx on batch_members(batch_id);
create index lessons_course_order_idx on lessons(course_id,position);
create index progress_lesson_idx on progress(lesson_id);
create index live_batch_time_idx on live_sessions(batch_id,starts_at);
create index announcement_batch_idx on announcements(batch_id);
create index assignment_batch_idx on assignments(batch_id);
create index submission_student_idx on submissions(student_id);
create index submission_reviewer_idx on submissions(reviewed_by);
create index payment_batch_idx on payments(batch_id);
create index payment_student_idx on payments(student_id);
create index payment_reviewer_idx on payments(reviewed_by);
create index request_author_idx on certificate_requests(requested_by);
create index certificate_student_idx on certificates(student_id);
create index certificate_request_idx on certificates(request_id);
create index certificate_issuer_idx on certificates(issued_by);
create index exam_batch_idx on exams(batch_id);
create index question_exam_idx on exam_questions(exam_id);
create index attempt_exam_idx on exam_attempts(exam_id);
create index attempt_student_idx on exam_attempts(student_id);
create index audit_time_idx on audit_log(created_at desc);
