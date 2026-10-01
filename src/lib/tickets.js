export function isOpenTicket(ticket) {
  return ticket.status !== "Resolved" && ticket.status !== "Closed";
}