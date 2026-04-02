import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";
import { ChatProvider } from "@/lib/chat-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Dhiraj Poddar | Agentic AI Engineer",
  description:
    "Agentic AI Engineer specializing in multi-agent systems, RAG pipelines, and cloud-native AI platforms. 4+ years of experience in AI/ML, backend engineering, and Azure cloud infrastructure.",
  keywords: [
    "AI Engineer",
    "Full Stack",
    "LangGraph",
    "RAG",
    "Multi-Agent Systems",
    "Azure",
    "FastAPI",
    "Next.js",
  ],
  authors: [{ name: "Dhiraj Poddar" }],
  openGraph: {
    title: "Dhiraj Poddar | Agentic AI Engineer",
    description:
      "Agentic AI Engineer specializing in multi-agent systems, RAG pipelines, and cloud-native AI platforms.",
    type: "website",
    locale: "en_US",
    url: "https://dhirajpoddar.dev",
    siteName: "Dhiraj Poddar Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhiraj Poddar | Agentic AI Engineer",
    description:
      "Agentic AI Engineer specializing in multi-agent systems, RAG pipelines, and cloud-native AI platforms.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dhiraj Poddar",
  jobTitle: "Agentic AI Engineer",
  url: "https://dhirajpoddar.dev",
  email: "dhirajpoddar@outlook.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ingolstadt",
    addressCountry: "Germany",
  },
  sameAs: [
    "https://www.linkedin.com/in/dhiraj-poddar/",
    "https://github.com/dhirajpodar",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        <ChatProvider>
          <Navigation />
          <main className="pt-16">{children}</main>
        </ChatProvider>
      </body>
    </html>
  );
}
