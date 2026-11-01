import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { safeNext } from "@/lib/safe-redirect";
import { getSession } from "@/lib/session";

type Props = {
  mode: "sign-in" | "sign-up";
  searchParams: Promise<{ next?: string | string[] }>;
};

const copy = {
  "sign-in": { eyebrow: "Welcome back", title: "Sign in" },
  "sign-up": { eyebrow: "Join Atelier", title: "Create an account" },
} as const;

/** Reads the session and query string, so render it inside <Suspense>. */
export async function AuthScreen({ mode, searchParams }: Props) {
  const { next: rawNext } = await searchParams;
  const next = safeNext(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  if (await getSession()) redirect(next);

  return (
    <section className="container-site py-section lg:py-section-lg">
      <div className="mx-auto w-full max-w-md">
        <p className="eyebrow text-muted mb-2">{copy[mode].eyebrow}</p>
        <h1 className="heading-title mb-10">{copy[mode].title}</h1>
        <AuthForm mode={mode} next={next} />
      </div>
    </section>
  );
}
