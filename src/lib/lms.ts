export type Profile = { id: string; full_name: string; email: string };
export type Membership = { user_id: string; role: "lecturer" | "superadmin" };
export type Course = {
  id: string;
  title: string;
  description: string;
  published: boolean;
};
export type Batch = {
  id: string;
  course_id: string;
  title: string;
  lecturer_id: string | null;
  starts_on: string | null;
  mode: string;
  enrollment_open: boolean;
};
export type Enrollment = {
  id: string;
  student_id: string;
  batch_id: string;
  status: string;
  created_at: string;
};
export function dateLabel(date: string | null) {
  return date
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeZone: "Asia/Colombo",
      }).format(new Date(`${date}T00:00:00Z`))
    : "Date to be announced";
}
