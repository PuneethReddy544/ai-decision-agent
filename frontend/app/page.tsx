"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  ShieldCheck,
  Sparkles,
  Telescope,
  FileSearch,
} from "lucide-react";

function Particles() {
  const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null
  const count = 28;
  const particles = Array.from({ length: count }).map((_, i) => {
    const size = Math.round(6 + Math.random() * 36);
    const left = Math.round(Math.random() * 100);
    const top = Math.round(Math.random() * 100);
    const delay = (Math.random() * 6).toFixed(2);
    const duration = (6 + Math.random() * 10).toFixed(2);
    const hues = ["#06b6d4", "#7c3aed", "#fb7185", "#22c55e"];
    const background = hues[Math.floor(Math.random() * hues.length)];
    return { key: i, size, left, top, delay, duration, background };
  });

  return (
    <div className="particles">
      {particles.map((p) => (
        <span
          key={p.key}
          className="particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.background,
            animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${Math.max(8, p.size)}px ${p.background}`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

const agents = [
  {
    name: "Research Agent",
    description: "Harvests context, sources, and signal strength for your question.",
    icon: Telescope,
  },
  {
    name: "Comparison Agent",
    description: "Matches options, benchmarks, and feature trade-offs.",
    icon: FileSearch,
  },
  {
    name: "Risk Analysis Agent",
    description: "Rates uncertainty, downside exposure, and decision safety.",
    icon: ShieldCheck,
  },
  {
    name: "Recommendation Agent",
    description: "Synthesizes the final recommendation with confidence.",
    icon: Cpu,
  },
];

const stepMessages = [
  "Booting the intelligence network.",
  "Scanning context and signal maps.",
  "Comparing outcomes and relative value.",
  "Estimating risk and reward dynamics.",
  "Preparing your final decision intelligence.",
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeStep, setActiveStep] = useState(-1);
  const [status, setStatus] = useState<"idle" | "processing" | "ready" | "error">("idle");
  const [message, setMessage] = useState("Enter your question and let the multi-agent network analyze it.");
  const [finalResult, setFinalResult] = useState("");
  // const [displayedResult, setDisplayedResult] = useState("");
  const [showGlow, setShowGlow] = useState(false);
  const [lastRawResponse, setLastRawResponse] = useState<any>(null);

  const inputValid = query.trim().length > 0;

  const activeAgent = useMemo(() => agents[activeStep] ?? null, [activeStep]);

  // useEffect(() => {
  //   if (status !== "ready" || !finalResult) {
  //     return;
  //   }

  //   let index = 0;
  //   setDisplayedResult("");
  //   const writer = setInterval(() => {
  //     setDisplayedResult((prev) => prev + finalResult[index]);
  //     index += 1;
  //     if (index >= finalResult.length) {
  //       clearInterval(writer);
  //     }
  //   }, 24);

  //   return () => clearInterval(writer);
  // }, [status, finalResult]);

  const handleAnalyze = async () => {
    if (!inputValid) {
      setStatus("error");
      setMessage("Please enter a question to start the AI decision flow.");
      return;
    }

    setStatus("processing");
    setShowGlow(true);
    setActiveStep(0);
    setMessage(stepMessages[0]);
    setFinalResult("");
    // setDisplayedResult("");

    const requestPayload = { question: query };
    let resolvedResult = "The AI analyzed your question but was unable to produce a final recommendation.";

    try {
      console.log("[analyze] requestPayload", requestPayload);

      // Get API URL from environment or fallback to defaults
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const candidateUrls = [
        `${apiBaseUrl}/analyze`,
        "http://localhost:8001/analyze",
        "http://127.0.0.1:8001/analyze",
        // try the current hostname (useful when running in containers or remote hosts)
        `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8001/analyze`,
      ];

      let lastError: any = null;
      let successResponse: any = null;

      for (const url of candidateUrls) {
        try {
          console.log("[analyze] trying url:", url);
          const resp = await axios.post(url, requestPayload, { timeout: 600000 });
          console.log("[analyze] success", url, resp.status, resp.data);
          successResponse = resp;
          setLastRawResponse(resp.data);
          break;
        } catch (e: any) {
          console.warn("[analyze] attempt failed for", url, e?.message ?? String(e));
          lastError = e;
        }
      }

      if (successResponse) {
        const data = successResponse.data;
        resolvedResult =
          data?.final_result ?? data?.finalResult ?? data?.result ?? (typeof data === "string" ? data : JSON.stringify(data)) ?? resolvedResult;
      } else {
        // No successful response from any candidate URL
        console.error("[analyze] no successful response; lastError:", lastError);
        if (lastError?.response) {
          setLastRawResponse(lastError.response.data ?? null);
          resolvedResult =
            lastError.response.data?.final_result ??
            lastError.response.data?.result ??
            JSON.stringify(lastError.response.data) ??
            "Backend returned an error response.";
        } else if (lastError?.code === "ECONNREFUSED") {
          resolvedResult = "Connection refused - is the API running on port 8001?";
        } else if (lastError?.message && lastError?.message.includes("timeout")) {
          resolvedResult = "Request to backend timed out (no response).";
        } else {
          resolvedResult = "Could not reach the analysis backend. Ensure the API is running at http://localhost:8001/analyze.";
        }
        setMessage("Failed to fetch analysis from backend; check console/network and CORS settings.");
      }
    } catch (err) {
      console.error("[analyze] unexpected error", err);
      resolvedResult = "Unexpected error while contacting backend.";
      setMessage("Unexpected error; check console for details.");
    }

    for (let index = 0; index < agents.length; index += 1) {
      setActiveStep(index);
      setMessage(stepMessages[Math.min(index + 1, stepMessages.length - 1)]);
      await delay(1000 + index * 180);
    }

    setMessage("Generating the final recommendation...");
    await delay(800);
    setFinalResult(resolvedResult);
    setStatus("ready");
    setShowGlow(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030d] text-slate-100 selection:bg-cyan-500/20 selection:text-white">
      <div className="animated-gradient" />
      <Particles />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_32%)] blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-24 hidden h-[520px] w-[520px] rounded-full bg-violet-500/10 blur-3xl xl:block" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <header className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 ring-1 ring-cyan-400/10 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Premium AI multi-agent decision intelligence
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
                AI Multi-Agent Decision Intelligence System
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Transform raw questions into confident strategy with four specialized agents, realtime processing visualization, and a polished SaaS experience.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Glassmorphism panels",
                "Neon glow interactions",
                "Sequential agent processing",
                "Typing recommendation output",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300 shadow-[0_35px_80px_-60px_rgba(15,23,42,0.8)] backdrop-blur-xl">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_-45px_rgba(56,189,248,0.25)] backdrop-blur-xl"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-violet-500 to-fuchsia-400" />
            <div className="space-y-6 pt-5">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200/5 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 shadow-black/20">
                <span className="flex h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(56,189,248,0.7)]" />
                Live decision intelligence experience
              </div>
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/90">Live AI Workflow</p>
                <h2 className="text-3xl font-semibold text-white">Multi-agent analysis in motion</h2>
                <p className="text-slate-300">
                  Push a question into the system and watch the agents work through research, comparison, risk analysis, and recommendation with premium SaaS polish.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm text-slate-300">
                  <p className="font-medium text-white">Agent orchestration</p>
                  <p className="mt-1 text-slate-400">Animated sequencing for every processing stage.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm text-slate-300">
                  <p className="font-medium text-white">Insight delivery</p>
                  <p className="mt-1 text-slate-400">Clear final recommendations aligned to your input.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_32px_120px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/90">Ask the system</p>
                <h3 className="mt-3 text-3xl font-semibold text-white">AI input box</h3>
              </div>
              <div className="rounded-3xl bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200 ring-1 ring-cyan-400/20">
                Premium SaaS UX
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                <label className="block text-sm font-medium text-slate-300">Decision input</label>
                <textarea
                  rows={5}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. Which growth strategy should my AI startup prioritize in Q3?"
                  className="mt-3 w-full resize-none rounded-3xl border border-white/10 bg-slate-950/95 px-4 py-4 text-base text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <motion.button
                  whileHover={{ y: -2, boxShadow: "0 0 30px rgba(34,211,238,0.45)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-slate-950 shadow-[0_20px_80px_-40px_rgba(56,189,248,0.65)] transition duration-200"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Analyze with AI
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_26%)] opacity-0 transition duration-300 group-hover:opacity-70" />
                </motion.button>

                <div className={`rounded-3xl border border-white/10 bg-slate-950/85 px-5 py-4 text-slate-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] ${status === "processing" ? "shimmer" : ""}`}>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Status</p>
                  <p className="mt-2 text-sm font-medium text-white">{status === "processing" ? "Thinking..." : status === "ready" ? "Ready" : "Idle"}</p>
                  <p className="mt-1 text-sm text-slate-400">{message}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="rounded-[2rem] border border-white/10 bg-[#08121f]/80 p-8 shadow-[0_32px_120px_-60px_rgba(56,189,248,0.25)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/90">Processing engine</p>
                <h3 className="mt-3 text-3xl font-semibold text-white">AI thinking animation</h3>
              </div>
              <div className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200 ring-1 ring-cyan-400/15">
                Live mode
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 shadow-[0_0_22px_rgba(56,189,248,0.2)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Pulse</p>
                    <p className="text-base font-medium text-white">Neon processing glows and timeline flow.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-3xl bg-slate-900/75 p-4">
                    <div>
                      <p className="text-sm text-slate-300">Current stage</p>
                      <p className="mt-1 text-lg font-semibold text-white">{activeAgent?.name ?? "Awaiting input"}</p>
                    </div>
                    <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                      {activeAgent ? `Agent ${activeStep + 1}` : "Idle"}
                    </div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      animate={{ width: status === "processing" ? `${((activeStep + 1) / agents.length) * 100}%` : status === "ready" ? "100%" : "6%" }}
                      transition={{ type: "spring", stiffness: 90, damping: 24 }}
                      className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-400 ${status === "processing" ? "progress-glow" : ""}`}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-cyan-400/10 bg-slate-950/85 px-5 py-5">
                <div className="flex items-center gap-3 text-slate-300">
                  <span className={`inline-flex h-3 w-3 rounded-full ${showGlow ? "bg-cyan-400/90 shadow-[0_0_16px_rgba(56,189,248,0.8)]" : "bg-slate-700"}`} />
                  <p className="text-sm">{status === "processing" ? "Processing through the agent pipeline" : "Ready for your next query"}</p>
                </div>
                <div className="mt-4 text-sm text-slate-400">
                  {activeAgent?.description ?? "A premium AI flow balances speed, context, and accuracy."}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            const active = activeStep === index && status === "processing";
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className={`rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_32px_90px_-55px_rgba(15,23,42,0.85)] backdrop-blur-xl transition duration-300 ${active ? "border-cyan-300/40 bg-slate-900/85" : "hover:border-white/20 hover:bg-slate-900/75"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(56,189,248,0.15)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-xl font-semibold text-white">{agent.name}</h4>
                      <p className="mt-1 text-sm text-slate-400">{agent.description}</p>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.3em] ${active ? "bg-cyan-500/15 text-cyan-200" : "bg-white/5 text-slate-400"}`}>
                    {active ? "Active" : "Ready"}
                  </div>
                </div>
                <div className="mt-6 h-px bg-white/5" />
                <div className="mt-5 text-sm text-slate-300">
                  {active ? "Executing higher-order reasoning and aligning the final recommendation." : "Standby for the next step of the analysis."}
                </div>
              </motion.div>
            );
          })}
        </section>

        <section className="rounded-[2rem] border border-cyan-400/15 bg-slate-950/70 p-8 shadow-[0_40px_120px_-60px_rgba(56,189,248,0.3)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/90">Final recommendation</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">The complete answer to your question</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Delivered by multi-agent intelligence
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_0.85fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#06111d]/90 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Summary</p>
              <p className="mt-4 text-base leading-7 text-slate-300">
                {finalResult
                  ? "The system completed all agent stages and produced a polished recommendation based on your question. The message appears with a typing animation for premium clarity."
                  : "Submit a question above to watch the agents process the input and deliver a final recommendation."}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-cyan-400/15 bg-[#081828]/95 p-6 text-left text-slate-200 shadow-[0_24px_80px_-40px_rgba(56,189,248,0.22)]">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Result output</p>
              <div className="mt-5 min-h-[180px] rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-base leading-7 text-slate-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={finalResult || "empty"}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="whitespace-pre-wrap break-words"
                  >
                    {status === "ready"
                      ? finalResult
                      : "Your final recommendation will appear here after the multi-agent analysis completes."}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
        {lastRawResponse && (
          <section className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[90%] rounded-lg border border-white/10 bg-[#07121b]/95 p-4 text-sm text-slate-200 shadow-lg backdrop-blur-md">
            <div className="flex items-start justify-between gap-2">
              <div className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">Debug: last raw response</div>
              <div className="text-xs text-slate-400">(visible in dev)</div>
            </div>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-200">{JSON.stringify(lastRawResponse, null, 2)}</pre>
          </section>
        )}
      </div>
    </div>
  );
}
















