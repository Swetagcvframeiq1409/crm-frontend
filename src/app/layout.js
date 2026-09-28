import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "CRM — Internal",
  description: "Internal CRM for IT services & consulting",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
