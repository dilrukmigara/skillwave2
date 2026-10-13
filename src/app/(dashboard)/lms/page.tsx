import { requireUser } from "@/lib/auth";
import { Workspace, Panel, Empty, Badge } from "@/components/lms/Workspace";
import { ActionForm } from "@/components/lms/ActionForm";
import { requestEnrollment } from "../actions";
import { dateLabel, type Batch, type Course, type Enrollment } from "@/lib/lms";
export default async function Page() {
  const { supabase, user, name } = await requireUser("student");
  const [c, b, e] = await Promise.all([
    supabase.from("courses").select("*").eq("published", true).order("title"),
    supabase.from("batches").select("*").order("starts_on"),
    supabase.from("enrollments").select("*").eq("student_id", user.id),
  ]);
  if (c.error || b.error || e.error)
    throw new Error("Unable to load learning workspace");
  const courses = c.data as Course[],
    batches = b.data as Batch[],
    enrollments = e.data as Enrollment[];
  return (
    <Workspace role="student" name={name}>
      <div className="rounded-2xl bg-gradient-to-r from-[#305a49] to-[#183d64] p-7 text-white">
        <p className="text-sm text-emerald-100">YOUR LEARNING JOURNEY</p>
        <h2 className="mt-3 text-2xl font-semibold">
          Make room for your next skill.
        </h2>
        <p className="mt-3 text-sm text-slate-200">
          {enrollments.filter((e) => e.status === "active").length} active
          enrollments ·{" "}
          {enrollments.filter((e) => e.status === "pending").length} awaiting
          approval
        </p>
      </div>
      <Panel title="My enrollments">
        {!enrollments.length ? (
          <Empty>
            You haven’t joined a batch yet. Browse the available batches below
            and request your place.
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {enrollments.map((enrollment) => {
              const batch = batches.find((b) => b.id === enrollment.batch_id);
              return (
                <article
                  key={enrollment.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <Badge status={enrollment.status} />
                  <h3 className="mt-3 font-semibold">
                    {batch?.title || "Enrollment"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {courses.find((c) => c.id === batch?.course_id)?.title ||
                      "Contact the academy for course details."}
                  </p>
                  <p className="mt-4 text-xs text-slate-500">
                    {enrollment.status === "pending"
                      ? "The academy will review your request."
                      : enrollment.status === "active"
                        ? "Your place is confirmed. The academy will share your class details."
                        : "Please contact the academy about this enrollment."}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
      <Panel title="Find your next batch">
        <div className="grid gap-4 sm:grid-cols-2">
          {batches
            .filter(
              (b) =>
                b.enrollment_open && courses.some((c) => c.id === b.course_id),
            )
            .map((batch) => {
              const enrollment = enrollments.find(
                (e) => e.batch_id === batch.id,
              );
              return (
                <article
                  key={batch.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                    {batch.mode}
                  </p>
                  <h3 className="mt-3 font-semibold">
                    {courses.find((c) => c.id === batch.course_id)?.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{batch.title}</p>
                  <p className="mb-5 mt-2 text-xs text-slate-500">
                    {dateLabel(batch.starts_on)}
                  </p>
                  {enrollment ? (
                    <Badge status={enrollment.status} />
                  ) : (
                    <ActionForm
                      action={requestEnrollment}
                      label="Request enrollment"
                    >
                      <input type="hidden" name="batch_id" value={batch.id} />
                    </ActionForm>
                  )}
                </article>
              );
            })}
        </div>
        {!batches.some(
          (b) => b.enrollment_open && courses.some((c) => c.id === b.course_id),
        ) && <Empty>New batches will appear here when enrollment opens.</Empty>}
      </Panel>
    </Workspace>
  );
}
