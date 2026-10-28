import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./Providers";

export const metadata: Metadata = {
  title: "CourtLink — Le réseau de confiance du basketball ouest-africain",
  description:
    "Découvrez, évaluez et recrutez les talents du basketball : profils vérifiés, opportunités régionales, suivi de recrutement et scouting structuré. Bénin & Afrique de l'Ouest francophone.",
  keywords: ["basketball", "recrutement", "scouting", "Bénin", "Afrique de l'Ouest", "académie", "club"],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "CourtLink — Le talent local mérite une vraie visibilité",
    description: "Profils vérifiés, opportunités claires, décisions mieux informées.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
