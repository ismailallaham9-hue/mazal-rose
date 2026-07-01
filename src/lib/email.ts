import "server-only";

import type {
  SiteSettings,
  StoreEmailEvent,
  StoreInquiry,
  StoreOrder,
  StoreSubscriber,
} from "./store";

type EmailInput = {
  to: string;
  subject: string;
  html: string;
  context: StoreEmailEvent["context"];
  relatedId?: string;
};

function fromAddress(settings: SiteSettings) {
  return process.env.RESEND_FROM || `MAZAL <${settings.contact.email}>`;
}

function adminAddress(settings: SiteSettings) {
  return process.env.ADMIN_EMAIL || settings.contact.email;
}

function eventFor(
  email: EmailInput,
  status: StoreEmailEvent["status"],
  error?: string,
): StoreEmailEvent {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    to: email.to,
    subject: email.subject,
    status,
    provider: process.env.RESEND_API_KEY ? "resend" : "outbox",
    error,
    context: email.context,
    relatedId: email.relatedId,
  };
}

export async function sendEmails(
  settings: SiteSettings,
  emails: EmailInput[],
): Promise<StoreEmailEvent[]> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = fromAddress(settings);

  if (!apiKey) {
    return emails.map((email) => eventFor(email, "queued"));
  }

  const events: StoreEmailEvent[] = [];
  for (const email of emails) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: email.to,
          subject: email.subject,
          html: email.html,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        events.push(eventFor(email, "failed", text || `HTTP ${res.status}`));
      } else {
        events.push(eventFor(email, "sent"));
      }
    } catch (error) {
      events.push(
        eventFor(email, "failed", error instanceof Error ? error.message : "Send failed"),
      );
    }
  }
  return events;
}

export function orderEmails(settings: SiteSettings, order: StoreOrder): EmailInput[] {
  const admin = adminAddress(settings);
  const lines = order.items
    .map(
      (item) =>
        `<li>${item.quantity}x ${item.name} (${item.size} / ${item.color}) - AED ${item.lineTotal}</li>`,
    )
    .join("");
  const address = `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.country}`;
  return [
    {
      to: admin,
      subject: `New MAZAL order ${order.orderNumber}`,
      context: "order",
      relatedId: order.id,
      html: `<h1>New order ${order.orderNumber}</h1><p>${order.customer.firstName} ${order.customer.lastName}</p><p>${order.customer.email} · ${order.customer.phone}</p><p>${address}</p><ul>${lines}</ul><p><strong>Total: AED ${order.total}</strong></p>`,
    },
    {
      to: order.customer.email,
      subject: `MAZAL order received - ${order.orderNumber}`,
      context: "order",
      relatedId: order.id,
      html: `<h1>Thank you for your order</h1><p>We received order <strong>${order.orderNumber}</strong>.</p><ul>${lines}</ul><p><strong>Total: AED ${order.total}</strong></p><p>Our team will contact you as your pieces are prepared.</p>`,
    },
  ];
}

export function contactEmails(
  settings: SiteSettings,
  inquiry: StoreInquiry,
): EmailInput[] {
  return [
    {
      to: adminAddress(settings),
      subject: `New MAZAL message: ${inquiry.subject}`,
      context: "contact",
      relatedId: inquiry.id,
      html: `<h1>New website message</h1><p><strong>${inquiry.name}</strong> · ${inquiry.email}</p><p>${inquiry.subject}</p><p>${inquiry.message.replace(/\n/g, "<br />")}</p>`,
    },
    {
      to: inquiry.email,
      subject: "MAZAL received your message",
      context: "contact",
      relatedId: inquiry.id,
      html: `<p>Thank you, ${inquiry.name}. We received your message and will reply within one working day.</p>`,
    },
  ];
}

export function subscriberEmails(
  settings: SiteSettings,
  subscriber: StoreSubscriber,
): EmailInput[] {
  return [
    {
      to: subscriber.email,
      subject: "Welcome to MAZAL",
      context: "newsletter",
      relatedId: subscriber.id,
      html: `<p>Welcome to the MAZAL world. You are now on the list for private previews and new arrivals.</p>`,
    },
  ];
}

export function orderStatusEmails(
  settings: SiteSettings,
  order: StoreOrder,
): EmailInput[] {
  const tracking = order.trackingUrl
    ? `<p>Tracking: <a href="${order.trackingUrl}">${order.trackingNumber || order.trackingUrl}</a></p>`
    : order.trackingNumber
      ? `<p>Tracking number: ${order.trackingNumber}</p>`
      : "";
  return [
    {
      to: order.customer.email,
      subject: `MAZAL order update - ${order.orderNumber}`,
      context: "order-status",
      relatedId: order.id,
      html: `<h1>Your MAZAL order update</h1><p>Order <strong>${order.orderNumber}</strong> is now <strong>${order.status}</strong>.</p>${order.carrier ? `<p>Carrier: ${order.carrier}</p>` : ""}${tracking}<p>Thank you for shopping with MAZAL.</p>`,
    },
  ];
}
