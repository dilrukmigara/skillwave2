import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const sql = (
  await readFile(
    new URL("../supabase/migrations/202610100001_lms.sql", import.meta.url),
    "utf8",
  )
).replace("create extension if not exists pgcrypto;", "");
const uid = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const ids = {
  super: uid(1),
  admin: uid(2),
  student: uid(3),
  other: uid(4),
  outside: uid(5),
  course: uid(10),
  batch: uid(11),
  othercourse: uid(12),
  otherbatch: uid(13),
  lesson: uid(14),
  final: uid(15),
  exam: uid(16),
};
async function fixture() {
  const db = new PGlite();
  await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;
create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,owner_id text);
alter table storage.objects enable row level security;
create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
${sql}
grant usage on schema public,auth,storage to anon,authenticated;grant select,insert,update,delete on all tables in schema public,storage to authenticated;grant select on all tables in schema public to anon;grant usage on all sequences in schema public to authenticated;
insert into auth.users(id,raw_user_meta_data) values('${ids.super}','{"full_name":"Super Admin"}'),('${ids.admin}','{"full_name":"Course Admin"}'),('${ids.student}','{"full_name":"Test Learner"}'),('${ids.other}','{"full_name":"Other Student"}'),('${ids.outside}','{"full_name":"Unassigned Admin"}');
update profiles set role='superadmin' where id='${ids.super}';update profiles set role='admin' where id in ('${ids.admin}','${ids.outside}');
insert into courses(id,title,published,price) values('${ids.course}','Web Master',true,5000),('${ids.othercourse}','Robotics',true,5000);
insert into batches(id,course_id,name) values('${ids.batch}','${ids.course}','October'),('${ids.otherbatch}','${ids.othercourse}','November');
insert into staff_assignments values('${ids.admin}','${ids.course}');
insert into lessons(id,course_id,title,youtube_id,published) values('${ids.lesson}','${ids.course}','HTML','dQw4w9WgXcQ',true);
insert into assignments(id,batch_id,title,instructions,due_at,is_final) values('${ids.final}','${ids.batch}','Final project','Build a project',now()+interval '1 day',true);
`);
  return db;
}
async function as(db, user, role = "authenticated") {
  await db.exec(
    `reset role;set role ${role};select set_config('request.jwt.claim.sub','${user || ""}',false)`,
  );
}
async function count(db, table) {
  return Number(
    (await db.query(`select count(*) as n from ${table}`)).rows[0].n,
  );
}
async function file(db, user, category) {
  const path = `${user}/${category}/test.pdf`;
  await db.query(
    "insert into storage.objects(bucket_id,name,owner_id) values($1,$2,$3)",
    ["lms-private", path, user],
  );
  return path;
}
async function enroll(db) {
  await db.exec(
    `reset role;insert into enrollments(student_id,course_id) values('${ids.student}','${ids.course}');insert into batch_members values('${ids.student}','${ids.batch}')`,
  );
}
test("RLS prevents self-promotion and unauthorized content access", async () => {
  const db = await fixture();
  try {
    await as(db, ids.student);
    assert.equal(await count(db, "lessons"), 0);
    await db.exec(
      `update profiles set role='superadmin' where id='${ids.student}'`,
    );
    assert.equal(
      (await db.query("select role from profiles where id=$1", [ids.student]))
        .rows[0].role,
      "student",
    );
    await assert.rejects(
      db.query("select set_user_role($1,$2)", [ids.student, "superadmin"]),
    );
    await assert.rejects(
      db.exec(
        `insert into enrollments(student_id,course_id) values('${ids.student}','${ids.course}')`,
      ),
    );
    await enroll(db);
    await as(db, ids.student);
    assert.equal(await count(db, "lessons"), 1);
    await as(db, ids.other);
    assert.equal(await count(db, "lessons"), 0);
    await as(db, ids.outside);
    assert.equal(await count(db, "submissions"), 0);
  } finally {
    await db.close();
  }
});
test("payment review grants lifetime course and batch access, once only", async () => {
  const db = await fixture();
  try {
    await as(db, ids.student);
    const path = await file(db, ids.student, "payments");
    await db.query("select submit_payment($1,$2,$3)", [
      ids.batch,
      path,
      "BANK-123",
    ]);
    const pid = (await db.query("select id from payments")).rows[0].id;
    await assert.rejects(
      db.query("select review_payment($1,true,$2)", [pid, "Fake approval"]),
    );
    await as(db, ids.outside);
    assert.equal(await count(db, "payments"), 0);
    await assert.rejects(
      db.query("select review_payment($1,true,$2)", [pid, "Unauthorized"]),
    );
    await as(db, ids.admin);
    assert.equal(await count(db, "payments"), 1);
    await db.query("select review_payment($1,true,$2)", [
      pid,
      "Verified in bank",
    ]);
    await assert.rejects(
      db.query("select review_payment($1,true,$2)", [pid, "Duplicate"]),
    );
    await as(db, ids.student);
    assert.equal(await count(db, "lessons"), 1);
    assert.equal(await count(db, "batch_members"), 1);
    await as(db, ids.super);
    await db.exec(
      `delete from batch_members where student_id='${ids.student}'`,
    );
    await as(db, ids.student);
    assert.equal(await count(db, "lessons"), 1);
    assert.equal(await count(db, "assignments"), 0);
  } finally {
    await db.close();
  }
});
test("certificate needs passed final, Admin request and Superadmin issue; duplicate blocked", async () => {
  const db = await fixture();
  try {
    await enroll(db);
    await as(db, ids.student);
    const path = await file(db, ids.student, "assignments");
    await db.query("select submit_assignment($1,$2)", [ids.final, path]);
    const sid = (await db.query("select id from submissions")).rows[0].id;
    await assert.rejects(db.query("select request_certificate($1)", [sid]));
    await as(db, ids.admin);
    await assert.rejects(db.query("select request_certificate($1)", [sid]));
    await db.query("select review_submission($1,$2,$3,$4)", [
      sid,
      "passed",
      85,
      "Meets criteria",
    ]);
    await db.query("select request_certificate($1)", [sid]);
    const rid = (await db.query("select id from certificate_requests")).rows[0]
      .id;
    await assert.rejects(
      db.query("select issue_certificate($1,true,$2)", [
        rid,
        "Admin cannot issue",
      ]),
    );
    await as(db, ids.super);
    await db.query("select issue_certificate($1,true,$2)", [rid, "Approved"]);
    await assert.rejects(
      db.query("select issue_certificate($1,true,$2)", [rid, "Duplicate"]),
    );
    const cid = (await db.query("select id from certificates")).rows[0].id;
    assert.equal(await count(db, "certificates"), 1);
    await as(db, "", "anon");
    assert.equal(
      (await db.query("select * from verify_certificate($1)", [cid])).rows[0]
        .valid,
      true,
    );
    assert.equal(await count(db, "profiles"), 0);
    await as(db, ids.super);
    await db.query("select revoke_certificate($1,$2)", [
      cid,
      "Correction required",
    ]);
    await as(db, "", "anon");
    assert.equal(
      (await db.query("select * from verify_certificate($1)", [cid])).rows[0]
        .valid,
      false,
    );
  } finally {
    await db.close();
  }
});
test("private uploads cannot be read across students; revisions and deadlines enforced", async () => {
  const db = await fixture();
  try {
    await enroll(db);
    await as(db, ids.student);
    const path = await file(db, ids.student, "assignments");
    await db.query("select submit_assignment($1,$2)", [ids.final, path]);
    await assert.rejects(
      db.query("select submit_assignment($1,$2)", [ids.final, path]),
    );
    const sid = (await db.query("select id from submissions")).rows[0].id;
    await as(db, ids.other);
    assert.equal(await count(db, "storage.objects"), 0);
    assert.equal(await count(db, "submissions"), 0);
    await as(db, ids.admin);
    assert.equal(await count(db, "storage.objects"), 1);
    await db.query("select review_submission($1,$2,$3,$4)", [
      sid,
      "revision",
      40,
      "Fix the project",
    ]);
    await as(db, ids.student);
    await db.query("select submit_assignment($1,$2)", [ids.final, path]);
    await db.exec("reset role");
    await db.exec(
      `update assignments set due_at=now()-interval '1 day';update submissions set status='revision'`,
    );
    await as(db, ids.student);
    await assert.rejects(
      db.query("select submit_assignment($1,$2)", [ids.final, path]),
    );
  } finally {
    await db.close();
  }
});
test("timed MCQ exam hides answer keys and enforces attempt limits and server marking", async () => {
  const db = await fixture();
  try {
    await enroll(db);
    await db.exec(
      `reset role;insert into exams(id,batch_id,title,opens_at,closes_at,duration_minutes,published) values('${ids.exam}','${ids.batch}','Quiz',now()-interval '1 hour',now()+interval '1 hour',30,true)`,
    );
    await as(db, ids.admin);
    await db.query("select add_exam_question($1,$2,$3,$4,$5,$6,$7)", [
      ids.exam,
      "2 + 2?",
      "mcq",
      JSON.stringify(["3", "4"]),
      1,
      1,
      1,
    ]);
    const qid = (await db.query("select id from exam_questions")).rows[0].id;
    await as(db, ids.student);
    assert.equal(await count(db, "exam_questions"), 0);
    const aid = (await db.query("select start_exam($1) as id", [ids.exam]))
      .rows[0].id;
    assert.equal(await count(db, "exam_questions"), 1);
    assert.equal(await count(db, "exam_keys"), 0);
    await as(db, ids.other);
    await assert.rejects(
      db.query("select save_exam_answers($1,$2,true)", [
        aid,
        JSON.stringify({ [qid]: "1" }),
      ]),
    );
    await as(db, ids.student);
    await db.query("select save_exam_answers($1,$2,true)", [
      aid,
      JSON.stringify({ [qid]: "1" }),
    ]);
    const attempt = (await db.query("select * from exam_attempts")).rows[0];
    assert.equal(attempt.status, "passed");
    assert.equal(Number(attempt.score), 100);
    await assert.rejects(db.query("select start_exam($1)", [ids.exam]));
    await as(db, ids.admin);
    await assert.rejects(
      db.query("update exam_questions set prompt=$1 where id=$2", [
        "Changed",
        qid,
      ]),
    );
  } finally {
    await db.close();
  }
});

test("late exam submission uses saved answers and written exams require staff review", async () => {
  const db = await fixture();
  try {
    await enroll(db);
    await db.exec(
      `reset role;insert into exams(id,batch_id,title,opens_at,closes_at,duration_minutes,published) values('${ids.exam}','${ids.batch}','Written',now()-interval '1 hour',now()+interval '1 hour',30,true)`,
    );
    await as(db, ids.admin);
    await db.query("select add_exam_question($1,$2,$3,$4,$5,$6,$7)", [
      ids.exam,
      "Explain HTML",
      "written",
      "[]",
      null,
      5,
      1,
    ]);
    const qid = (await db.query("select id from exam_questions")).rows[0].id;
    await as(db, ids.student);
    const aid = (await db.query("select start_exam($1) as id", [ids.exam]))
      .rows[0].id;
    await db.query("select save_exam_answers($1,$2,false)", [
      aid,
      JSON.stringify({ [qid]: "Saved before expiry" }),
    ]);
    await db.exec(
      `reset role;update exam_attempts set deadline=now()-interval '1 minute'`,
    );
    await as(db, ids.student);
    await db.query("select save_exam_answers($1,$2,true)", [
      aid,
      JSON.stringify({ [qid]: "Changed after deadline" }),
    ]);
    let a = (await db.query("select * from exam_attempts")).rows[0];
    assert.equal(a.status, "review");
    assert.equal(a.answers[qid], "Saved before expiry");
    await assert.rejects(
      db.query("select review_exam($1,$2,$3)", [aid, 100, "Self mark"]),
    );
    await as(db, ids.admin);
    await db.query("select review_exam($1,$2,$3)", [aid, 75, "Good answer"]);
    a = (await db.query("select * from exam_attempts")).rows[0];
    assert.equal(a.status, "passed");
    assert.equal(Number(a.score), 75);
  } finally {
    await db.close();
  }
});

test("revoked certificates require a fresh Admin request and Superadmin approval to reissue", async () => {
  const db = await fixture();
  try {
    await enroll(db);
    await as(db, ids.student);
    const path = await file(db, ids.student, "assignments");
    await db.query("select submit_assignment($1,$2)", [ids.final, path]);
    const sid = (await db.query("select id from submissions")).rows[0].id;
    await as(db, ids.admin);
    await db.query("select review_submission($1,$2,$3,$4)", [
      sid,
      "passed",
      90,
      "Passed",
    ]);
    await db.query("select request_certificate($1)", [sid]);
    const rid = (await db.query("select id from certificate_requests")).rows[0]
      .id;
    await as(db, ids.super);
    await db.query("select issue_certificate($1,true,$2)", [rid, "Approved"]);
    const first = (await db.query("select id from certificates")).rows[0].id;
    await db.query("select revoke_certificate($1,$2)", [
      first,
      "Name correction",
    ]);
    await assert.rejects(
      db.query("select issue_certificate($1,true,$2)", [
        rid,
        "No fresh request",
      ]),
    );
    await as(db, ids.admin);
    await db.query("select request_certificate($1)", [sid]);
    await as(db, ids.super);
    await db.query("select issue_certificate($1,true,$2)", [
      rid,
      "Reissue approved",
    ]);
    assert.equal(await count(db, "certificates"), 2);
    assert.equal(
      Number(
        (
          await db.query(
            "select count(*) n from certificates where revoked_at is null",
          )
        ).rows[0].n,
      ),
      1,
    );
  } finally {
    await db.close();
  }
});
