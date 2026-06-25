import { getProjects, getAbout, getSkillsTools, getCertificates } from '@/data/projects'
import HomeClient from './HomeClient'

export default async function Page() {
  const projects = await getProjects()
  const about = await getAbout()
  const skillsTools = await getSkillsTools()
  const certificates = await getCertificates()

  return <HomeClient projects={projects} about={about} skillsTools={skillsTools} certificates={certificates} />
}


