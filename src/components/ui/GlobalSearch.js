"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { leads, clients, proposals } from "@/data/mockData";

function buildIndex() {
  return [
    ...leads.map((l)     => ({ label: l.company,  sub: `Lead · ${l.contact}`,          href: "/leads"                })),
    ...clients.map((c)   => ({ label: c.name,      sub: `Client · ${c.industry}`,        href: `/clients/${c.id}`      })),
    ...proposals.map((p) => ({ label: p.client,    sub: `Proposal · ${p.id} ${p.version}`, href: "/proposals"          })),
  ];
}

const ALL = buildIndex();

export default function GlobalSearch() {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const inputRef          = useRef(null);
  const router            = useRouter();

  // Cmd+K / Ctrl+K
  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL.filter((r) => r.label.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  function closeSearch() {
    setOpen(false);
    setQuery("");
  }

  function select(href) {
    closeSearch();
    router.push(href);
  }

  return (
    <>
      {/* Trigger button shown in header */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[#E3E5EA] rounded bg-white text-sm text-[#6B7280] hover:border-[#0E7C66]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66]"
      >
        <Search size={13} strokeWidth={1.8} />
        <span>Search…</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/30 z-[60]"
              onClick={closeSearch}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-[520px] bg-white border border-[#E3E5EA] rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.14)] z-[70] overflow-hidden"
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E3E5EA]">
                <Search size={15} className="text-[#6B7280] shrink-0" strokeWidth={1.8} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leads, clients, proposals…"
                  className="flex-1 text-sm text-[#171A21] placeholder:text-[#6B7280] bg-transparent focus:outline-none"
                />
                {query && (
                  <button onClick={closeSearch} className="text-[#6B7280] hover:text-[#171A21] transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Results */}
              {query && (
                <ul className="max-h-72 overflow-y-auto py-1">
                  {results.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-[#6B7280]">No results for &quot;{query}&quot;</li>
                  ) : results.map((r, i) => (
                    <li key={i}>
                      <button
                        onClick={() => select(r.href)}
                        className="w-full flex flex-col items-start px-4 py-2.5 hover:bg-[#F5F6F8] transition-colors text-left focus-visible:outline-none focus-visible:bg-[#F5F6F8]"
                      >
                        <span className="text-sm font-medium text-[#171A21]">{r.label}</span>
                        <span className="text-xs text-[#6B7280]">{r.sub}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!query && (
                <p className="px-4 py-5 text-xs text-[#6B7280] text-center">
                  Start typing to search across leads, clients and proposals.
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
