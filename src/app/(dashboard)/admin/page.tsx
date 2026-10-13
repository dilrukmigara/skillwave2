import { requireUser } from "@/lib/auth";
import { Workspace, Panel, Empty } from "@/components/lms/Workspace";
import {
  dateLabel,
  type Batch,
  type Enrollment,
  type Profile,
} from "@/lib/lms";
export default async function Page() {
  const { supabase, user, name } = await requireUser("lecturer");
  const { data: batches, error } = await supabase
    .from("batches")
    .select("*")
    .eq("lecturer_id", user.id)
    .returns<Batch[]>();
  if (error) throw new Error("Unable to load assigned batches");
  const ids = batches.map((b) => b.id);
  const { data: enrollments, error: enrollmentError } = ids.length
    ? await supabase
        .from("enrollments")
        .select("*")
        .in("batch_id", ids)
        .eq("status", "active")
        .returns<Enrollment[]>()
    : { data: [], error: null };
  if (enrollmentError) throw new Error("Unable to load roster");
  const students = [...new Set(enrollments.map((e) => e.student_id))];
  const { data: profiles, error: profileError } = students.length
    ? await supabase
        .from("profiles")
        .select("id,full_name,email")
        .in("id", students)
        .returns<Profile[]>()
    : { data: [], error: null };
  if (profileError) throw new Error("Unable to load student details");
  return (
    <Workspace role="lecturer" name={name}>
      <p className="text-slate-500">
        Your assigned batches and approved student rosters.
      </p>
      {!batches.length && (
        <Panel title="Your batches">
          <Empty>
            No batches have been assigned yet. Your superadmin can assign your
            teaching batches.
          </Empty>
        </Panel>
      )}
      {batches.map((batch) => (
        <Panel key={batch.id} title={batch.title}>
          <p className="mb-5 text-sm text-slate-500">
            {batch.mode} · {dateLabel(batch.starts_on)}
          </p>
          {!enrollments.some((e) => e.batch_id === batch.id) ? (
            <Empty>No approved students in this batch yet.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {enrollments
                .filter((e) => e.batch_id === batch.id)
                .map((e) => {
                  const student = profiles.find((p) => p.id === e.student_id);
                  return (
                    <li key={e.id} className="py-3">
                      <p className="font-medium">
                        {student?.full_name || "Student"}
                      </p>
                      <p className="text-sm text-slate-500">{student?.email}</p>
                    </li>
                  );
                })}
            </ul>
          )}
        </Panel>
      ))}
    </Workspace>
  );
}