// "use client";

// import { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   ArrowRight,
//   Cpu,
//   ShieldCheck,
//   Sparkles,
//   Telescope,
//   FileSearch,
// } from "lucide-react";

// function Particles() {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   const count = 28;

//   const particles = Array.from({ length: count }).map((_, i) => {
//     const size = Math.round(6 + Math.random() * 36);
//     const left = Math.round(Math.random() * 100);
//     const top = Math.round(Math.random() * 100);
//     const delay = (Math.random() * 6).toFixed(2);
//     const duration = (6 + Math.random() * 10).toFixed(2);

//     const hues = ["#06b6d4", "#7c3aed", "#fb7185", "#22c55e"];

//     const background =
//       hues[Math.floor(Math.random() * hues.length)];

//     return {
//       key: i,
//       size,
//       left,
//       top,
//       delay,
//       duration,
//       background,
//     };
//   });

//   return (
//     <div className="particles">
//       {particles.map((p) => (
//         <span
//           key={p.key}
//           className="particle"
//           style={{
//             left: `${p.left}%`,
//             top: `${p.top}%`,
//             width: `${p.size}px`,
//             height: `${p.size}px`,
//             background: p.background,
//             animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`,
//             boxShadow: `0 0 ${Math.max(8, p.size)}px ${p.background}`,
//             opacity: 0.6,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// const agents = [
//   {
//     name: "Research Agent",
//     description:
//       "Harvests context, sources, and signal strength for your question.",
//     icon: Telescope,
//   },
//   {
//     name: "Comparison Agent",
//     description:
//       "Matches options, benchmarks, and feature trade-offs.",
//     icon: FileSearch,
//   },
//   {
//     name: "Risk Analysis Agent",
//     description:
//       "Rates uncertainty, downside exposure, and decision safety.",
//     icon: ShieldCheck,
//   },
//   {
//     name: "Recommendation Agent",
//     description:
//       "Synthesizes the final recommendation with confidence.",
//     icon: Cpu,
//   },
// ];

