import AboutSection from "@/components/landing/about-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Dhiraj Poddar",
  description: "From Nepal to Germany — building production AI systems that solve real-world problems.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[750px] mx-auto px-4 sm:px-6 py-12">
      <h1
        className="text-3xl sm:text-4xl font-bold text-text-heading mb-2"
        style={{ letterSpacing: "-0.04em" }}
      >
        About Me
      </h1>
      <p className="text-text-muted mb-10">
        The story behind the code.
      </p>
      <AboutSection />
    </div>
  );
}
