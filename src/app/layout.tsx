import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { WalletProvider } from "@/contexts/WalletContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farcaster Giveaway Draw - Win with Comments",
  description: "Randomly select winners from Farcaster post comments. Fair and transparent giveaway tool for the Farcaster community.",
  keywords: ["Farcaster", "Giveaway", "Neynar", "Web3", "Social Media", "Contest", "Random Draw"],
  authors: [{ name: "Farcaster Giveaway Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Farcaster Giveaway Draw",
    description: "Fair and transparent giveaway tool for Farcaster community",
    url: "https://chat.z.ai",
    siteName: "Farcaster Giveaway",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farcaster Giveaway Draw",
    description: "Fair and transparent giveaway tool for Farcaster community",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
