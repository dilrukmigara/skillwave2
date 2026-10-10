import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "./Auth";
import { database, rows, rpc, save, openFile, when, youtubeId } from "./client";
import { Empty } from "./Student";
type Row = Record<string, any>;
type Field = {
  name: string;
  label: string;
  type?: string;
  options?: Row[];
  required?: boolean;
  value?: any;
};
function Editor({
  title,
  fields,
  submit,
  busy,
  label = "Save",
}: {
  title: string;
  fields: Field[];
  submit: (v: Row) => Promise<void>;
  busy: boolean;
  label?: string;
}) {
  return (
    <form
      className="sw-card sw-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget,
          f = new FormData(form),
          value: Row = {};
        for (const field of fields) {
          const v = f.get(field.name);
          value[field.name] =
            field.type === "checkbox"
              ? v === "on"
              : field.type === "number"
                ? Number(v)
                : field.type === "datetime-local"
                  ? v
                    ? new Date(String(v)).toISOString()
                    : null
                  : v || null;
        }
        await submit(value);
      }}
    >
      <h3>{title}</h3>
      {fields.map((f) => (
        <label key={f.name} className={f.type === "checkbox" ? "sw-check" : ""}>
          {f.label}
          {f.options ? (
            <select
              name={f.name}
              required={f.required !== false}
              defaultValue={f.value || ""}
            >
              <option value="">Choose…</option>
              {f.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title || o.name || o.full_name || o.id}
                </option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              name={f.name}
              required={f.required !== false}
              defaultValue={f.value || ""}
            />
          ) : (
            <input
              name={f.name}
              type={f.type || "text"}
              required={f.type === "checkbox" ? false : f.required !== false}
              defaultValue={f.type === "checkbox" ? undefined : (f.value ?? "")}
              defaultChecked={f.type === "checkbox" ? !!f.value : undefined}
            />
          )}
        </label>
      ))}
      <button disabled={busy}>{busy ? "Saving…" : label}</button>
    </form>
  );
}
export function Admin() {
  const { profile } = useAuth(),
    superadmin = profile!.role === "superadmin";
  const [data, setData] = useState<Record<string, Row[]>>({}),
    [tab, setTab] = useState("Overview"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [edit, setEdit] = useState<Row | null>(null);
  const tables = [
    "courses",
    "batches",
    "staff_assignments",
    "profiles",
    "enrollments",
    "batch_members",
    "lessons",
    "live_sessions",
    "announcements",
    "assignments",
    "submissions",
    "payments",
    "certificate_requests",
    "certificates",
    "settings",
    "exams",
    "exam_questions",
    "exam_keys",
    "exam_attempts",
    ...(superadmin ? ["audit_log"] : []),
  ];
  async function load() {
    try {
      const results = await Promise.all(
        tables.map((t) =>
          rows(t, t === "audit_log" ? "created_at" : undefined),
        ),
      );
      setData(Object.fromEntries(tables.map((t, i) => [t, results[i]])));
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function action(fn: () => Promise<any>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      await load();
      setMessage("Saved successfully.");
      setEdit(null);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  const get = (t: string) => data[t] || [],
    managed = new Set(
      get("staff_assignments")
        .filter((s) => s.user_id === profile!.id)
        .map((s) => s.course_id),
    );
  const courses = get("courses").filter((c) => superadmin || managed.has(c.id)),
    courseIds = new Set(courses.map((c) => c.id)),
    batches = get("batches").filter((b) => courseIds.has(b.course_id)),
    batchIds = new Set(batches.map((b) => b.id));
  const courseField: Field = {
      name: "course_id",
      label: "Course",
      options: courses,
    },
    batchField: Field = { name: "batch_id", label: "Batch", options: batches };
  const name = (id: string) =>
      get("profiles").find((p) => p.id === id)?.full_name || id,
    batch = (id: string) => batches.find((b) => b.id === id)?.name || id;
  const pendingPayments = get("payments").filter(
      (p) => batchIds.has(p.batch_id) && p.status === "pending",
    ),
    submissions = get("submissions").filter((s) =>
      get("assignments").some(
        (a) => a.id === s.assignment_id && batchIds.has(a.batch_id),
      ),
    ),
    requests = get("certificate_requests").filter((r) =>
      submissions.some((s) => s.id === r.submission_id),
    );
  const tabs = [
    "Overview",
    "Courses",
    "Batches",
    "Lessons",
    "Live sessions",
    "Assignments",
    "Reviews",
    "Exams",
    "Exam marking",
    "Payments",
    "Certificates",
    "Announcements",
    ...(superadmin ? ["People & access", "Settings", "Activity"] : []),
  ];
  const submit =
    (table: string, transform: (v: Row) => Row = (v) => v) =>
    (v: Row) =>
      action(() => save(table, transform(v)));
  return (
    <main className="sw-page">
      <div className="sw-header">
        <div>
          <span className="sw-eyebrow">
            {superadmin ? "SUPERADMIN" : "ADMIN"} WORKSPACE
          </span>
          <h1>Keep learning moving.</h1>
          <p>
            {superadmin
              ? "Your academy, courses and approvals in one place."
              : "Manage the courses and batches assigned to you."}
          </p>
        </div>
        <Link className="sw-button" to="/learn">
          Student view
        </Link>
      </div>
      <div className="sw-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            onClick={() => {
              setTab(t);
              setEdit(null);
              setMessage("");
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {message && (
        <div role="status" className="sw-banner">
          {message}
        </div>
      )}
      {loading ? (
        <p>Loading workspace…</p>
      ) : (
        <>
          {tab === "Overview" && (
            <>
              <div className="sw-grid">
                {[
                  ["Courses", courses.length],
                  ["Assigned batches", batches.length],
                  ["Payment reviews", pendingPayments.length],
                  [
                    "Assignment reviews",
                    submissions.filter((s) => s.status === "submitted").length,
                  ],
                  [
                    "Certificate requests",
                    requests.filter((r) => r.status === "pending").length,
                  ],
                ].map(([label, n]) => (
                  <div className="sw-card" key={label}>
                    <p>{label}</p>
                    <div className="sw-stat">{n}</div>
                  </div>
                ))}
              </div>
              <div className="sw-banner">
                Certificate workflow: final assignment reviewed and passed →
                Admin request → Superadmin approval → issued certificate.
              </div>
            </>
          )}
          {tab === "Courses" && (
            <>
              {(superadmin || edit) && (
                <Editor
                  key={edit?.id || "new"}
                  title={edit ? "Edit course" : "Create a course"}
                  fields={[
                    {
                      name: "title",
                      label: "Course title",
                      value: edit?.title,
                    },
                    {
                      name: "description",
                      label: "Description",
                      type: "textarea",
                      value: edit?.description,
                    },
                    {
                      name: "price",
                      label: "Price (LKR)",
                      type: "number",
                      value: edit?.price ?? 0,
                    },
                    {
                      name: "published",
                      label: "Publish course",
                      type: "checkbox",
                      value: edit?.published,
                    },
                  ]}
                  busy={busy}
                  submit={submit("courses", (v) => ({
                    ...v,
                    ...(edit ? { id: edit.id } : {}),
                  }))}
                />
              )}
              <div className="sw-grid">
                {courses.map((c) => (
                  <div className="sw-card" key={c.id}>
                    <span className="sw-tag">
                      {c.published ? "Published" : "Draft"}
                    </span>
                    <h3>{c.title}</h3>
                    <p>LKR {c.price}</p>
                    <button className="sw-secondary" onClick={() => setEdit(c)}>
                      Edit course
                    </button>
                  </div>
                ))}
              </div>
              {!superadmin && (
                <p>
                  New courses are created by the Superadmin. You can edit
                  assigned courses.
                </p>
              )}
            </>
          )}
          {tab === "Batches" && (
            <>
              <Editor
                title="Create batch"
                fields={[
                  courseField,
                  { name: "name", label: "Batch name" },
                  { name: "starts_on", label: "Start date", type: "date" },
                  { name: "ends_on", label: "End date", type: "date" },
                ]}
                submit={submit("batches")}
                busy={busy}
              />
              <div className="sw-grid">
                {batches.map((b) => (
                  <div className="sw-card" key={b.id}>
                    <h3>{b.name}</h3>
                    <p>{courses.find((c) => c.id === b.course_id)?.title}</p>
                    <p>
                      {b.starts_on} – {b.ends_on}
                    </p>
                    <p>
                      {
                        get("batch_members").filter((m) => m.batch_id === b.id)
                          .length
                      }{" "}
                      students
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "Lessons" && (
            <>
              <Editor
                key={edit?.id || "new"}
                title={edit ? "Edit lesson" : "Add a lesson"}
                fields={[
                  { ...courseField, value: edit?.course_id },
                  { name: "module", label: "Module", value: edit?.module },
                  { name: "title", label: "Lesson title", value: edit?.title },
                  {
                    name: "youtube_id",
                    label: "YouTube URL or video ID",
                    value: edit?.youtube_id,
                  },
                  {
                    name: "notes",
                    label: "Lesson notes",
                    type: "textarea",
                    required: false,
                    value: edit?.notes,
                  },
                  {
                    name: "position",
                    label: "Lesson order",
                    type: "number",
                    value: edit?.position ?? 1,
                  },
                  {
                    name: "is_free",
                    label: "Include in public Free Learning library",
                    type: "checkbox",
                    value: edit?.is_free,
                  },
                  {
                    name: "published",
                    label: "Publish lesson",
                    type: "checkbox",
                    value: edit?.published,
                  },
                ]}
                busy={busy}
                submit={(v) =>
                  action(async () => {
                    const id = youtubeId(v.youtube_id);
                    if (!id)
                      throw new Error(
                        "Enter a valid YouTube URL or 11-character video ID.",
                      );
                    await save("lessons", {
                      ...v,
                      notes: v.notes || "",
                      youtube_id: id,
                      ...(edit ? { id: edit.id } : {}),
                    });
                  })
                }
              />
              <div className="sw-grid">
                {get("lessons")
                  .filter((l) => courseIds.has(l.course_id))
                  .map((l) => (
                    <div className="sw-card" key={l.id}>
                      <span className="sw-tag">
                        {l.is_free ? "Free" : "Enrolled students"} ·{" "}
                        {l.published ? "Published" : "Draft"}
                      </span>
                      <h3>
                        {l.module} · {l.title}
                      </h3>
                      <button
                        className="sw-secondary"
                        onClick={() => setEdit(l)}
                      >
                        Edit lesson
                      </button>
                    </div>
                  ))}
              </div>
            </>
          )}
          {tab === "Live sessions" && (
            <>
              <Editor
                title="Schedule a live session"
                fields={[
                  batchField,
                  { name: "title", label: "Session title" },
                  {
                    name: "starts_at",
                    label: "Start time (your device timezone)",
                    type: "datetime-local",
                  },
                  {
                    name: "meeting_url",
                    label: "Meeting URL (https)",
                    type: "url",
                  },
                  {
                    name: "recording_id",
                    label: "Recording YouTube URL (optional)",
                    required: false,
                  },
                ]}
                submit={(v) =>
                  action(() => {
                    const recording = v.recording_id
                      ? youtubeId(v.recording_id)
                      : null;
                    if (v.recording_id && !recording)
                      throw new Error("Invalid YouTube recording URL");
                    return save("live_sessions", {
                      ...v,
                      recording_id: recording,
                    });
                  })
                }
                busy={busy}
              />
              <div className="sw-grid">
                {get("live_sessions")
                  .filter((s) => batchIds.has(s.batch_id))
                  .map((s) => (
                    <div className="sw-card" key={s.id}>
                      <h3>{s.title}</h3>
                      <p>
                        {batch(s.batch_id)} · {when(s.starts_at)}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          )}
          {tab === "Assignments" && (
            <>
              <Editor
                title="Create an assignment"
                fields={[
                  batchField,
                  { name: "title", label: "Assignment title" },
                  {
                    name: "instructions",
                    label: "Instructions",
                    type: "textarea",
                  },
                  {
                    name: "due_at",
                    label: "Deadline (your device timezone)",
                    type: "datetime-local",
                  },
                  {
                    name: "is_final",
                    label: "Final assignment (one per batch)",
                    type: "checkbox",
                  },
                ]}
                submit={submit("assignments")}
                busy={busy}
              />
              <div className="sw-grid">
                {get("assignments")
                  .filter((a) => batchIds.has(a.batch_id))
                  .map((a) => (
                    <div className="sw-card" key={a.id}>
                      <span className="sw-tag">
                        {a.is_final ? "Final assignment" : batch(a.batch_id)}
                      </span>
                      <h3>{a.title}</h3>
                      <p>Due {when(a.due_at)}</p>
                      <Editor
                        title="Extend deadline"
                        fields={[
                          {
                            name: "due_at",
                            label: "New deadline",
                            type: "datetime-local",
                          },
                        ]}
                        busy={busy}
                        submit={(v) =>
                          action(async () => {
                            const { error } = await database()
                              .from("assignments")
                              .update(v)
                              .eq("id", a.id);
                            if (error) throw error;
                          })
                        }
                      />
                    </div>
                  ))}
              </div>
            </>
          )}
          {tab === "Reviews" && (
            <div className="sw-list">
              {submissions.map((s) => {
                const a = get("assignments").find(
                    (a) => a.id === s.assignment_id,
                  ),
                  r = requests.find((r) => r.submission_id === s.id);
                return (
                  <div className="sw-card" key={s.id}>
                    <span className="sw-tag">
                      {s.status}
                      {a?.is_final ? " · Final assignment" : ""}
                    </span>
                    <h2>{name(s.student_id)}</h2>
                    <h3>{a?.title}</h3>
                    <p>{when(s.submitted_at)}</p>
                    <button
                      disabled={busy}
                      onClick={() => action(() => openFile(s.file_path))}
                    >
                      Open submitted file
                    </button>
                    {(!r || r.status === "returned") && (
                      <Editor
                        title="Review work"
                        fields={[
                          {
                            name: "result",
                            label: "Decision",
                            options: [
                              { id: "passed", title: "Pass" },
                              { id: "revision", title: "Request revision" },
                              { id: "failed", title: "Fail" },
                            ],
                          },
                          {
                            name: "score",
                            label: "Marks out of 100",
                            type: "number",
                            value: s.marks ?? 0,
                          },
                          { name: "note", label: "Feedback", type: "textarea" },
                        ]}
                        busy={busy}
                        submit={(v) =>
                          action(() =>
                            rpc("review_submission", { sid: s.id, ...v }),
                          )
                        }
                      />
                    )}
                    <p>{s.feedback}</p>
                    {a?.is_final &&
                      s.status === "passed" &&
                      (!r || r.status === "returned") && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            action(() =>
                              rpc("request_certificate", { sid: s.id }),
                            )
                          }
                        >
                          Request certificate from Superadmin
                        </button>
                      )}
                    {r && (
                      <p className="sw-banner">
                        Certificate request: {r.status}. {r.reason}
                      </p>
                    )}
                  </div>
                );
              })}
              {!submissions.length && (
                <Empty text="No assignment submissions to review yet." />
              )}
            </div>
          )}
          {tab === "Payments" && (
            <div className="sw-list">
              {get("payments")
                .filter((p) => batchIds.has(p.batch_id))
                .map((p) => (
                  <div className="sw-card" key={p.id}>
                    <span className="sw-tag">{p.status}</span>
                    <h2>{name(p.student_id)}</h2>
                    <p>
                      {batch(p.batch_id)} · Reference {p.reference}
                    </p>
                    <button
                      disabled={busy}
                      onClick={() => action(() => openFile(p.file_path))}
                    >
                      View bank slip
                    </button>
                    {p.status === "pending" && (
                      <Editor
                        title="Verify against your bank statement"
                        fields={[
                          {
                            name: "decision",
                            label: "Decision",
                            options: [
                              {
                                id: "approve",
                                title: "Approve payment and enroll",
                              },
                              { id: "reject", title: "Reject payment" },
                            ],
                          },
                          {
                            name: "note",
                            label: "Review note / rejection reason",
                            type: "textarea",
                          },
                        ]}
                        busy={busy}
                        submit={(v) =>
                          action(() =>
                            rpc("review_payment", {
                              pid: p.id,
                              approve: v.decision === "approve",
                              note: v.note,
                            }),
                          )
                        }
                      />
                    )}
                    <p>{p.feedback}</p>
                  </div>
                ))}
              {!get("payments").some((p) => batchIds.has(p.batch_id)) && (
                <Empty text="No payment slips yet." />
              )}
            </div>
          )}
          {tab === "Certificates" && (
            <div className="sw-list">
              {requests.map((r) => {
                const s = submissions.find((s) => s.id === r.submission_id),
                  a = get("assignments").find((a) => a.id === s?.assignment_id);
                return (
                  <div className="sw-card" key={r.id}>
                    <span className="sw-tag">{r.status}</span>
                    <h2>{name(s?.student_id)}</h2>
                    <h3>{a?.title}</h3>
                    <p>
                      Marks: {s?.marks}/100 · Reviewed by {name(s?.reviewed_by)}{" "}
                      · Requested by {name(r.requested_by)}
                    </p>
                    <p>{s?.feedback}</p>
                    <button
                      disabled={busy}
                      onClick={() => action(() => openFile(s!.file_path))}
                    >
                      View final assignment
                    </button>
                    {superadmin && r.status === "pending" && (
                      <Editor
                        title="Superadmin decision"
                        fields={[
                          {
                            name: "decision",
                            label: "Decision",
                            options: [
                              {
                                id: "approve",
                                title: "Approve and issue certificate",
                              },
                              { id: "return", title: "Return to Admin" },
                            ],
                          },
                          {
                            name: "note",
                            label: "Reason / approval note",
                            type: "textarea",
                          },
                        ]}
                        busy={busy}
                        submit={(v) =>
                          action(() =>
                            rpc("issue_certificate", {
                              rid: r.id,
                              approve: v.decision === "approve",
                              note: v.note,
                            }),
                          )
                        }
                      />
                    )}
                    <p>{r.reason}</p>
                  </div>
                );
              })}
              {!requests.length && (
                <Empty text="Certificate requests will appear after an Admin passes a final assignment and requests a certificate." />
              )}
              {superadmin &&
                get("certificates").map((c) => (
                  <div className="sw-card" key={c.id}>
                    <h3>
                      {c.student_name} · {c.course_title}
                    </h3>
                    <Link className="sw-link" to={"/verify/" + c.id}>
                      Verify issued certificate
                    </Link>
                    {c.revoked_at ? (
                      <p>Revoked: {c.revocation_reason}</p>
                    ) : (
                      <Editor
                        title="Revoke an incorrect certificate"
                        fields={[
                          {
                            name: "note",
                            label: "Revocation reason",
                            type: "textarea",
                          },
                        ]}
                        submit={(v) =>
                          action(() =>
                            rpc("revoke_certificate", { cid: c.id, ...v }),
                          )
                        }
                        busy={busy}
                        label="Revoke certificate"
                      />
                    )}
                  </div>
                ))}
            </div>
          )}
          {tab === "Announcements" && (
            <>
              <Editor
                title="Post batch announcement"
                fields={[
                  batchField,
                  { name: "title", label: "Title" },
                  { name: "body", label: "Message", type: "textarea" },
                ]}
                submit={submit("announcements")}
                busy={busy}
              />
              <div className="sw-grid">
                {get("announcements")
                  .filter((a) => batchIds.has(a.batch_id))
                  .map((a) => (
                    <div className="sw-card" key={a.id}>
                      <h3>{a.title}</h3>
                      <p>{batch(a.batch_id)}</p>
                      <pre>{a.body}</pre>
                    </div>
                  ))}
              </div>
            </>
          )}
          {tab === "Exams" && (
            <>
              <Editor
                title="Create an exam"
                fields={[
                  batchField,
                  { name: "title", label: "Exam title" },
                  {
                    name: "opens_at",
                    label: "Opens (device timezone)",
                    type: "datetime-local",
                  },
                  {
                    name: "closes_at",
                    label: "Closes (device timezone)",
                    type: "datetime-local",
                  },
                  {
                    name: "duration_minutes",
                    label: "Duration in minutes",
                    type: "number",
                    value: 60,
                  },
                  {
                    name: "pass_mark",
                    label: "Pass mark (%)",
                    type: "number",
                    value: 50,
                  },
                  {
                    name: "max_attempts",
                    label: "Allowed attempts",
                    type: "number",
                    value: 1,
                  },
                ]}
                submit={submit("exams")}
                busy={busy}
              />
              <div className="sw-grid">
                {get("exams")
                  .filter((e) => batchIds.has(e.batch_id))
                  .map((e) => (
                    <div className="sw-card" key={e.id}>
                      <span className="sw-tag">
                        {e.published ? "Published" : "Draft"}
                      </span>
                      <h2>{e.title}</h2>
                      <p>{batch(e.batch_id)}</p>
                      <p>
                        {
                          get("exam_questions").filter(
                            (q) => q.exam_id === e.id,
                          ).length
                        }{" "}
                        questions
                      </p>
                      <button
                        disabled={busy}
                        onClick={() =>
                          action(async () => {
                            const { error } = await database()
                              .from("exams")
                              .update({ published: !e.published })
                              .eq("id", e.id);
                            if (error) throw error;
                          })
                        }
                      >
                        {e.published ? "Unpublish" : "Publish exam"}
                      </button>
                      <div className="sw-divider">
                        <Editor
                          title="Add question"
                          fields={[
                            {
                              name: "prompt",
                              label: "Question",
                              type: "textarea",
                            },
                            {
                              name: "kind",
                              label: "Type",
                              options: [
                                { id: "mcq", title: "Multiple choice" },
                                { id: "written", title: "Written answer" },
                              ],
                            },
                            {
                              name: "options_text",
                              label: "MCQ choices (one per line)",
                              type: "textarea",
                              required: false,
                            },
                            {
                              name: "correct",
                              label: "Correct choice number (first choice = 1)",
                              type: "number",
                              required: false,
                            },
                            {
                              name: "points",
                              label: "Points",
                              type: "number",
                              value: 1,
                            },
                            {
                              name: "position",
                              label: "Question order",
                              type: "number",
                              value: 1,
                            },
                          ]}
                          busy={busy}
                          submit={(v) =>
                            action(() =>
                              rpc("add_exam_question", {
                                eid: e.id,
                                prompt_text: v.prompt,
                                question_kind: v.kind,
                                choices:
                                  v.kind === "mcq"
                                    ? (v.options_text || "")
                                        .split("\n")
                                        .map((x: string) => x.trim())
                                        .filter(Boolean)
                                    : [],
                                correct:
                                  v.kind === "mcq"
                                    ? Number(v.correct) - 1
                                    : null,
                                weight: v.points,
                                sort_order: v.position,
                              }),
                            )
                          }
                        />
                      </div>
                      {get("exam_questions")
                        .filter((q) => q.exam_id === e.id)
                        .map((q) => (
                          <p key={q.id}>
                            {q.position}. {q.prompt} ({q.kind}, {q.points}{" "}
                            points)
                          </p>
                        ))}
                    </div>
                  ))}
              </div>
            </>
          )}
          {tab === "Exam marking" && (
            <div className="sw-list">
              {get("exam_attempts")
                .filter(
                  (a) =>
                    get("exams").some(
                      (e) => e.id === a.exam_id && batchIds.has(e.batch_id),
                    ) && a.status !== "in_progress",
                )
                .map((a) => (
                  <div className="sw-card" key={a.id}>
                    <span className="sw-tag">{a.status}</span>
                    <h2>{name(a.student_id)}</h2>
                    <h3>
                      {get("exams").find((e) => e.id === a.exam_id)?.title}
                    </h3>
                    {get("exam_questions")
                      .filter((q) => q.exam_id === a.exam_id)
                      .map((q) => (
                        <div className="sw-divider" key={q.id}>
                          <strong>{q.prompt}</strong>
                          <pre>
                            {q.kind === "mcq"
                              ? q.options[Number(a.answers[q.id])] ||
                                "No answer"
                              : a.answers[q.id] || "No answer"}
                          </pre>
                        </div>
                      ))}
                    {a.status === "review" ? (
                      <Editor
                        title="Final combined score (MCQ and written answers)"
                        fields={[
                          {
                            name: "score_percent",
                            label: "Overall percentage",
                            type: "number",
                          },
                          { name: "note", label: "Feedback", type: "textarea" },
                        ]}
                        busy={busy}
                        submit={(v) =>
                          action(() => rpc("review_exam", { aid: a.id, ...v }))
                        }
                      />
                    ) : (
                      <p>
                        {a.score}% · {a.feedback}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
          {tab === "People & access" && superadmin && (
            <>
              <div className="sw-grid">
                <Editor
                  title="Change account role"
                  fields={[
                    {
                      name: "uid",
                      label: "Person",
                      options: get("profiles").filter(
                        (p) => p.id !== profile!.id,
                      ),
                    },
                    {
                      name: "new_role",
                      label: "Role",
                      options: [
                        { id: "student", title: "Student" },
                        { id: "admin", title: "Admin" },
                        { id: "superadmin", title: "Superadmin" },
                      ],
                    },
                  ]}
                  submit={(v) => action(() => rpc("set_user_role", v))}
                  busy={busy}
                />
                <Editor
                  title="Assign Admin to course"
                  fields={[
                    {
                      name: "user_id",
                      label: "Admin",
                      options: get("profiles").filter(
                        (p) => p.role === "admin",
                      ),
                    },
                    courseField,
                  ]}
                  submit={submit("staff_assignments")}
                  busy={busy}
                />
                <Editor
                  title="Grant / suspend lifetime course access"
                  fields={[
                    {
                      name: "student_id",
                      label: "Student",
                      options: get("profiles").filter(
                        (p) => p.role === "student",
                      ),
                    },
                    courseField,
                    {
                      name: "active",
                      label: "Access active",
                      type: "checkbox",
                      value: true,
                    },
                  ]}
                  submit={submit("enrollments")}
                  busy={busy}
                />
                <Editor
                  title="Assign student to batch"
                  fields={[
                    {
                      name: "student_id",
                      label: "Student",
                      options: get("profiles").filter(
                        (p) => p.role === "student",
                      ),
                    },
                    batchField,
                  ]}
                  submit={submit("batch_members")}
                  busy={busy}
                />
              </div>
              <p>
                Batch membership requires an active course enrollment to access
                content. Moving batches does not remove lifetime course access.
              </p>
              <div className="sw-table-wrap">
                <table className="sw-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Account ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {get("profiles").map((p) => (
                      <tr key={p.id}>
                        <td>{p.full_name}</td>
                        <td>{p.role}</td>
                        <td>{p.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h2>Batch memberships</h2>
              {get("batch_members").map((m) => (
                <div className="sw-actions" key={m.student_id + m.batch_id}>
                  <span>
                    {name(m.student_id)} · {batch(m.batch_id)}
                  </span>
                  <button
                    className="sw-secondary"
                    disabled={busy}
                    onClick={() =>
                      action(async () => {
                        const { error } = await database()
                          .from("batch_members")
                          .delete()
                          .eq("student_id", m.student_id)
                          .eq("batch_id", m.batch_id);
                        if (error) throw error;
                      })
                    }
                  >
                    Remove from batch
                  </button>
                </div>
              ))}
              <h2>Admin assignments</h2>
              {get("staff_assignments").map((s) => (
                <div className="sw-actions" key={s.user_id + s.course_id}>
                  <span>
                    {name(s.user_id)} ·{" "}
                    {courses.find((c) => c.id === s.course_id)?.title}
                  </span>
                  <button
                    className="sw-secondary"
                    disabled={busy}
                    onClick={() =>
                      action(async () => {
                        const { error } = await database()
                          .from("staff_assignments")
                          .delete()
                          .eq("user_id", s.user_id)
                          .eq("course_id", s.course_id);
                        if (error) throw error;
                      })
                    }
                  >
                    Remove assignment
                  </button>
                </div>
              ))}
            </>
          )}
          {tab === "Settings" && superadmin && (
            <div className="sw-grid">
              <Editor
                title="Bank transfer details"
                fields={[
                  "bank",
                  "account_name",
                  "account_number",
                  "branch",
                ].map((key) => ({
                  name: key,
                  label: key.replaceAll("_", " "),
                  value: get("settings").find((s) => s.key === "bank")?.value?.[
                    key
                  ],
                }))}
                submit={(v) =>
                  action(() => save("settings", { key: "bank", value: v }))
                }
                busy={busy}
              />
              <Editor
                title="Certificate signatory"
                fields={["signatory", "title"].map((key) => ({
                  name: key,
                  label: key,
                  value: get("settings").find((s) => s.key === "certificate")
                    ?.value?.[key],
                }))}
                submit={(v) =>
                  action(() =>
                    save("settings", { key: "certificate", value: v }),
                  )
                }
                busy={busy}
              />
            </div>
          )}
          {tab === "Activity" && superadmin && (
            <div className="sw-table-wrap">
              <table className="sw-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Who</th>
                    <th>Action</th>
                    <th>Record</th>
                  </tr>
                </thead>
                <tbody>
                  {get("audit_log")
                    .slice()
                    .reverse()
                    .slice(0, 100)
                    .map((a) => (
                      <tr key={a.id}>
                        <td>{when(a.created_at)}</td>
                        <td>{a.actor ? name(a.actor) : "System"}</td>
                        <td>
                          {a.action} {a.entity}
                        </td>
                        <td>{a.record_id}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
