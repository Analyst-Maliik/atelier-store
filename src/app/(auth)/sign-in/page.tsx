import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Sign in | Atelier Store",
  robots: { index: false },
};

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <Suspense>
      <AuthScreen mode="sign-in" searchParams={searchParams} />
    </Suspense>
  );
}