// const stepMessages = [
//   "Booting the intelligence network.",
//   "Scanning context and signal maps.",
//   "Comparing outcomes and relative value.",
//   "Estimating risk and reward dynamics.",
//   "Preparing your final decision intelligence.",
// ];

// const delay = (ms: number) =>
//   new Promise((resolve) => setTimeout(resolve, ms));

// export default function Home() {
//   const [query, setQuery] = useState("");

//   const [activeStep, setActiveStep] = useState(-1);

//   const [status, setStatus] = useState<
//     "idle" | "processing" | "ready" | "error"
//   >("idle");

//   const [message, setMessage] = useState(
//     "Enter your question and let the multi-agent network analyze it."
//   );

//   const [finalResult, setFinalResult] = useState("");

//   const [showGlow, setShowGlow] = useState(false);

//   const [lastRawResponse, setLastRawResponse] =
//     useState<any>(null);

//   const inputValid = query.trim().length > 0;

//   const activeAgent = useMemo(
//     () => agents[activeStep] ?? null,
//     [activeStep]
//   );

//   const handleAnalyze = async () => {
//     if (!inputValid) {
//       setStatus("error");

//       setMessage(
//         "Please enter a question to start the AI decision flow."
//       );

//       return;
//     }

//     setStatus("processing");

