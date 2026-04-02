"use client";

import type { CardType } from "@/lib/agent-events";
import {
  PROJECTS,
  EXPERIENCE,
  SKILLS,
  EDUCATION,
} from "@/lib/constants";
import ProjectCards from "./project-card";
import ExperienceCards from "./experience-card";
import SkillCards from "./skill-card";
import EducationCards from "./education-card";
import ContactCard from "./contact-card";

export default function CardRenderer({
  cardTypes,
}: {
  cardTypes: CardType[];
}) {
  if (!cardTypes || cardTypes.length === 0) return null;

  // Use the last non-null card type (most relevant to the response)
  const cardType = cardTypes.filter(Boolean).at(-1);
  if (!cardType) return null;

  switch (cardType) {
    case "projects":
      return <ProjectCards projects={PROJECTS} />;
    case "experience":
      return <ExperienceCards experiences={EXPERIENCE} />;
    case "skills":
      return <SkillCards skills={SKILLS} />;
    case "education":
      return <EducationCards education={EDUCATION} />;
    case "contact":
      return <ContactCard />;
    default:
      return null;
  }
}
