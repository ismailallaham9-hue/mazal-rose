"use client";

import { useState } from "react";

export function ContactForm() {
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No backend yet — wire to an API route / email service later.
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
      <Field label="Subject" name="subject" />
      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full border border-sand-deep bg-cream-soft px-4 py-3 text-sm text-ink focus:border-bronze focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="bg-bronze px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
      >
        Send Message
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="w-full border border-sand-deep bg-cream-soft px-4 py-3 text-sm text-ink focus:border-bronze focus:outline-none"
      />
    </div>
  );
}
