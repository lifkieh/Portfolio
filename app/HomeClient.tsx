'use client'

import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Certificates from '@/components/Certificates'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import type { Project, AboutData, SkillsToolsData, Certificate } from '@/data/projects'

interface Props {
  projects: Project[]
  about: AboutData
  skillsTools: SkillsToolsData
  certificates: Certificate[]
}

export default function HomeClient({ projects, about, skillsTools, certificates }: Props) {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      <main>
        <Hero projects={projects} about={about} />
        <About about={about} skillsTools={skillsTools} />
        <Projects projects={projects} />
        <Certificates certificates={certificates} />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
