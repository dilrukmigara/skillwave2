import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const [owner, lecturer, otherLecturer, student, otherStudent] = [
  1, 2, 3, 4, 5,
].map(id);
const [course, draft, batch, otherBatch, closedBatch, hiddenBatch] = [
  10, 11, 20, 21, 22, 23,
].map(id);

test("LMS database permissions enforce the role and enrollment boundaries", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
      grant usage on schema auth to anon,authenticated; grant execute on all functions in schema auth to anon,authenticated;`);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/20261012155939_lms_identity_and_enrollment.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    for (const user of [
      owner,
      lecturer,
      otherLecturer,
      student,
      otherStudent,
    ]) {
      await db.query("insert into auth.users values ($1)", [user]);
      await db.query(
        "insert into public.profiles(id,full_name,email) values ($1,$2,$3)",
        [user, `User ${user.slice(-1)}`, `${user}@example.test`],
      );
    }
    await db.exec(`insert into public.user_roles values ('${owner}','superadmin'),('${lecturer}','lecturer'),('${otherLecturer}','lecturer');
      insert into public.courses(id,title,published) values ('${course}','IT Foundations',true),('${draft}','Unpublished Course',false);
      insert into public.batches(id,course_id,title,lecturer_id,mode,enrollment_open) values
      ('${batch}','${course}','Online A','${lecturer}','online',true),
      ('${otherBatch}','${course}','Online B','${otherLecturer}','online',true),
      ('${closedBatch}','${course}','Closed batch','${lecturer}','online',false),
      ('${hiddenBatch}','${draft}','Draft batch','${lecturer}','online',true);`);
    async function as(user, role = "authenticated") {
      await db.exec("reset role");
      await db.query(
        "select set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claims',$2,false)",
        [
          user || "",
          JSON.stringify({
            email: `${user}@example.test`,
            user_metadata: { role: "superadmin" },
          }),
        ],
      );
      await db.exec(`set role ${role}`);
    }
    await t.test(
      "anonymous users cannot read student profiles or roles",
      async () => {
        await as(null, "anon");
        await assert.rejects(
          db.query("select * from public.profiles"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("select private.current_role()"),
          /permission denied/,
        );
      },
    );
    await t.test(
      "editable user metadata cannot grant administrator privileges",
      async () => {
        await as(student);
        assert.equal(
          (await db.query("select private.current_role() as role")).rows[0]
            .role,
          "student",
        );
        assert.deepEqual(
          (await db.query("select id from public.profiles")).rows,
          [{ id: student }],
        );
        assert.equal(
          (await db.query("select * from public.courses")).rows.length,
          1,
        );
        await assert.rejects(
          db.query(
            `insert into public.user_roles(user_id,role) values ('${student}','superadmin')`,
          ),
          /row-level security/,
        );
        await assert.rejects(
          db.query(
            `insert into public.courses(title) values ('Unauthorized course')`,
          ),
          /row-level security/,
        );
      },
    );
    await t.test(
      "students can request only their own open published batch with pending status",
      async () => {
        await as(student);
        await db.query(
          "insert into public.enrollments(student_id,batch_id) values ($1,$2)",
          [student, batch],
        );
        await assert.rejects(
          db.query(
            "insert into public.enrollments(student_id,batch_id) values ($1,$2)",
            [otherStudent, otherBatch],
          ),
          /row-level security/,
        );
        for (const b of [closedBatch, hiddenBatch])
          await assert.rejects(
            db.query(
              "insert into public.enrollments(student_id,batch_id) values ($1,$2)",
              [student, b],
            ),
            /row-level security/,
          );
        await assert.rejects(
          db.query(
            "insert into public.enrollments(student_id,batch_id,status) values ($1,$2,'active')",
            [student, otherBatch],
          ),
          /permission denied/,
        );
        await assert.rejects(
          db.query(
            "insert into public.enrollments(student_id,batch_id) values ($1,$2)",
            [student, batch],
          ),
          /duplicate key/,
        );
        const update = await db.query(
          "update public.enrollments set status='active' returning id",
        );
        assert.equal(update.rows.length, 0);
        assert.equal(
          (await db.query("select status from public.enrollments")).rows[0]
            .status,
          "pending",
        );
      },
    );
    await t.test(
      "other students cannot read someone else’s enrollment",
      async () => {
        await as(otherStudent);
        assert.equal(
          (await db.query("select * from public.enrollments")).rows.length,
          0,
        );
        await db.query(
          "insert into public.enrollments(student_id,batch_id) values ($1,$2)",
          [otherStudent, otherBatch],
        );
      },
    );
    await t.test(
      "superadmin approves enrollments and appoints lecturers but cannot create a superadmin through the app",
      async () => {
        await as(owner);
        assert.equal(
          (await db.query("select * from public.enrollments")).rows.length,
          2,
        );
        await db.query(
          "update public.enrollments set status='active' where student_id=$1",
          [student],
        );
        await assert.rejects(
          db.query("update public.enrollments set student_id=$1", [
            otherStudent,
          ]),
          /permission denied/,
        );
        await assert.rejects(
          db.query(
            "insert into public.user_roles(user_id,role) values ($1,'superadmin')",
            [otherStudent],
          ),
          /row-level security/,
        );
        await db.query(
          "insert into public.user_roles(user_id,role) values ($1,'lecturer')",
          [otherStudent],
        );
        assert.equal(
          (
            await db.query(
              "delete from public.user_roles where user_id=$1 returning user_id",
              [owner],
            )
          ).rows.length,
          0,
        );
        await assert.rejects(
          db.query("update public.batches set lecturer_id=$1 where id=$2", [
            student,
            batch,
          ]),
          /Choose an appointed lecturer/,
        );
      },
    );
    await t.test(
      "lecturer sees only their batch enrollment and approved student profiles",
      async () => {
        await as(lecturer);
        assert.deepEqual(
          (await db.query("select student_id from public.enrollments")).rows,
          [{ student_id: student }],
        );
        const visible = (await db.query("select id from public.profiles")).rows
          .map((r) => r.id)
          .sort();
        assert.deepEqual(visible, [lecturer, student].sort());
        assert.equal(
          (
            await db.query(
              "update public.enrollments set status='rejected' returning id",
            )
          ).rows.length,
          0,
        );
        await assert.rejects(
          db.query(
            "insert into public.user_roles(user_id,role) values ($1,'lecturer')",
            [student],
          ),
          /row-level security/,
        );
        assert.equal(
          (
            await db.query(
              "update public.batches set lecturer_id=$1 where id=$2 returning id",
              [lecturer, otherBatch],
            )
          ).rows.length,
          0,
        );
      },
    );
    await t.test(
      "revoking a lecturer takes effect immediately without a refreshed JWT",
      async () => {
        await as(owner);
        await db.query("delete from public.user_roles where user_id=$1", [
          lecturer,
        ]);
        await as(lecturer);
        assert.equal(
          (await db.query("select private.current_role() as role")).rows[0]
            .role,
          "student",
        );
        assert.equal(
          (await db.query("select * from public.enrollments")).rows.length,
          0,
        );
        assert.equal(
          (
            await db.query("select * from public.batches where id=$1", [
              hiddenBatch,
            ])
          ).rows.length,
          0,
        );
      },
    );
    await t.test(
      "reassigning a lecturer removes access to the prior batch roster",
      async () => {
        await as(owner);
        await db.query("update public.batches set lecturer_id=$1 where id=$2", [
          otherLecturer,
          batch,
        ]);
        await as(otherLecturer);
        assert.equal(
          (await db.query("select * from public.enrollments")).rows.length,
          2,
        );
        await as(owner);
        await db.query(
          "update public.enrollments set status='revoked' where student_id=$1",
          [student],
        );
        await as(otherLecturer);
        assert.equal(
          (
            await db.query("select id from public.profiles where id=$1", [
              student,
            ])
          ).rows.length,
          0,
        );
      },
    );
    await t.test(
      "all tables have RLS and no privileged functions are publicly exposed",
      async () => {
        await db.exec("reset role");
        const tables = await db.query(
          "select relname,relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'",
        );
        assert.equal(tables.rows.length, 5);
        assert.ok(tables.rows.every((t) => t.relrowsecurity));
        assert.equal(
          (
            await db.query(
              "select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.prosecdef and n.nspname='public'",
            )
          ).rows.length,
          0,
        );
      },
    );
  } finally {
    await db.close();
  }
});
