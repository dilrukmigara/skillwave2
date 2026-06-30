import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock, ArrowLeft, RefreshCw, Trash2, Search,
  Download, Filter, Inbox, Mail, UserCheck, LayoutDashboard, Database
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface Submission {
  id: number;
  form_type: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
}

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect passcode. Try again.");
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/submissions");
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        console.error("Failed to fetch submissions");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    
    try {
      const response = await fetch("/api/submissions/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setSubmissions(submissions.filter((s) => s.id !== id));
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Form Type", "Name", "Phone", "Email", "Message", "Submitted At"];
    const csvRows = [
      headers.join(","),
      ...filteredSubmissions.map((s) => [
        s.id,
        `"${s.form_type.replace(/"/g, '""')}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.phone.replace(/"/g, '""')}"`,
        `"${s.email ? s.email.replace(/"/g, '""') : ""}"`,
        `"${s.message ? s.message.replace(/"/g, '""').replace(/\n/g, " ") : ""}"`,
        `"${s.created_at}"`
      ].join(","))
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `skillwave_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFormType = (type: string) => {
    switch (type) {
      case "contact":
        return "Contact Form";
      case "newsletter":
        return "Newsletter Sub";
      case "fit_enrollment":
        return "FIT Enrollment";
      case "devops_enrollment":
        return "DevOps Enrollment";
      case "robo-iot_enrollment":
        return "Robotics & IoT";
      case "web-master_enrollment":
        return "Web Master Enrollment";
      default:
        return type;
    }
  };

  const getFormBadgeColor = (type: string) => {
    switch (type) {
      case "contact":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "newsletter":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "fit_enrollment":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesFilter = filterType === "all" || s.form_type === filterType;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.message && s.message.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const totalCount = submissions.length;
  const contactCount = submissions.filter((s) => s.form_type === "contact").length;
  const enrolCount = submissions.filter((s) => s.form_type.endsWith("_enrollment")).length;
  const newsletterCount = submissions.filter((s) => s.form_type === "newsletter").length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050f1a] flex items-center justify-center p-4 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-[#07121f] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl transition-colors duration-300"
        >
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Portal</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Enter passcode to view database submissions</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Passcode (default: admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white rounded-xl"
                required
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-[#183d64] text-white font-semibold rounded-xl"
            >
              Verify Passcode
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400">
              <ArrowLeft className="w-4 h-4" /> Return to Website
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050f1a] pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Database className="w-3.5 h-3.5" /> Local SQLite Database
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Database Console
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchSubmissions}
              disabled={loading}
              variant="outline"
              className="h-10 px-4 gap-2 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button
              onClick={exportToCSV}
              disabled={filteredSubmissions.length === 0}
              className="h-10 px-4 gap-2 bg-gradient-to-r from-emerald-500 to-[#183d64] text-white rounded-xl hover:opacity-90"
            >
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Link to="/">
              <Button
                variant="outline"
                className="h-10 px-4 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Website
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Submissions", value: totalCount, icon: LayoutDashboard, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25" },
            { title: "Inquiries (Contact)", value: contactCount, icon: Inbox, color: "text-blue-500 bg-blue-500/10 border-blue-500/25" },
            { title: "Enrollments", value: enrolCount, icon: UserCheck, color: "text-amber-500 bg-amber-500/10 border-amber-500/25" },
            { title: "Newsletter Subs", value: newsletterCount, icon: Mail, color: "text-purple-500 bg-purple-500/10 border-purple-500/25" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#07121f] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-550 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-[#07121f] border border-gray-200 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <span className="text-sm font-semibold text-gray-550 dark:text-gray-400 flex items-center gap-1.5">
              <Filter className="w-4 h-4" /> Filter:
            </span>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "All Submissions", value: "all" },
                { label: "Contact Form", value: "contact" },
                { label: "FIT Enroll", value: "fit_enrollment" },
                { label: "DevOps Enroll", value: "devops_enrollment" },
                { label: "Robotics Enroll", value: "robo-iot_enrollment" },
                { label: "Web Enroll", value: "web-master_enrollment" },
                { label: "Newsletter", value: "newsletter" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                    filterType === opt.value
                      ? "bg-[#183d64] border-[#183d64] text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-slate-900"
                      : "bg-gray-50 border-gray-200 text-gray-650 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-405 pointer-events-none" />
            <Input
              placeholder="Search by name, phone, email, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Database Table */}
        <div className="bg-white dark:bg-[#07121f] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Form Type</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Inquiry / Details</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-white/5 text-sm text-gray-750 dark:text-gray-300">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                        No submissions logged in the database yet.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((s) => (
                      <motion.tr
                        key={s.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-gray-400">{s.id}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${getFormBadgeColor(s.form_type)}`}>
                            {formatFormType(s.form_type)}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{s.name}</td>
                        <td className="py-4 px-6 font-mono text-xs">{s.phone}</td>
                        <td className="py-4 px-6 text-gray-500 dark:text-gray-400">{s.email || "N/A"}</td>
                        <td className="py-4 px-6 max-w-xs truncate" title={s.message}>
                          {s.message || <span className="text-gray-400 italic">None</span>}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-550 dark:text-gray-400">
                          {new Date(s.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                            title="Delete Submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
