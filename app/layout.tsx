import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';


import "./globals.css";



export const metadata: Metadata = {
  title: "Points convert to Bip39 mnemonic",
  description: "Points convert to Bip39 mnemonic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />

      </body>
    </html>
  );
}
