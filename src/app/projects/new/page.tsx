import ProjectForm from '@/components/project/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Project</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <ProjectForm />
      </div>
    </div>
  )
}
