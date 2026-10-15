"use client";

import { useState } from "react";
import { z } from "zod";
import { Icon } from "@/components/ui/Icon";
import { ApiError, submitInquiry } from "@/lib/api-client";
import type { Dictionary } from "@/lib/i18n";

type ServiceOption = { id: number; title: string };

type ContactFormProps = {
  labels: Dictionary["contact"];
  serviceOptions: ServiceOption[];
  serviceLabel: string;
  serviceNoneLabel: string;
  sendingLabel: string;
  defaultServiceId?: string;
};

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(2),
  message: z.string().trim().min(10),
});

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

const makeInitial = (serviceId: string) => ({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  serviceId,
});

type FormState = ReturnType<typeof makeInitial>;

export function ContactForm({
  labels,
  serviceOptions,
  serviceLabel,
  serviceNoneLabel,
  sendingLabel,
  defaultServiceId = "",
}: ContactFormProps) {
  const [form, setForm] = useState(() => makeInitial(defaultServiceId));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const update = (key: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const parsed = schema.safeParse({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !nextErrors[key]) nextErrors[key] = labels.validationError;
      }
      setErrors(nextErrors);
      setStatus("idle");
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      await submitInquiry({
        ...parsed.data,
        phone: parsed.data.phone || null,
        service_id: form.serviceId ? Number(form.serviceId) : null,
      });
      setStatus("success");
      setForm(makeInitial(defaultServiceId));
    } catch (error) {
      setStatus("error");
      if (error instanceof ApiError && error.status === 429) {
        setErrorMessage(labels.rateLimited);
      } else {
        setErrorMessage(labels.errorMessage);
      }
    }
  }

  if (status === "success") {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-50 text-primary">
          <Icon name="check" size={30} />
        </span>
        <h3 className="mt-4 text-xl">{labels.successTitle}</h3>
        <p className="mt-2 text-sm text-slate-600">{labels.successMessage}</p>
        <button type="button" className="btn-outline mt-6" onClick={() => setStatus("idle")}>
          {labels.submit}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8" noValidate>
      <h3 className="text-xl">{labels.formTitle}</h3>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={labels.formName} error={errors.name} required>
          <input
            className="input"
            value={form.name}
            onChange={update("name")}
            placeholder={labels.formNamePlaceholder}
            autoComplete="name"
          />
        </Field>
        <Field label={labels.formEmail} error={errors.email} required>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder={labels.formEmailPlaceholder}
            autoComplete="email"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={labels.formPhone}>
          <input
            className="input"
            value={form.phone}
            onChange={update("phone")}
            placeholder={labels.formPhonePlaceholder}
            autoComplete="tel"
          />
        </Field>
        <Field label={serviceLabel}>
          <select className="input" value={form.serviceId} onChange={update("serviceId")}>
            <option value="">{serviceNoneLabel}</option>
            {serviceOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={labels.formSubject} error={errors.subject} required>
        <input
          className="input"
          value={form.subject}
          onChange={update("subject")}
          placeholder={labels.formSubjectPlaceholder}
        />
      </Field>

      <Field label={labels.formMessage} error={errors.message} required>
        <textarea
          className="input min-h-32 resize-y"
          value={form.message}
          onChange={update("message")}
          placeholder={labels.formMessagePlaceholder}
        />
      </Field>

      {status === "error" ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? sendingLabel : labels.submit}
        <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  required = false,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
