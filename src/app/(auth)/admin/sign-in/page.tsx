import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "@/auth";
import { Icon } from "@/components/icons/Icon";

export const metadata: Metadata = {
  title: "Sign in — Sheepdog Society",
  robots: { index: false, follow: false },
};

async function signInAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/admin/dashboard",
  });
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const errorLabel =
    params.error === "CredentialsSignin"
      ? "Email or password is incorrect, or that email is not on the admin list."
      : params.error
      ? "Something went wrong. Try again or email Drew."
      : null;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-iron text-bone">
      <div className="aurora aurora--soft" aria-hidden />
      <div className="dotted-grid absolute inset-0 opacity-[0.04]" aria-hidden />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Sheepdog Society"
            className="h-20 w-20"
          />
          <div>
            <h1
              className="display-xl text-3xl text-bone"
              style={{ color: "#F4F0E6" }}
            >
              Sheepdog Society
            </h1>
            <p
              className="mt-2 section-mark"
              style={{ color: "#D4A02A" }}
            >
              § Admin sign-in
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          action={signInAction}
          className="mt-12 space-y-5 border bg-iron/40 p-8 backdrop-blur"
          style={{
            borderColor: "rgba(199, 183, 154, 0.18)",
            color: "#F4F0E6",
          }}
        >
          <label className="block">
            <span
              className="block section-mark"
              style={{ color: "#C7B79A" }}
            >
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2 block h-11 w-full bg-transparent px-3 text-base focus:outline-none"
              style={{
                border: "1px solid rgba(199, 183, 154, 0.25)",
                color: "#F4F0E6",
              }}
            />
          </label>
          <label className="block">
            <span
              className="block section-mark"
              style={{ color: "#C7B79A" }}
            >
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-2 block h-11 w-full bg-transparent px-3 text-base focus:outline-none"
              style={{
                border: "1px solid rgba(199, 183, 154, 0.25)",
                color: "#F4F0E6",
              }}
            />
          </label>

          {errorLabel ? (
            <p
              className="border px-3 py-2 text-sm"
              style={{
                borderColor: "rgba(124, 24, 24, 0.5)",
                background: "rgba(124, 24, 24, 0.15)",
                color: "#F4F0E6",
              }}
            >
              {errorLabel}
            </p>
          ) : null}

          <button
            type="submit"
            className="lift inline-flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] transition-colors"
            style={{
              background: "#D4A02A",
              color: "#0B1426",
            }}
          >
            Sign in
            <Icon name="arrow-right" size={14} />
          </button>
        </form>

        <p
          className="mt-10 text-center text-xs"
          style={{ color: "rgba(199, 183, 154, 0.65)" }}
        >
          Admin access only.{" "}
          <Link
            href="mailto:beargodwin@gmail.com?subject=Sheepdog%20Society%20sign-in%20help"
            className="underline underline-offset-4 transition-colors"
            style={{ color: "#D4A02A" }}
          >
            Email Drew
          </Link>{" "}
          if you need help.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center gap-2 text-xs transition-colors hover:opacity-100"
          style={{ color: "rgba(199, 183, 154, 0.55)" }}
        >
          <Icon name="arrow-right" size={10} className="rotate-180" />
          Back to the public site
        </Link>
      </div>
    </div>
  );
}
