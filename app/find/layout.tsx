import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';


export const metadata: Metadata = {
  title: "BIP39 Word Finder",
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
