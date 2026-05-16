import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn, auth } from "@/auth";

export const metadata = {
  title: "Sign in · WeatherCore",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session) redirect(callbackUrl || "/");

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-[rgba(180,192,217,0.18)] bg-[rgba(30,36,53,0.6)] p-8 backdrop-blur-xl">
        <Link href="/" className="mb-8 flex justify-center">
          <Image
            src="/branding/weathercore-banner.png"
            alt="WeatherCore — Atmospheric Intelligence"
            width={680}
            height={280}
            className="h-auto w-full max-w-[320px] object-contain"
            priority
          />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Sync your saved locations and unit preferences.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl ?? "/" });
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#1e2435] transition hover:bg-white/90"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[rgba(180,192,217,0.15)]" />
          <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
            or
          </span>
          <span className="h-px flex-1 bg-[rgba(180,192,217,0.15)]" />
        </div>

        <form
          action={async (formData) => {
            "use server";
            await signIn("resend", {
              email: formData.get("email") as string,
              redirectTo: callbackUrl ?? "/",
            });
          }}
          className="space-y-3"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl bg-[rgba(30,36,53,0.7)] px-4 py-2.5 text-sm ring-1 ring-[rgba(180,192,217,0.15)] focus:outline-none focus:ring-[color:var(--color-light)]/50"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[color:var(--color-primary)]/60 px-4 py-2.5 text-sm font-medium ring-1 ring-[color:var(--color-light)]/30 hover:bg-[color:var(--color-primary)]/80"
          >
            Email me a magic link
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[color:var(--color-text-muted)]">
          By signing in you agree to our terms and acknowledge our privacy policy.
        </p>
      </div>
    </div>
  );
}
