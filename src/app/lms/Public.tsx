import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router";
import { db, rpc } from "./client";
export function Verify() {
  const { id } = useParams(),
    [result, setResult] = useState<any>(null),
    [message, setMessage] = useState("Checking certificate…");
  useEffect(() => {
    if (!db) {
      setMessage(
        "Certificate verification will be available when the learning portal opens.",
      );
      return;
    }
    if (!/^[0-9a-f-]{36}$/i.test(id || "")) {
      setMessage("Certificate not found.");
      return;
    }
    rpc("verify_certificate", { cid: id })
      .then((data) => {
        setResult(data?.[0] || null);
        setMessage(data?.length ? "" : "Certificate not found.");
      })
      .catch(() =>
        setMessage(
          "Unable to verify right now. Please try again or contact SkillWave.",
        ),
      );
  }, [id]);
  return (
    <main className="sw-page">
      <span className="sw-eyebrow">SKILLWAVE ACADEMY</span>
      <h1>Certificate verification</h1>
      <div className="sw-card">
        {result ? (
          <>
            <span className="sw-tag">
              {result.valid ? "Valid certificate" : "Certificate revoked"}
            </span>
            <h2>{result.student_name}</h2>
            <p>{result.course_title}</p>
            <p>
              Issued {new Date(result.issued_at).toLocaleDateString("en-GB")}
            </p>
            <p className="sw-small">Certificate ID: {result.id}</p>
          </>
        ) : (
          <p role="status">{message}</p>
        )}
      </div>
      <Link className="sw-link" to="/">
        Back to SkillWave
      </Link>
    </main>
  );
}
export function Policy({ type }: { type: "privacy" | "terms" }) {
  return (
    <main className="sw-page">
      <span className="sw-eyebrow">SKILLWAVE ACADEMY</span>
      <h1>
        {type === "privacy"
          ? "Privacy information"
          : "Learning and access terms"}
      </h1>
      <article className="sw-card">
        {type === "privacy" ? (
          <>
            <h2>Your learning account</h2>
            <p>
              The learning portal uses your name, email, enrollments, lesson
              progress, payment slips, assignment submissions and assessment
              results to provide and manage your courses.
            </p>
            <h2>Who can access your information</h2>
            <p>
              You can access your own learning records. Assigned administrators
              review payments and coursework. Superadmins manage access and
              approve certificates. Certificate verification displays only the
              recipient name, course, issue date and validity.
            </p>
            <h2>Connected services</h2>
            <p>
              The portal uses Supabase for account authentication, records and
              private uploads, and YouTube for embedded videos. Opening or
              playing embedded videos is subject to the video provider’s privacy
              practices.
            </p>
            <h2>Questions and requests</h2>
            <p>
              Contact mail@skillwave.lk about your information or account. Do
              not upload unnecessary identity documents or unrelated sensitive
              information with payment slips or assignments.
            </p>
          </>
        ) : (
          <>
            <h2>Lifetime course access</h2>
            <p>
              An approved enrollment includes ongoing access to the purchased
              course’s published recordings, learning materials and updates to
              that same course. Separate new courses require separate
              enrollment.
            </p>
            <h2>Batch learning</h2>
            <p>
              Live sessions, exams, assignments and marking support belong to
              your assigned batch. Enrollment does not automatically include
              future batches. Published deadlines and assessment requirements
              apply.
            </p>
            <h2>Payments</h2>
            <p>
              Bank transfers are reviewed before course access is granted.
              Upload a readable transfer slip and reference. Contact SkillWave
              before paying if you need clarification on fees, cancellations or
              refunds.
            </p>
            <h2>Certificates</h2>
            <p>
              Your Admin must review and pass your final assignment, then
              request a certificate. A certificate is issued only after
              Superadmin approval. Incorrect certificates may be revoked.
            </p>
            <h2>Learning materials</h2>
            <p>
              Use your account and paid materials for your own learning. Do not
              redistribute private lesson links, student submissions or account
              access.
            </p>
          </>
        )}
        <p className="sw-divider">
          Contact:{" "}
          <a className="sw-link" href="mailto:mail@skillwave.lk">
            mail@skillwave.lk
          </a>
        </p>
      </article>
    </main>
  );
}
export function Metadata() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const names: Record<string, string> = {
      "/": "Practical IT Courses in Sri Lanka",
      "/fit": "Foundations of Information Technology",
      "/robo-iot": "Robotics & Internet of Things",
      "/devops": "DevOps Leadership",
      "/web-master": "Full Stack Web Development",
      "/news": "News and Learning Resources",
      "/free-learning": "Free IT Video Lessons",
      "/login": "Sign in to Your Learning Portal",
      "/learn": "My Learning",
      "/admin": "Academy Administration",
      "/privacy": "Privacy Information",
      "/terms": "Learning Terms",
    };
    document.title =
      (names[pathname] || "Certificate Verification") + " | SkillWave Academy";
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute(
      "content",
      pathname === "/free-learning"
        ? "Explore free IT video lessons from SkillWave Academy. Start learning practical technology skills."
        : "Learn practical IT skills with SkillWave Academy in Baduraliya and online. Explore courses, recorded lessons and live batch sessions.",
    );
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        "content",
        /^\/(learn|admin|login|verify)/.test(pathname)
          ? "noindex, nofollow"
          : "index, follow",
      );
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute(
      "href",
      (import.meta.env.VITE_SITE_URL || location.origin) + pathname,
    );
    if (hash) {
      setTimeout(
        () =>
          document
            .getElementById(hash.slice(1))
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
