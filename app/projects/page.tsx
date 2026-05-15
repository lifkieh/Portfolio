import ProjectCard from '../../components/ProjectCard'
import { getProjects } from '../../data/projects' 

export default async function ProjectsPage() {
  const projects = await getProjects()
  return (
    <div className="min-h-screen bg-[#120b18] text-[#f1eaf5]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">Projects</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </div>
  )
}