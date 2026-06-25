'use client'

import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Certificates from '@/components/Certificates'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import ThemeCanvas from '@/components/ThemeCanvas'
import GhibliScene from '@/components/GhibliScene'
import UnderseaScene from '@/components/UnderseaScene'
import DufanScene from '@/components/dufan/DufanScene'
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
      {/* Canvas layer — behind everything */}
      <ThemeCanvas />
      {<GhibliScene />}
      {<UnderseaScene />}
      {<DufanScene />}

      {/* Cyberpunk city glow — CSS only overlay */}
      <div className="city-glow fixed bottom-0 left-0 right-0 h-[30vh] pointer-events-none z-0" />

      {/* Scanlines overlay */}
      <div className="scanlines-overlay fixed inset-0 pointer-events-none z-[2]" />

      {/* Game pixel grid */}
      <div className="pixel-grid fixed inset-0 pointer-events-none z-[1]" />

      {/* Undersea water reflection */}
      <div className="water-overlay fixed inset-0 pointer-events-none z-[1]" />

      <Navbar />
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
