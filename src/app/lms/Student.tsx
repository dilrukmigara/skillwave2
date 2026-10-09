import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Play, GraduationCap } from "lucide-react";
import {
  database,
  db,
  rows,
  rpc,
  save,
  upload,
  openFile,
  when,
} from "./client";
import { useAuth, Setup } from "./Auth";
import { certificatePdf } from "./certificate";
type Row = Record<string, any>;
export function Student() {
  const { profile, refresh } = useAuth();
  const [data, setData] = useState<Record<string, Row[]>>({}),
    [tab, setTab] = useState("My courses"),
    [course, setCourse] = useState(""),
    [lesson, setLesson] = useState<Row | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  async function load() {
    try {
      const tables = [
        "courses",
        "batches",
        "enrollments",
        "batch_members",
        "lessons",
        "progress",
        "live_sessions",
        "assignments",
        "submissions",
        "payments",
        "announcements",
        "exams",
        "exam_attempts",
        "certificates",
        "certificate_requests",
        "settings",
      ];
      const all = await Promise.all(tables.map((t) => rows(t)));
      setData(Object.fromEntries(tables.map((t, i) => [t, all[i]])));
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
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  const get = (t: string) => data[t] || [],
    mine = get("enrollments").filter(
      (e) => e.student_id === profile!.id && e.active,
    ),
    owned = new Set(mine.map((e) => e.course_id)),
    myBatches = new Set(
      get("batch_members")
        .filter((x) => x.student_id === profile!.id)
        .map((x) => x.batch_id),
    );
  const batchName = (id: string) =>
      get("batches").find((x) => x.id === id)?.name || "",
    title = (id: string) =>
      get("courses").find((x) => x.id === id)?.title || "";
  const lessons = get("lessons")
      .filter((l) => l.course_id === course)
      .sort((a, b) => a.position - b.position),
    done = new Set(get("progress").map((p) => p.lesson_id));
  return (
    <main className="sw-page">
      <div className="sw-header">
        <div>
          <span className="sw-eyebrow">YOUR LEARNING SPACE</span>
          <h1>Welcome, {profile!.full_name.split(" ")[0] || "learner"}.</h1>
          <p>Small steps. Real progress. A lifetime of learning.</p>
        </div>
        <div className="sw-actions">
          {profile!.role !== "student" && (
            <Link className="sw-button" to="/admin">
              Admin dashboard
            </Link>
          )}
          <button
            className="sw-secondary"
            onClick={() =>
              action(async () => {
                await database().auth.signOut();
                await refresh();
              })
            }
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="sw-tabs">
        {[
          "My courses",
          "Live sessions",
          "Assignments",
          "Exams",
          "Payments",
          "Certificates",
          "Announcements",
          "Profile",
        ].map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            onClick={() => {
              setTab(t);
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
        <p>Loading your learning space…</p>
      ) : (
        <>
          {tab === "My courses" &&
            (!course ? (
              <>
                <div className="sw-grid">
                  {get("courses")
                    .filter((c) => owned.has(c.id))
                    .map((c) => {
                      const ls = get("lessons").filter(
                        (l) => l.course_id === c.id,
                      );
                      return (
                        <article className="sw-card" key={c.id}>
                          <div className="sw-course-icon">
                            <BookOpen />
                          </div>
                          <span className="sw-tag">Lifetime access</span>
                          <h2>{c.title}</h2>
                          <p>{c.description}</p>
                          <p className="sw-meta">
                            {ls.filter((l) => done.has(l.id)).length} /{" "}
                            {ls.length} lessons completed
                          </p>
                          <button
                            onClick={() => {
                              setCourse(c.id);
                              setLesson(
                                ls.find((l) => !done.has(l.id)) ||
                                  ls[0] ||
                                  null,
                              );
                            }}
                          >
                            Continue learning <Play size={16} />
                          </button>
                        </article>
                      );
                    })}
                </div>
                {!mine.length && (
                  <div className="sw-card">
                    <h2>Your first course is waiting</h2>
                    <p>
                      Choose a course in Payments, upload your bank transfer
                      slip, and we’ll review your enrollment.
                    </p>
                    <button onClick={() => setTab("Payments")}>
                      Explore courses
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  className="sw-secondary"
                  onClick={() => {
                    setCourse("");
                    setLesson(null);
                  }}
                >
                  ← All courses
                </button>
                <h2>{title(course)}</h2>
                <div className="sw-layout">
                  <aside className="sw-card sw-lessons">
                    {lessons.map((l) => (
                      <button
                        className={lesson?.id === l.id ? "" : "sw-secondary"}
                        key={l.id}
                        onClick={() => setLesson(l)}
                      >
                        {done.has(l.id) ? "✓" : "▷"} {l.module} · {l.title}
                      </button>
                    ))}
                  </aside>
                  <section>
                    {lesson ? (
                      <>
                        <Video id={lesson.youtube_id} title={lesson.title} />
                        <h2>{lesson.title}</h2>
                        <pre>{lesson.notes}</pre>
                        <button
                          disabled={busy || done.has(lesson.id)}
                          onClick={() =>
                            action(() =>
                              save("progress", {
                                student_id: profile!.id,
                                lesson_id: lesson.id,
                              }),
                            )
                          }
                        >
                          {done.has(lesson.id)
                            ? "Completed"
                            : "Mark as completed"}
                        </button>
                      </>
                    ) : (
                      <div className="sw-card">
                        Your lessons will appear here once published.
                      </div>
                    )}
                  </section>
                </div>
              </>
            ))}
          {tab === "Live sessions" && (
            <div className="sw-grid">
              {get("live_sessions")
                .filter((s) => myBatches.has(s.batch_id))
                .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
                .map((s) => (
                  <article className="sw-card" key={s.id}>
                    <span className="sw-tag">{batchName(s.batch_id)}</span>
                    <h2>{s.title}</h2>
                    <p>{when(s.starts_at)} · Sri Lanka time</p>
                    <a
                      className="sw-button"
                      href={s.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join live session
                    </a>
                    {s.recording_id && (
                      <div className="sw-divider">
                        <Video id={s.recording_id} title={s.title} />
                      </div>
                    )}
                  </article>
                ))}
              {!get("live_sessions").some((s) => myBatches.has(s.batch_id)) && (
                <Empty text="Your batch’s live sessions will appear here." />
              )}
            </div>
          )}
          {tab === "Assignments" && (
            <div className="sw-list">
              {get("assignments")
                .filter((a) => myBatches.has(a.batch_id))
                .map((a) => {
                  const s = get("submissions").find(
                    (s) =>
                      s.assignment_id === a.id && s.student_id === profile!.id,
                  );
                  return (
                    <article className="sw-card" key={a.id}>
                      <span className="sw-tag">
                        {a.is_final
                          ? "Final assignment"
                          : batchName(a.batch_id)}
                      </span>
                      <h2>{a.title}</h2>
                      <pre>{a.instructions}</pre>
                      <p>Due {when(a.due_at)}</p>
                      {s && (
                        <div className="sw-banner">
                          <strong>{s.status}</strong>
                          {s.marks !== null && ` · ${s.marks}/100`}
                          <p>{s.feedback}</p>
                          <button
                            className="sw-secondary"
                            onClick={() => action(() => openFile(s.file_path))}
                          >
                            View submission
                          </button>
                        </div>
                      )}
                      {(!s || s.status === "revision") &&
                      new Date(a.due_at) > new Date() ? (
                        <form
                          className="sw-form"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const f = new FormData(e.currentTarget),
                              file = f.get("file") as File;
                            action(async () => {
                              const path = await upload(
                                file,
                                "assignments",
                                profile!.id,
                              );
                              await rpc("submit_assignment", {
                                aid: a.id,
                                path,
                              });
                            });
                          }}
                        >
                          <label>
                            Your work · PDF, JPG or PNG · max 10 MB
                            <input
                              name="file"
                              type="file"
                              accept="application/pdf,image/jpeg,image/png"
                              required
                            />
                          </label>
                          <button disabled={busy}>Submit assignment</button>
                        </form>
                      ) : (
                        !s && <p>Submission deadline has passed.</p>
                      )}
                    </article>
                  );
                })}
              {!get("assignments").some((a) => myBatches.has(a.batch_id)) && (
                <Empty text="Your batch’s assignments will appear here." />
              )}
            </div>
          )}
          {tab === "Exams" && (
            <ExamList
              exams={get("exams").filter((e) => myBatches.has(e.batch_id))}
              attempts={get("exam_attempts").filter(
                (a) => a.student_id === profile!.id,
              )}
              reload={load}
            />
          )}
          {tab === "Payments" && (
            <>
              <div className="sw-banner">
                Recordings, learning materials and updates to the same course
                are included for life. Live sessions and assessments belong to
                your assigned batch.
              </div>
              <div className="sw-grid">
                {get("courses")
                  .filter((c) => c.published)
                  .map((c) => (
                    <article className="sw-card" key={c.id}>
                      <h2>{c.title}</h2>
                      <p>{c.description}</p>
                      <h3>LKR {Number(c.price).toLocaleString()}</h3>
                      {owned.has(c.id) ? (
                        <span className="sw-tag">You have lifetime access</span>
                      ) : (
                        <PaymentForm
                          course={c}
                          batches={get("batches").filter(
                            (b) => b.course_id === c.id,
                          )}
                          bank={
                            get("settings").find((s) => s.key === "bank")?.value
                          }
                          busy={busy}
                          submit={(
                            bid: string,
                            path: File,
                            reference: string,
                          ) =>
                            action(async () => {
                              const filePath = await upload(
                                path,
                                "payments",
                                profile!.id,
                              );
                              await rpc("submit_payment", {
                                bid,
                                path: filePath,
                                bank_reference: reference,
                              });
                            })
                          }
                        />
                      )}
                    </article>
                  ))}
              </div>
              <h2>Payment history</h2>
              {get("payments")
                .filter((p) => p.student_id === profile!.id)
                .map((p) => (
                  <div className="sw-card" key={p.id}>
                    <h3>{batchName(p.batch_id)}</h3>
                    <span className="sw-tag">{p.status}</span>
                    <p>Reference: {p.reference}</p>
                    <p>{p.feedback}</p>
                  </div>
                ))}
            </>
          )}
          {tab === "Certificates" && (
            <>
              <div className="sw-banner">
                Your final assignment is reviewed by your Admin. After you pass,
                your Admin requests a certificate and the Superadmin approves
                its issue.
              </div>
              <div className="sw-grid">
                {get("certificates")
                  .filter((c) => c.student_id === profile!.id)
                  .map((c) => (
                    <article className="sw-card" key={c.id}>
                      <GraduationCap />
                      <h2>{c.course_title}</h2>
                      <p>{c.student_name}</p>
                      <span className="sw-tag">
                        {c.revoked_at ? "Revoked" : "Issued"}
                      </span>
                      <p>{when(c.issued_at)}</p>
                      {!c.revoked_at && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            action(() =>
                              certificatePdf(
                                c,
                                get("settings").find(
                                  (s) => s.key === "certificate",
                                )?.value,
                              ),
                            )
                          }
                        >
                          Download certificate
                        </button>
                      )}
                      <p>
                        <Link className="sw-link" to={"/verify/" + c.id}>
                          Verify certificate
                        </Link>
                      </p>
                    </article>
                  ))}
              </div>
              {get("certificate_requests")
                .filter(
                  (r) =>
                    r.status !== "issued" &&
                    get("submissions").some(
                      (s) =>
                        s.id === r.submission_id &&
                        s.student_id === profile!.id,
                    ),
                )
                .map((r) => (
                  <p className="sw-banner" key={r.id}>
                    Certificate request:{" "}
                    {r.status === "pending"
                      ? "Awaiting Superadmin approval"
                      : "Returned to Admin"}{" "}
                    {r.reason}
                  </p>
                ))}
            </>
          )}
          {tab === "Announcements" && (
            <div className="sw-list">
              {get("announcements")
                .filter((a) => myBatches.has(a.batch_id))
                .map((a) => (
                  <article className="sw-card" key={a.id}>
                    <span className="sw-tag">{batchName(a.batch_id)}</span>
                    <h2>{a.title}</h2>
                    <pre>{a.body}</pre>
                  </article>
                ))}
              {!get("announcements").some((a) => myBatches.has(a.batch_id)) && (
                <Empty text="No batch announcements yet." />
              )}
            </div>
          )}
          {tab === "Profile" && (
            <form
              className="sw-card sw-form"
              onSubmit={(e) => {
                e.preventDefault();
                const name = new FormData(e.currentTarget).get("name");
                action(async () => {
                  await rpc("update_name", { new_name: name });
                  await refresh();
                });
              }}
            >
              <h2>Your profile</h2>
              <label>
                Full name for your certificate
                <input
                  name="name"
                  defaultValue={profile!.full_name}
                  required
                  minLength={2}
                />
              </label>
              <p>
                Issued certificates retain the name approved at the time of
                issue.
              </p>
              <button disabled={busy}>Save name</button>
            </form>
          )}
        </>
      )}
    </main>
  );
}
function PaymentForm({ course, batches, bank, busy, submit }: any) {
  if (!bank?.account_number)
    return (
      <p>
        Bank details are being confirmed. Contact SkillWave before making a
        payment.
      </p>
    );
  return (
    <form
      className="sw-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        submit(f.get("batch"), f.get("file"), f.get("reference"));
      }}
    >
      <div className="sw-banner">
        <strong>{bank.bank}</strong>
        <p>
          {bank.account_name}
          <br />
          {bank.account_number}
          <br />
          {bank.branch}
        </p>
      </div>
      <label>
        Choose your batch
        <select name="batch" required>
          <option value="">Select a batch</option>
          {batches.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Bank transfer reference
        <input name="reference" required minLength={2} />
      </label>
      <label>
        Payment slip · PDF, JPG or PNG · max 10 MB
        <input
          name="file"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          required
        />
      </label>
      <button disabled={busy || !batches.length}>
        Send for payment review
      </button>
    </form>
  );
}
export function Video({ id, title }: { id: string; title: string }) {
  return (
    <iframe
      className="sw-video"
      src={`https://www.youtube-nocookie.com/embed/${id}`}
      title={title}
      loading="lazy"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <div className="sw-card">
      <p>{text}</p>
    </div>
  );
}
export function FreeLearning() {
  const [lessons, setLessons] = useState<Row[]>([]),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(!!db);
  useEffect(() => {
    if (db)
      database()
        .from("lessons")
        .select("id,title,module,notes,youtube_id")
        .eq("is_free", true)
        .eq("published", true)
        .order("position")
        .then(({ data, error }) => {
          if (error) setError(error.message);
          else setLessons(data || []);
          setLoading(false);
        });
  }, []);
  return (
    <main className="sw-page">
      <span className="sw-eyebrow">FREE LEARNING LIBRARY</span>
      <h1>
        A little curiosity.
        <br />A world of possibility.
      </h1>
      <p>Explore free lessons from SkillWave. No account needed.</p>
      <label className="sw-search">
        Find a lesson
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by topic or lesson"
        />
      </label>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p>Loading lessons…</p>
      ) : (
        <div className="sw-grid">
          {lessons
            .filter((l) =>
              (l.title + " " + l.module)
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((l) => (
              <article className="sw-card" key={l.id}>
                <Video id={l.youtube_id} title={l.title} />
                <span className="sw-tag">{l.module}</span>
                <h2>{l.title}</h2>
                <pre>{l.notes}</pre>
              </article>
            ))}
          {!lessons.length && (
            <Empty text="Our free lesson collection is coming soon. Explore our courses while we prepare it." />
          )}
        </div>
      )}
      <Link to="/login" className="sw-button">
        Start your learning journey
      </Link>
    </main>
  );
}
function ExamList({
  exams,
  attempts,
  reload,
}: {
  exams: Row[];
  attempts: Row[];
  reload: () => Promise<void>;
}) {
  const [active, setActive] = useState<Row | null>(null),
    [questions, setQuestions] = useState<Row[]>([]),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [seconds, setSeconds] = useState(0);
  async function start(eid: string) {
    setBusy(true);
    try {
      const id = await rpc("start_exam", { eid });
      const { data, error } = await database()
        .from("exam_attempts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setActive(data);
      setAnswers(data.answers);
      const q = await database()
        .from("exam_questions")
        .select("*")
        .eq("exam_id", eid)
        .order("position");
      if (q.error) throw q.error;
      setQuestions(q.data || []);
      setMessage("");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function persist(finish: boolean) {
    if (!active) return;
    setBusy(true);
    try {
      await rpc("save_exam_answers", {
        aid: active.id,
        response: answers,
        finish,
      });
      setMessage(finish ? "Exam submitted." : "Answers saved.");
      if (finish) {
        setActive(null);
        await reload();
      }
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!active) return;
    const tick = () =>
      setSeconds(
        Math.max(
          0,
          Math.floor((Date.parse(active.deadline) - Date.now()) / 1000),
        ),
      );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [active]);
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      rpc("save_exam_answers", {
        aid: active.id,
        response: answers,
        finish: false,
      }).catch((e) => setMessage("Autosave failed: " + e.message));
    }, 800);
    return () => clearTimeout(timer);
  }, [answers, active]);
  useEffect(() => {
    if (active && seconds === 0 && Date.parse(active.deadline) <= Date.now())
      persist(true);
  }, [seconds, active]);
  return (
    <>
      {message && (
        <p role="status" className="sw-banner">
          {message}
        </p>
      )}
      {active ? (
        <section className="sw-card">
          <div className="sw-header">
            <h2>Exam in progress</h2>
            <span className="sw-tag">
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}{" "}
              remaining
            </span>
          </div>
          <p>
            Answers save as you work. Your deadline continues if you leave this
            page.
          </p>
          {questions.map((q, i) => (
            <div className="sw-question" key={q.id}>
              <h3>
                {i + 1}. {q.prompt}
              </h3>
              <p>{q.points} points</p>
              {q.kind === "mcq" ? (
                q.options.map((option: string, n: number) => (
                  <label key={n}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === String(n)}
                      onChange={() =>
                        setAnswers({ ...answers, [q.id]: String(n) })
                      }
                    />
                    {option}
                  </label>
                ))
              ) : (
                <label>
                  Written answer
                  <textarea
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [q.id]: e.target.value })
                    }
                  />
                </label>
              )}
            </div>
          ))}
          <div className="sw-actions">
            <button disabled={busy} onClick={() => persist(false)}>
              Save answers
            </button>
            <button disabled={busy} onClick={() => persist(true)}>
              Submit final answers
            </button>
          </div>
        </section>
      ) : (
        <div className="sw-grid">
          {exams.map((e) => (
            <article className="sw-card" key={e.id}>
              <h2>{e.title}</h2>
              <p>
                {e.duration_minutes} minutes · Pass mark {e.pass_mark}% ·{" "}
                {e.max_attempts} attempt(s)
              </p>
              <p>
                {when(e.opens_at)} – {when(e.closes_at)}
              </p>
              <button
                disabled={
                  busy ||
                  (!attempts.some(
                    (a) => a.exam_id === e.id && a.status === "in_progress",
                  ) &&
                    (Date.now() < Date.parse(e.opens_at) ||
                      Date.now() >= Date.parse(e.closes_at)))
                }
                onClick={() => start(e.id)}
              >
                Start / resume exam
              </button>
              {attempts
                .filter((a) => a.exam_id === e.id)
                .map((a) => (
                  <p key={a.id}>
                    Attempt: {a.status}
                    {a.score !== null && ` · ${a.score}%`} {a.feedback}
                  </p>
                ))}
            </article>
          ))}
          {!exams.length && (
            <Empty text="Your batch’s exams will appear here." />
          )}
        </div>
      )}
    </>
  );
}