//     setShowGlow(true);

//     setActiveStep(0);

//     setMessage(stepMessages[0]);

//     setFinalResult("");

//     const requestPayload = {
//       question: query,
//     };

//     let resolvedResult =
//       "The AI analyzed your question but could not generate a final recommendation.";

//     try {
//       console.log("[analyze] requestPayload", requestPayload);

//       const apiBaseUrl =
//         process.env.NEXT_PUBLIC_API_URL ||
//         "http://127.0.0.1:8001";

//       const response = await axios.post(
//         `${apiBaseUrl}/analyze`,
//         requestPayload,
//         {
//           timeout: 600000,
//         }
//       );

//       console.log("[analyze] success", response.data);

//       setLastRawResponse(response.data);

//       resolvedResult =
//         response.data?.final_result ||
//         response.data?.result ||
//         "No response generated.";
//     } catch (error: any) {
//       console.error("[analyze] error", error);

//       if (error?.response?.data) {
//         resolvedResult =
//           error.response.data.final_result ||
//           JSON.stringify(error.response.data);
//       } else if (
//         error?.message?.includes("timeout")
//       ) {
//         resolvedResult =
//           "Request timed out. Please try again.";
//       } else {
//         resolvedResult =
//           "Could not connect to backend API.";
//       }

//       setMessage(
//         "Backend connection failed. Check API server."
//       );
//     }

