import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Financial System",
  description: "A clear, flexible plan for every part of your income.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
