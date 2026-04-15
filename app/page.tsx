'use client'
import FloatingDock from '../components/FloatingDock'
import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      <FloatingDock />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}