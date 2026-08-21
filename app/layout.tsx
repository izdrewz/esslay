import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Esslay V2",
  description: "A source-grounded workspace for breaking down questions, saving exact PDF evidence, and linking it to a draft.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Esslay V2",
    description: "Trace highlighted writing back to the exact source passage.",
    images: [
      {
        url: "/esslay-social.jpg",
        width: 1200,
        height: 630,
        alt: "An essay page with highlighted lines connected to its source pages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Esslay V2",
    description: "Trace highlighted writing back to the exact source passage.",
    images: ["/esslay-social.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
