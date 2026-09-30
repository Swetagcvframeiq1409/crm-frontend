import { contracts, invoices, tickets } from "@/data/mockData";
import { daysUntil } from "@/lib/dates";

function localDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getClientHealth(client, today = new Date()) {
  const todayISO = localDateISO(today);
  const daysSinceContact = client.lastContactDate
    ? Math.max(0, -daysUntil(client.lastContactDate))
    : null;
  const openTicketCount = tickets.filter(
    (ticket) => ticket.client === client.name && ["Open", "In Progress"].includes(ticket.status)
  ).length;
  const overdueInvoiceCount = invoices.filter(
    (invoice) =>
      invoice.client === client.name &&
      invoice.status !== "Paid" &&
      invoice.status !== "Draft" &&
      invoice.dueDate < todayISO
  ).length;
  const contract = contracts.find((item) => item.clientId === client.id);
  const renewalDays = contract ? daysUntil(contract.renewalDate) : null;
  const factors = [];

  if (overdueInvoiceCount > 0) {
    factors.push(`${overdueInvoiceCount} overdue ${overdueInvoiceCount === 1 ? "invoice" : "invoices"}`);
  }
  if (openTicketCount > 0) {
    factors.push(`${openTicketCount} open support ${openTicketCount === 1 ? "ticket" : "tickets"}`);
  }
  if (daysSinceContact !== null && daysSinceContact >= 14) {
    factors.push(`No contact in ${daysSinceContact} days`);
  }
  if (renewalDays !== null && renewalDays < 0) {
    factors.push(`Renewal was due ${Math.abs(renewalDays)} days ago`);
  } else if (renewalDays !== null && renewalDays <= 60) {
    factors.push(`Renewal in ${renewalDays} days`);
  }

  const isAtRisk =
    overdueInvoiceCount > 0 ||
    openTicketCount >= 2 ||
    (daysSinceContact !== null && daysSinceContact >= 30) ||
    (renewalDays !== null && renewalDays < 0);
  const needsAttention =
    openTicketCount > 0 ||
    (daysSinceContact !== null && daysSinceContact >= 14) ||
    (renewalDays !== null && renewalDays >= 0 && renewalDays <= 60);

  return {
    status: isAtRisk ? "At Risk" : needsAttention ? "Needs Attention" : "Healthy",
    factors,
  };
}