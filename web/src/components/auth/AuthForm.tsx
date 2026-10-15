"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Icon } from "@/components/ui/Icon";
import { ApiError, login as apiLogin, register as apiRegister } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";

type AuthLabels = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  loginButton: string;
  registerButton: string;
  invalidCredentials: string;
  emailInUse: string;
  passwordMismatch: string;
  passwordHint: string;
  noAccount: string;
  haveAccount: string;
  loginLink: string;
  registerLink: string;
  loginTitle: string;
  loginSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
};

type AuthFormProps = {
  mode: "login" | "register";
  locale: Locale;
  labels: AuthLabels;
};

export function AuthForm({ mode, locale, labels }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "register") {
      if (password.length < 8) {
        setError(labels.passwordHint);
        return;
      }
      if (password !== confirm) {
        setError(labels.passwordMismatch);
        return;
      }
    }

    const parsed = z
      .object({
        email: z.string().trim().email(),
        password: z.string().min(1),
        name: z.string().trim().optional(),
      })
      .safeParse({ email, password, name });

    if (!parsed.success) {
      setError(labels.invalidCredentials);
      return;
    }

    setPending(true);
    try {
      const result =
        mode === "login"
          ? await apiLogin(email, password)
          : await apiRegister(name, email, password);
      const target = result.user.role === "admin" ? `/${locale}/admin` : `/${locale}`;
      router.push(target);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(labels.emailInUse);
      } else if (err instanceof ApiError && err.status === 401) {
        setError(labels.invalidCredentials);
      } else {
        setError(err instanceof ApiError ? err.message : labels.invalidCredentials);
      }
      setPending(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="card w-full max-w-md p-8">
      <Link href={`/${locale}`} className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
          <Icon name="bolt" size={20} />
        </span>
        <span className="text-lg font-bold text-dark">GreenVolt</span>
      </Link>

      <h1 className="mt-6 text-2xl">{isLogin ? labels.loginTitle : labels.registerTitle}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {isLogin ? labels.loginSubtitle : labels.registerSubtitle}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {!isLogin ? (
          <label className="block">
            <span className="label">{labels.name}</span>
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>
        ) : null}

        <label className="block">
          <span className="label">{labels.email}</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="label">{labels.password}</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
          {!isLogin ? (
            <span className="mt-1 block text-xs text-slate-400">{labels.passwordHint}</span>
          ) : null}
        </label>

        {!isLogin ? (
          <label className="block">
            <span className="label">{labels.confirmPassword}</span>
            <input
              className="input"
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? (
            <Icon name="bolt" size={16} className="animate-pulse" />
          ) : (
            <Icon name="lock" size={16} />
          )}
          {isLogin ? labels.loginButton : labels.registerButton}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {isLogin ? labels.noAccount : labels.haveAccount}{" "}
        <Link
          href={`/${locale}/${isLogin ? "register" : "login"}`}
          className="font-semibold text-primary hover:text-primary-700"
        >
          {isLogin ? labels.registerLink : labels.loginLink}
        </Link>
      </p>
    </div>
  );
}
