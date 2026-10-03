import "./globals.css";

export const metadata = { title: "কৃষি উপদেষ্টা", description: "ফসলের রোগের প্রাথমিক পরামর্শ, বাংলায়, Gemma দিয়ে" };
export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (<html lang="bn"><body>{children}</body></html>);
}
