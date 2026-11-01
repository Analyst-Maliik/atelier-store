import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Create an account | Atelier Store",
  robots: { index: false },
};

export default function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  return (
    <Suspense>
      <AuthScreen mode="sign-up" searchParams={searchParams} />
    </Suspense>
  );
}
