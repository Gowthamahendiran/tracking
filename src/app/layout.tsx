import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { cookies } from "next/headers";
import { HabitProvider } from "@/context/HabitContext";

export const metadata: Metadata = {
  title: "SPOWER",
  description: "Track your habits, weight, and fitness routines with SPOWER.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  // If not logged in, render without Sidebar wrapper (e.g. for Login/Register)
  if (!token) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <HabitProvider>
            {children}
          </HabitProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <HabitProvider>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </HabitProvider>
      </body>
    </html>
  );
}
