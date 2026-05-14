import { getProjects, getAbout, getSkillsTools, getCertificates } from '@/data/projects'
import HomeClient from './HomeClient'

export default function Page() {
  const projects = getProjects()
  const about = getAbout()
  const skillsTools = getSkillsTools()
  const certificates = getCertificates()

  return <HomeClient projects={projects} about={about} skillsTools={skillsTools} certificates={certificates} />
}