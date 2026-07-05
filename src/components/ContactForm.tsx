"use client";

import { useEffect, useState } from "react";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prefill, setPrefill] = useState({ subject: "", message: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPrefill({
      subject: params.get("subject") ?? "",
      message: params.get("message") ?? "",
    });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        subject: form.get("subject"),
        message: form.get("message"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Message could not be sent. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="bg-cream-soft p-8 text-center ring-1 ring-sand-deep/40">
        <p className="font-serif text-2xl text-bronze">Thank you.</p>
        <p className="mt-2 text-ink-soft">
          Your message has reached us — we&rsquo;ll reply within one working day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" />
        <Field label="Email" name="email" type="email" />
      </div>
      <Field label="Subject" name="subject" defaultValue={prefill.subject} />
      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-ink">
          Message
        </label>
        <textarea
          key={prefill.message}
          id="message"
          name="message"
          required
          rows={5}
          defaultValue={prefill.message}
          className="w-full border border-sand-deep bg-cream-soft px-4 py-3 text-sm text-ink focus:border-bronze focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-bronze px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
      {error && <p className="text-sm text-[#8a3f2b]">{error}</p>}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-ink">
        {label}
      </label>
      <input
        key={defaultValue}
        id={name}
        name={name}
        type={type}
        required
        defaultValue={defaultValue}
        className="w-full border border-sand-deep bg-cream-soft px-4 py-3 text-sm text-ink focus:border-bronze focus:outline-none"
      />
    </div>
  );
}
