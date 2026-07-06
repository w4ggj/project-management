import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProjectForm from '@/components/project/ProjectForm'
import { Project } from '@/types'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Project</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <ProjectForm project={data as Project} />
      </div>
    </div>
  )
}
