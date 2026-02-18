import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black antialiased">
        <Providers>
          <main>{children}</main>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
