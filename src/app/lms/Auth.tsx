import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { db, database, rpc } from "./client";
import "./lms.css";
type Profile = {
  id: string;
  full_name: string;
  role: "student" | "admin" | "superadmin";
};
const Context = createContext<{
  profile: Profile | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}>({ profile: null, loading: true, error: "", refresh: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  async function refresh() {
    try {
      if (!db) return;
      const { data, error: authError } = await db.auth.getUser();
      if (authError && data.user) throw authError;
      if (!data.user) {
        setProfile(null);
        return;
      }
      const result = await db
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (result.error) throw result.error;
      setProfile(result.data);
      setError("");
    } catch (e: any) {
      setError(e.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
    const sub = db?.auth.onAuthStateChange(() => {
      setTimeout(refresh, 0);
    });
    return () => sub?.data.subscription.unsubscribe();
  }, []);
  return (
    <Context.Provider value={{ profile, loading, error, refresh }}>
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
export function Setup() {
  return (
    <div className="sw-card">
      <span className="sw-tag">Coming online</span>
      <h2>Your learning journey starts here</h2>
      <p>
        We’re connecting the secure learning portal. Please contact SkillWave
        for course enrollment in the meantime.
      </p>
      <a className="sw-button" href="mailto:mail@skillwave.lk">
        Contact SkillWave
      </a>
    </div>
  );
}
export function Gate({
  children,
  staff = false,
}: {
  children: ReactNode;
  staff?: boolean;
}) {
  const { profile, loading, error } = useAuth();
  if (!db)
    return (
      <main className="sw-page">
        <Setup />
      </main>
    );
  if (loading) return <main className="sw-page">Loading your account…</main>;
  if (error)
    return (
      <main className="sw-page">
        <p role="alert">{error}</p>
      </main>
    );
  if (!profile) return <Navigate to="/login" replace />;
  if (staff && profile.role === "student")
    return <Navigate to="/learn" replace />;
  return <>{children}</>;
}
export function Login() {
  const { profile, refresh } = useAuth(),
    navigate = useNavigate();
  const [mode, setMode] = useState(
      new URLSearchParams(location.search).get("mode") === "recovery"
        ? "password"
        : "login",
    ),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const s = db?.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("password");
    });
    return () => s?.data.subscription.unsubscribe();
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const auth = database().auth;
      const email = String(f.get("email") || ""),
        password = String(f.get("password") || "");
      let result;
      if (mode === "register") {
        result = await auth.signUp({
          email,
          password,
          options: {
            data: { full_name: f.get("name") },
            emailRedirectTo: location.origin + "/login",
          },
        });
        if (result.error) throw result.error;
        setMessage("Check your email to confirm your account, then sign in.");
      } else if (mode === "reset") {
        result = await auth.resetPasswordForEmail(email, {
          redirectTo: location.origin + "/login?mode=recovery",
        });
        if (result.error) throw result.error;
        setMessage("If an account exists, a reset link will arrive by email.");
      } else if (mode === "password") {
        result = await auth.updateUser({ password });
        if (result.error) throw result.error;
        setMessage("Password updated.");
        setMode("login");
      } else {
        result = await auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        await refresh();
        navigate("/learn");
      }
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="sw-page sw-auth">
      <div className="sw-auth-intro">
        <span className="sw-eyebrow">SKILLWAVE LEARNING</span>
        <h1>
          Your next chapter
          <br />
          starts here.
        </h1>
        <p>Learn at your pace. Build real skills. Keep growing.</p>
        <div className="sw-perks">
          <p>✓ Lifetime recordings and course updates</p>
          <p>✓ Live sessions with your batch</p>
          <p>✓ Projects, feedback and verified certificates</p>
        </div>
      </div>
      <section className="sw-card">
        {!db ? (
          <Setup />
        ) : (
          <>
            <span className="sw-tag">Student & staff portal</span>
            <h2>
              {
                (
                  {
                    login: "Welcome back",
                    register: "Create your account",
                    reset: "Reset your password",
                    password: "Choose a new password",
                  } as any
                )[mode]
              }
            </h2>
            {profile && mode !== "password" ? (
              <>
                <p>You’re signed in as {profile.full_name}.</p>
                <Link
                  className="sw-button"
                  to={profile.role === "student" ? "/learn" : "/admin"}
                >
                  Open dashboard
                </Link>
              </>
            ) : (
              <form onSubmit={submit} className="sw-form">
                {mode === "register" && (
                  <label>
                    Full name
                    <input
                      name="name"
                      required
                      minLength={2}
                      autoComplete="name"
                    />
                  </label>
                )}
                {mode !== "password" && (
                  <label>
                    Email address
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                    />
                  </label>
                )}
                {mode !== "reset" && (
                  <label>
                    Password
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                    />
                  </label>
                )}
                <button disabled={busy}>
                  {busy
                    ? "Please wait…"
                    : mode === "login"
                      ? "Sign in"
                      : mode === "register"
                        ? "Create account"
                        : mode === "reset"
                          ? "Send reset link"
                          : "Update password"}
                </button>
              </form>
            )}
            <p role="status">{message}</p>
            <div className="sw-actions">
              {mode !== "login" && (
                <button
                  className="sw-link"
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                >
                  Sign in
                </button>
              )}
              {mode === "login" && (
                <>
                  <button
                    className="sw-link"
                    onClick={() => setMode("register")}
                  >
                    Create account
                  </button>
                  <button className="sw-link" onClick={() => setMode("reset")}>
                    Forgot password?
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
