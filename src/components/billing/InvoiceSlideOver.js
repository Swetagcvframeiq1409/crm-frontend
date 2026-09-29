"use client";

import Badge from "@/components/ui/Badge";
import SlideOver from "@/components/ui/SlideOver";
import { fmtDate } from "@/lib/dates";
import { fmtINR } from "@/lib/format";

const STATUS_VARIANT = {
  Draft: "muted",
  Sent: "bluegrey",
  Paid: "teal",
  Overdue: "rose",
};

export default function InvoiceSlideOver({ invoice, open, onClose }) {
  const lineItems = invoice?.lineItems ?? [];
  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = invoice?.amount ?? subtotal + tax;

  return (
    <SlideOver
      open={open && Boolean(invoice)}
      onClose={onClose}
      title={invoice ? `${invoice.id} · ${invoice.client}` : "Invoice details"}
      width="w-full sm:w-[480px]"
    >
      {invoice && (
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#171A21]">{invoice.project}</p>
              <p className="text-xs text-[#6B7280] mt-1">{invoice.client}</p>
            </div>
            <Badge variant={STATUS_VARIANT[invoice.status] ?? "muted"}>{invoice.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-[#E3E5EA] py-4">
            <div>
              <p className="text-xs text-[#6B7280]">Method</p>
              <p className="text-sm font-medium text-[#171A21] mt-1">{invoice.method}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Issue date</p>
              <p className="text-sm font-medium text-[#171A21] mt-1">{fmtDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Due date</p>
              <p className="text-sm font-medium text-[#171A21] mt-1">{fmtDate(invoice.dueDate)}</p>
            </div>
            {invoice.paidDate && (
              <div>
                <p className="text-xs text-[#6B7280]">Paid date</p>
                <p className="text-sm font-medium text-[#171A21] mt-1">{fmtDate(invoice.paidDate)}</p>
              </div>
            )}
          </div>

          <section>
            <h3 className="text-sm font-semibold text-[#171A21] mb-3">Line items</h3>
            <div className="border-y border-[#E3E5EA] divide-y divide-[#F5F6F8]">
              {lineItems.map((item, index) => (
                <div key={`${item.description}-${index}`} className="flex items-start justify-between gap-4 py-3">
                  <p className="text-sm text-[#171A21]">{item.description}</p>
                  <p className="text-sm font-mono-data text-[#171A21] whitespace-nowrap">{fmtINR(item.amount)}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="font-mono-data text-[#171A21]">{fmtINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">GST (18%)</span>
                <span className="font-mono-data text-[#171A21]">{fmtINR(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E3E5EA] pt-3 mt-1">
                <span className="text-sm font-semibold text-[#171A21]">Total</span>
                <span className="text-base font-semibold font-mono-data text-[#171A21]">{fmtINR(total)}</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </SlideOver>
  );
}