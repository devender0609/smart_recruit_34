import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "SmartRecruit Pro",
  description: "Upload resumes in any format. Get instant ranked shortlists."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
          <div className="container-pro py-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-brand-600 grid place-items-center text-white font-extrabold">SR</div>
              <div className="text-xl font-semibold">SmartRecruit <span className="text-brand-600">Pro</span></div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <a className="btn btn-ghost" href="https://example.com">Docs</a>
              <a className="btn btn-primary" href="#">Get Started</a>
            </div>
          </div>
        </header>
        <main className="container-pro py-10">{children}</main>
        <footer className="container-pro py-12 text-sm text-gray-500">
          © {new Date().getFullYear()} SmartRecruit Pro. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
