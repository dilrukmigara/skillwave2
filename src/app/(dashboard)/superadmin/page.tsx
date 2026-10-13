import { requireUser } from "@/lib/auth";
import {
  Workspace,
  Panel,
  Empty,
  Badge,
  fieldClass,
} from "@/components/lms/Workspace";
import { ActionForm } from "@/components/lms/ActionForm";
import {
  appointLecturer,
  revokeLecturer,
  createCourse,
  setCoursePublished,
  createBatch,
  updateBatch,
  decideEnrollment,
} from "../actions";
import type { Batch, Course, Enrollment, Membership, Profile } from "@/lib/lms";
export default async function Page() {
  const { supabase, name } = await requireUser("superadmin");
  const [p, r, c, b, e] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,email")
      .order("full_name")
      .returns<Profile[]>(),
    supabase.from("user_roles").select("*").returns<Membership[]>(),
    supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Course[]>(),
    supabase
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Batch[]>(),
    supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Enrollment[]>(),
  ]);
  if (p.error || r.error || c.error || b.error || e.error)
    throw new Error("Unable to load academy data");
  const profiles = p.data,
    roles = r.data,
    courses = c.data,
    batches = b.data,
    enrollments = e.data;
  const lecturers = profiles.filter((p) =>
    roles.some((r) => r.user_id === p.id && r.role === "lecturer"),
  );
  const candidates = profiles.filter(
    (p) => !roles.some((r) => r.user_id === p.id),
  );
  const lecturerOptions = (
    <>
      <option value="">Assign later</option>
      {lecturers.map((p) => (
        <option key={p.id} value={p.id}>
          {p.full_name} — {p.email}
        </option>
      ))}
    </>
  );
  return (
    <Workspace role="superadmin" name={name}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Registered users", profiles.length],
          ["Lecturers", lecturers.length],
          ["Courses", courses.length],
          [
            "Pending requests",
            enrollments.filter((e) => e.status === "pending").length,
          ],
        ].map(([label, count]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-[#305a49]">{count}</p>
          </div>
        ))}
      </div>
      <Panel title="Enrollment requests">
        {!enrollments.length ? (
          <Empty>No enrollment requests yet.</Empty>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <article
                key={enrollment.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-semibold">
                    {profiles.find((p) => p.id === enrollment.student_id)
                      ?.full_name || "Student"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {batches.find((b) => b.id === enrollment.batch_id)?.title}
                  </p>
                  <div className="mt-2">
                    <Badge status={enrollment.status} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(enrollment.status === "pending"
                    ? ["active", "rejected"]
                    : enrollment.status === "active"
                      ? ["revoked"]
                      : ["active"]
                  ).map((status) => (
                    <ActionForm
                      key={status}
                      action={decideEnrollment}
                      label={
                        status === "active"
                          ? "Approve"
                          : status === "rejected"
                            ? "Reject"
                            : "Revoke access"
                      }
                      confirm={
                        status !== "active"
                          ? "Change this student’s enrollment status?"
                          : undefined
                      }
                    >
                      <input type="hidden" name="id" value={enrollment.id} />
                      <input type="hidden" name="status" value={status} />
                    </ActionForm>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Add a course">
          <ActionForm action={createCourse} label="Create course">
            <label className="block text-sm font-medium">
              Course title
              <input
                name="title"
                required
                minLength={3}
                maxLength={150}
                className={fieldClass}
                placeholder="Foundations of Information Technology"
              />
            </label>
            <label className="block text-sm font-medium">
              Description
              <textarea
                name="description"
                maxLength={2000}
                rows={3}
                className={fieldClass}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" />
              Publish in the student catalog
            </label>
          </ActionForm>
        </Panel>
        <Panel title="Create a batch">
          {!courses.length ? (
            <Empty>Create a course first, then add its first batch.</Empty>
          ) : (
            <ActionForm action={createBatch} label="Create batch">
              <label className="block text-sm font-medium">
                Course
                <select name="course_id" required className={fieldClass}>
                  <option value="">Choose course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Batch name
                <input
                  name="title"
                  required
                  minLength={2}
                  maxLength={120}
                  className={fieldClass}
                  placeholder="October online batch"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Class format
                  <select name="mode" className={fieldClass}>
                    <option value="online">Online</option>
                    <option value="physical">Physical</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Start date
                  <input name="starts_on" type="date" className={fieldClass} />
                </label>
              </div>
              <label className="block text-sm font-medium">
                Lecturer
                <select name="lecturer_id" className={fieldClass}>
                  {lecturerOptions}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="enrollment_open" type="checkbox" defaultChecked />
                Accept enrollment requests
              </label>
            </ActionForm>
          )}
        </Panel>
      </div>
      <Panel title="Courses">
        {!courses.length ? (
          <Empty>Your course catalog starts here.</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <article
                key={course.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <h3 className="font-semibold">{course.title}</h3>
                <p className="my-3 text-sm text-slate-500">
                  {course.published ? "Published" : "Draft"} ·{" "}
                  {batches.filter((b) => b.course_id === course.id).length}{" "}
                  batches
                </p>
                <ActionForm
                  action={setCoursePublished}
                  label={
                    course.published ? "Unpublish course" : "Publish course"
                  }
                >
                  <input type="hidden" name="id" value={course.id} />
                  <input
                    type="hidden"
                    name="published"
                    value={String(!course.published)}
                  />
                </ActionForm>
              </article>
            ))}
          </div>
        )}
      </Panel>
      <Panel title="Batch assignments">
        {!batches.length ? (
          <Empty>No batches created yet.</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {batches.map((batch) => (
              <article
                key={batch.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <h3 className="font-semibold">{batch.title}</h3>
                <p className="mb-4 text-sm text-slate-500">
                  {courses.find((c) => c.id === batch.course_id)?.title}
                </p>
                <ActionForm action={updateBatch} label="Save batch">
                  <input type="hidden" name="id" value={batch.id} />
                  <label className="block text-sm font-medium">
                    Lecturer
                    <select
                      name="lecturer_id"
                      defaultValue={
                        lecturers.some((l) => l.id === batch.lecturer_id)
                          ? batch.lecturer_id!
                          : ""
                      }
                      className={fieldClass}
                    >
                      {lecturerOptions}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      name="enrollment_open"
                      type="checkbox"
                      defaultChecked={batch.enrollment_open}
                    />
                    Accept requests
                  </label>
                </ActionForm>
              </article>
            ))}
          </div>
        )}
      </Panel>
      <Panel title="Lecturer access">
        <p className="mb-5 text-sm leading-relaxed text-slate-500">
          Ask a lecturer to register, verify their email and sign in once as a
          student. Then grant their lecturer access here.
        </p>
        {!!candidates.length ? (
          <ActionForm
            action={appointLecturer}
            label="Grant lecturer access"
            confirm="Give this account lecturer access?"
          >
            <label className="block text-sm font-medium">
              Registered account
              <select name="user_id" required className={fieldClass}>
                <option value="">Choose account</option>
                {candidates.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} — {p.email}
                  </option>
                ))}
              </select>
            </label>
          </ActionForm>
        ) : (
          <Empty>No new registered accounts to appoint.</Empty>
        )}
        <div className="mt-6 space-y-4">
          {lecturers.map((p) => (
            <article
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"
            >
              <div>
                <h3 className="font-medium">{p.full_name}</h3>
                <p className="text-sm text-slate-500">{p.email}</p>
              </div>
              <ActionForm
                action={revokeLecturer}
                label="Remove lecturer access"
                confirm="Remove lecturer permissions? Their batches will need reassignment."
              >
                <input type="hidden" name="user_id" value={p.id} />
              </ActionForm>
            </article>
          ))}
        </div>
      </Panel>
    </Workspace>
  );
}
