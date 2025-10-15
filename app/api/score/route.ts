// Lazy-import version to prevent build-time evaluation of heavy libs
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const defaultSkills = [
  "javascript","typescript","react","node","next.js","python","java","c++","sql","nosql","aws","gcp","azure",
  "docker","kubernetes","ci/cd","ml","nlp","tensorflow","pytorch","golang","ruby","php","html","css","tailwind",
  "jira","git","agile","scrum","kafka","spark","hadoop","linux","bash","rest","graphql","microservices"
];

function tokenize(text: string) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.#]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function estimateYears(text: string) {
  const m = text.match(/(\d+)(\+)?\s*(?:years|yrs)/i);
  return m ? (m[0]) : "—";
}

function detectEducation(text: string) {
  const t = text.toLowerCase();
  if (t.includes("phd") || t.includes("doctor of philosophy")) return "PhD";
  if (t.includes("master of") || t.includes("msc") || t.includes("m.s.") || t.includes("m.tech")) return "Master's";
  if (t.includes("bachelor of") || t.includes("bsc") || t.includes("b.e.") || t.includes("b.tech")) return "Bachelor's";
  return "—";
}

function snippet(text: string, jdTokens: string[]) {
  const idx = jdTokens.findIndex(k => text.toLowerCase().includes(k));
  if (idx === -1) return text.slice(0, 200) + (text.length > 200 ? "..." : "");
  const key = jdTokens[idx];
  const pos = text.toLowerCase().indexOf(key);
  const start = Math.max(0, pos - 80);
  const end = Math.min(text.length, pos + 120);
  return text.slice(start, end) + (end < text.length ? "...": "");
}

async function bufferToText(filename: string, buf: Buffer): Promise<string> {
  // Dynamic imports so nothing runs at build-time
  const { fileTypeFromBuffer } = await import("file-type");
  const ft = await fileTypeFromBuffer(buf);
  const mime = ft?.mime || "";

  if (mime.includes("pdf") || filename.toLowerCase().endsWith(".pdf")) {
    try {
      const mod = await import("pdf-parse");
      const pdf = (mod as any).default || (mod as any);
      const data = await pdf(buf);
      return data.text || "";
    } catch {
      return "";
    }
  }

  if (
    mime.includes("officedocument.wordprocessingml.document") ||
    filename.toLowerCase().endsWith(".docx")
  ) {
    try {
      const mammoth = await import("mammoth");
      const res = await (mammoth as any).extractRawText({ buffer: buf });
      return res.value || "";
    } catch {
      return "";
    }
  }

  // Fallback to UTF-8 text
  try {
    return new TextDecoder().decode(buf);
  } catch {
    return "";
  }
}

function scoreResume(jd: string, resumeText: string) {
  const jdTokens = tokenize(jd);
  const rTokens = tokenize(resumeText);

  const jdSet = new Set(jdTokens);
  const rSet = new Set(rTokens);

  const overlap = [...jdSet].filter(t => rSet.has(t));
  const skillHits = defaultSkills.filter(s => rSet.has(s));

  const overlapScore = overlap.length / Math.max(1, jdSet.size);
  const skillScore = skillHits.length / Math.max(3, defaultSkills.length * 0.5);

  const finalScore = Math.min(1, 0.65 * overlapScore + 0.35 * skillScore);

  return {
    score: finalScore,
    evidence: [...new Set([...overlap.slice(0,6), ...skillHits.slice(0,6)])].slice(0,8),
    experience: estimateYears(resumeText),
    education: detectEducation(resumeText),
    snippet: snippet(resumeText, jdTokens),
  };
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const jd = (form.get("jd") || "").toString();
  const files = form.getAll("resumes").filter(Boolean) as File[];
  if (!jd || files.length === 0) {
    return NextResponse.json({ error: "Missing job description or resumes" }, { status: 400 });
  }

  const results: any[] = [];
  for (const f of files) {
    const arrayBuf = await f.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    const text = await bufferToText(f.name, buf);
    const s = scoreResume(jd, text || "");
    results.push({ filename: f.name, ...s });
  }

  results.sort((a, b) => b.score - a.score);
  return NextResponse.json({ results });
}