//     for (let index = 0; index < agents.length; index++) {
//       setActiveStep(index);

//       setMessage(
//         stepMessages[
//           Math.min(index + 1, stepMessages.length - 1)
//         ]
//       );

//       await delay(1000);
//     }

//     setMessage("Generating final recommendation...");

//     await delay(800);

//     setFinalResult(resolvedResult);

//     setStatus("ready");

//     setShowGlow(false);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#02030d] text-slate-100">

//       <div className="animated-gradient" />

//       <Particles />

//       <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_32%)] blur-3xl" />

//       <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-10">

//         {/* HEADER */}

//         <header className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">

//           <motion.div
//             initial={{ opacity: 0, y: 18 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.75 }}
//             className="space-y-6"
//           >

//             <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 backdrop-blur-xl">

//               <Sparkles className="h-4 w-4 text-cyan-300" />

//               Premium AI multi-agent decision intelligence

//             </div>

//             <div className="space-y-4">

//               <h1 className="max-w-3xl text-5xl font-semibold text-white">

//                 AI Multi-Agent Decision Intelligence System

//               </h1>

//               <p className="max-w-2xl text-lg leading-8 text-slate-300">

//                 Transform raw questions into intelligent
//                 strategic recommendations using multiple AI agents.

//               </p>

//             </div>

//           </motion.div>

//         </header>

//         {/* INPUT SECTION */}

//         <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">

//           <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">

//             <div className="space-y-6">

//               <div>

//                 <h3 className="text-3xl font-semibold text-white">

//                   Ask the AI system

//                 </h3>

//               </div>

//               <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-5">

//                 <textarea
//                   rows={5}
//                   value={query}
//                   onChange={(e) =>
//                     setQuery(e.target.value)
//                   }
//                   placeholder="Should I learn AI or Cybersecurity in 2026?"
//                   className="w-full resize-none rounded-3xl border border-white/10 bg-slate-950/95 px-4 py-4 text-base text-slate-100 outline-none focus:border-cyan-400"
//                 />

