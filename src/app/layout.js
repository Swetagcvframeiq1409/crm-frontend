import "./globals.css";

export const metadata = {
  title: "CRM — Internal",
  description: "Internal CRM for IT services & consulting",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
