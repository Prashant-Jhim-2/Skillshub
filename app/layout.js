import localFont from "next/font/local";
import "./globals.css";
import Footer from './footer'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  icons: {
    icon: "/Hamster.gif",
  },
  title: "Skillshub 📝",
  description: "Website by Prashant Jhim",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>{children}</main>
        <Footer/>
      </body>
    </html>
  );
}
