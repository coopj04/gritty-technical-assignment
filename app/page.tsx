"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PromptApiResponse =
  | { ok: true; output: string }
  | { ok: false; error: string };

type Role = "user" | "ai";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
};

type Theme = "light" | "dark";

function TypingDots() {
  return (
    <div className="flex items-center gap-1" aria-label="AI is typing">
      <span className="inline-block h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0ms]" />
      <span className="inline-block h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:150ms]" />
      <span className="inline-block h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

function readPreferredTheme(): Theme {
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Important: stable default for SSR, then update after mount
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const initial = readPreferredTheme();
    setTheme(initial);
  }, []);

  // Apply theme to <html> and persist it (after mount)
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // Auto-scroll to the bottom when new messages arrive or loading changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const canSubmit = useMemo(() => !loading, [loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt.");
      return;
    }

    setError(null);
    setLoading(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt(""); // clear input immediately

    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = (await res.json()) as PromptApiResponse;

      if (!res.ok || !data.ok) {
        const errMsg = data.ok ? "Request failed." : data.error;
        setError(errMsg);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "ai", content: `Error: ${errMsg}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "ai",
            content: data.output || "(No output)",
          },
        ]);
      }
    } catch {
      const errMsg = "Network error. Please try again.";
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "ai", content: `Error: ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function toggleTheme() {
    // safe even before mounted, but mounted keeps UI consistent
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function clearChat() {
    setMessages([]);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-3xl p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">AI Prompt UI</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Type a prompt and get an AI response.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearChat}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
              aria-label="Toggle dark/light mode"
              title="Toggle theme"
            >
              {/* Prevent hydration mismatch by rendering stable label until mounted */}
              {mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
            </button>
          </div>
        </header>

        <form onSubmit={onSubmit} className="mt-6 flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-gray-700"
            aria-label="Prompt"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <section className="mt-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={[
                  "w-fit max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  isUser
                    ? "ml-auto bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "mr-auto border border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100",
                ].join(" ")}
              >
                <div
                  className={[
                    "mb-1 text-xs",
                    isUser ? "opacity-70" : "text-gray-500 dark:text-gray-400",
                  ].join(" ")}
                >
                  {isUser ? "You" : "AI"}
                </div>
                {m.content}
              </div>
            );
          })}

          {loading && (
            <div className="mr-auto w-fit max-w-[85%] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                AI
              </div>
              <TypingDots />
            </div>
          )}

          <div ref={bottomRef} />
        </section>
      </div>
    </main>
  );
}
