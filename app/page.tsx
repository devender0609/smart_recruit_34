"use client";
import { useState } from "react";
import ResultsTable from "../components/ResultsTable";

export default function Page() {
  const [jd, setJd] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!jd || jd.trim().length === 0) && !jdFile) {
      alert("Please paste a Job Description or upload a JD file.");
      return;
    }
    if (!files || files.length === 0) {
      alert("Please upload at least one resume.");
      return;
    }

    const form = new FormData();
    if (jd && jd.trim().length > 0) form.append("jd", jd);
    if (!jd || jd.trim().length === 0) {
      if (jdFile) form.append("jdFile", jdFile);
    }
    Array.from(files).forEach((f) => form.append("resumes", f));

    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/score", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8">
      <section className="card p-6">
        <h1 className="text-2xl font-semibold mb-2">AI Candidate Shortlisting</h1>
        <p className="text-gray-600 mb-6">
          Upload a job description and unlimited resumes (PDF, DOCX, TXT). Get an instant ranked shortlist with evidence.
        </p>

        <form onSubmit={onSubmit} className="grid gap-4">
          {/* Paste JD */}
          <label className="grid gap-2">
            <span className="text-sm font-medium">Job Description (Paste)</span>
            <textarea
              className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-300 min-h-[140px]"
              placeholder="Paste the job description here..."
              value={jd}
              onChange={(e) => {
                setJd(e.target.value);
                // If user starts typing, we ignore uploaded JD file
                if (e.target.value.trim().length > 0) setJdFile(null);
              }}
            />
            <span className="text-xs text-gray-500">
              Tip: If you upload a JD file below, you don’t need to paste text.
            </span>
          </label>

          {/* Upload JD */}
          <label className="grid gap-2">
            <span className="text-sm font-medium">Or Upload JD (PDF, DOCX, TXT)</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setJdFile(f);
                // If user chooses a JD file, clear the pasted JD so API uses the file
                if (f) setJd("");
              }}
              className="file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white file:hover:bg-brand-700 border rounded-xl p-2"
            />
          </label>

          {/* Upload Resumes */}
          <label className="grid gap-2">
            <span className="text-sm font-medium">Resumes (PDF, DOCX, TXT) — multiple allowed</span>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFiles(e.target.files)}
              className="file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white file:hover:bg-brand-700 border rounded-xl p-2"
              required
            />
          </label>

          <div className="flex gap-3 items-center flex-wrap">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Scoring..." : "Generate Shortlist"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setJd("");
                setJdFile(null);
                setFiles(null);
                setResults([]);
              }}
            >
              Reset
            </button>
            <span className="badge border-brand-200 text-brand-700 bg-brand-50">
              No hard upload limits (server-configurable)
            </span>
          </div>
        </form>
      </section>

      <ResultsTable results={results} />
    </div>
  );
}