//               </div>

//               <div className="grid gap-4 sm:grid-cols-[1fr_auto]">

//                 <motion.button
//                   whileHover={{ y: -2 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleAnalyze}
//                   className="rounded-3xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-slate-950"
//                 >

//                   <span className="flex items-center gap-2">

//                     Analyze with AI

//                     <ArrowRight className="h-4 w-4" />

//                   </span>

//                 </motion.button>

//                 <div className="rounded-3xl border border-white/10 bg-slate-950/85 px-5 py-4 text-slate-300">

//                   <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">

//                     Status

//                   </p>

//                   <p className="mt-2 text-sm font-medium text-white">

//                     {status === "processing"
//                       ? "Thinking..."
//                       : status === "ready"
//                       ? "Ready"
//                       : "Idle"}

//                   </p>

//                   <p className="mt-1 text-sm text-slate-400">

//                     {message}

//                   </p>

//                 </div>

//               </div>

//             </div>

//           </div>

//           {/* PROCESSING PANEL */}

//           <div className="rounded-[2rem] border border-white/10 bg-[#08121f]/80 p-8 backdrop-blur-xl">

//             <div className="space-y-6">

//               <h3 className="text-3xl font-semibold text-white">

//                 AI Processing Pipeline

//               </h3>

//               {agents.map((agent, index) => {
//                 const Icon = agent.icon;

//                 const active =
//                   activeStep === index &&
//                   status === "processing";

//                 return (
//                   <div
//                     key={agent.name}
//                     className={`rounded-3xl border p-5 transition ${
//                       active
//                         ? "border-cyan-400 bg-cyan-400/10"
//                         : "border-white/10 bg-slate-900/60"
//                     }`}
//                   >

//                     <div className="flex items-center gap-4">

//                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">

//                         <Icon className="h-5 w-5" />

//                       </div>

//                       <div>

//                         <h4 className="text-lg font-semibold text-white">

//                           {agent.name}

//                         </h4>

//                         <p className="text-sm text-slate-400">

//                           {agent.description}

//                         </p>

//                       </div>

//                     </div>

//                   </div>
//                 );
//               })}

//             </div>

//           </div>

//         </section>

//         {/* FINAL OUTPUT */}

//         <section className="rounded-[2rem] border border-cyan-400/15 bg-slate-950/70 p-8 backdrop-blur-xl">

//           <div className="flex items-center justify-between">

//             <div>

//               <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/90">

//                 Final Recommendation

//               </p>

//               <h3 className="mt-3 text-3xl font-semibold text-white">

//                 AI Generated Decision

//               </h3>

//             </div>

//           </div>

//           <div className="mt-8 rounded-[1.75rem] border border-cyan-400/15 bg-[#081828]/95 p-6">

//             <AnimatePresence mode="wait">

//               <motion.div
//                 key={finalResult || "empty"}
//                 initial={{ opacity: 0, y: 16 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -12 }}
//                 transition={{ duration: 0.25 }}
//                 className="whitespace-pre-wrap break-words text-slate-100 leading-8"
//               >

//                 {status === "ready" ? (
//                   <ReactMarkdown>
//                     {finalResult}
//                   </ReactMarkdown>
//                 ) : (
//                   "Your final recommendation will appear here after the AI completes the analysis."
//                 )}

//               </motion.div>

//             </AnimatePresence>

//           </div>

//         </section>

//         {/* DEBUG PANEL */}

//         {lastRawResponse && (
//           <section className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[90%] rounded-lg border border-white/10 bg-[#07121b]/95 p-4 text-sm text-slate-200 backdrop-blur-md">

//             <div className="flex items-start justify-between gap-2">

//               <div className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">

//                 Debug: Last Raw Response

//               </div>

//             </div>

//             <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-200">

//               {JSON.stringify(lastRawResponse, null, 2)}

//             </pre>

//           </section>
//         )}

//       </div>

//     </div>
//   );
// }