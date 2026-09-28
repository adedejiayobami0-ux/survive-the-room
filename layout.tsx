import "./globals.css";

export const metadata = {
  title: "Outsmart",
  description: "Learn by making decisions, surviving consequences, and playing with friends."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
