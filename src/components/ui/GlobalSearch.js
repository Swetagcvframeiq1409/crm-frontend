"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { leads, clients, proposals } from "@/data/mockData";

const RESULTS = [
  ...leads.map((lead) => ({
    label: lead.company,
    sub: lead.contact,
    type: "Lead",
    href: "/leads",
  })),
  ...clients.map((client) => ({
    label: client.name,
    sub: client.industry,
    type: "Client",
    href: `/clients/${client.id}`,
  })),
  ...proposals.map((proposal) => ({
    label: proposal.client,
    sub: `${proposal.id} · ${proposal.version}`,
    type: "Proposal",
    href: "/proposals",
  })),
];

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) setFocused(false);
    }

    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleShortcut);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const results = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return [];
    return RESULTS.filter((result) =>
      [result.label, result.sub, result.type].some((value) => value.toLowerCase().includes(search))
    ).slice(0, 8);
  }, [query]);

  function selectResult(result) {
    setQuery("");
    setFocused(false);
    inputRef.current?.blur();
    router.push(result.href);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
    if (event.key === "Enter" && results.length > 0) {
      event.preventDefault();
      selectResult(results[0]);
    }
  }

  return (
    <div ref={containerRef} className="relative w-64 lg:w-80 shrink-0">
      <Search
        size={15}
        strokeWidth={1.8}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search across the CRM..."
        aria-label="Search across the CRM"
        className="w-full pl-9 pr-9 py-2 text-sm border border-[#E3E5EA] rounded bg-white text-[#171A21] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E7C66]"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#171A21] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66]"
          aria-label="Clear search"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      )}

      {focused && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#E3E5EA] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#6B7280]">No results found</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result, index) => (
                <li key={`${result.type}-${result.href}-${result.label}-${index}`}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectResult(result)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#F5F6F8] focus-visible:outline-none focus-visible:bg-[#F5F6F8]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#171A21]">{result.label}</span>
                      <span className="block truncate text-xs text-[#6B7280] mt-0.5">{result.sub}</span>
                    </span>
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#F5F6F8] text-[10px] font-medium text-[#6B7280]">
                      {result.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}