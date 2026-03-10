import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "tmro-mero - Share, Co-buy & Collaborate Together",
  description: "A free open-source platform for young people to share resources, co-buy items, and collaborate. Connect with your community, save money, and build together.",
  keywords: ["sharing", "co-buying", "collaboration", "community", "students", "resources", "open-source"],
  authors: [{ name: "tmro-mero Community" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "tmro-mero - Share, Co-buy & Collaborate",
    description: "Connect with people who share your interests. Buy together, share resources, plan trips, and build community.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tmro-mero - Share, Co-buy & Collaborate",
    description: "Connect with people who share your interests. Buy together, share resources, plan trips, and build community.",
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
        className={`${poppins.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
