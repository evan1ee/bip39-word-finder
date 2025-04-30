import type { Metadata } from "next";


import "./globals.css";



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

      </body>
    </html>
  );
}
