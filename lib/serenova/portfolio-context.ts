import aboutData from "@/data/about.json";
import projectsData from "@/data/projects.json";
import skillsData from "@/data/skills.json";
import certificatesData from "@/data/certificates.json";

/**
 * Builds a compact, LLM-friendly string of all portfolio data.
 * Injected directly into Serenova's system prompt every request.
 * No RAG needed — portfolio data is small enough to fit in context.
 */
export function buildPortfolioContext(): string {
  const about = aboutData as {
    name: string;
    subtitle: string;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
    resumeUrl: string;
  };

  const projects = projectsData as Array<{
    id: number;
    title: string;
    description: string;
    tech: string[];
    link?: string;
    github?: string;
    longDescription?: string;
  }>;

  const skills = skillsData as {
    skills: string[];
    tools: string[];
    frameworks: string[];
  };

  const certificates = certificatesData as Array<{
    title: string;
    platform: string;
    date: string;
    description?: string;
  }>;

  // --- ABOUT ---
  const aboutSection = `## About Lifkie
Name: ${about.name}
${about.subtitle}
Bio: ${about.bio}
GitHub: ${about.githubUrl}
LinkedIn: ${about.linkedinUrl}`;

  // --- PROJECTS ---
  const projectsSection =
    `## Projects (${projects.length} total)\n` +
    projects
      .map((p) => {
        const lines = [`### ${p.title}`, `Description: ${p.description}`, `Tech: ${p.tech.join(", ")}`];
        if (p.link) lines.push(`Live: ${p.link}`);
        if (p.github) lines.push(`GitHub: ${p.github}`);
        if (p.longDescription) {
          // Truncate to ~300 chars to keep prompt lean
          const trimmed = p.longDescription.slice(0, 300).replace(/\n+/g, " ").trim();
          lines.push(`Details: ${trimmed}${p.longDescription.length > 300 ? "..." : ""}`);
        }
        return lines.join("\n");
      })
      .join("\n\n");

  // --- SKILLS ---
  const skillsSection = `## Skills & Tools
Programming & Frameworks: ${skills.skills.join(", ")}
Tools: ${skills.tools.join(", ")}
Other Frameworks: ${skills.frameworks.join(", ")}`;

  // --- CERTIFICATES ---
  const certsSection =
    `## Certificates\n` +
    certificates
      .map((c) => `- ${c.title} — ${c.platform} (${c.date})`)
      .join("\n");

  return [aboutSection, projectsSection, skillsSection, certsSection].join(
    "\n\n"
  );
}
