import { supabase } from '@/lib/supabase'
import { Template } from '@/types'
import TemplateManager from '@/components/templates/TemplateManager'

async function getTemplates(): Promise<Template[]> {
  const { data } = await supabase
    .from('templates')
    .select('*, template_todos(*)')
    .order('name')
  return (data ?? []) as Template[]
}

export default async function TemplatesPage() {
  const templates = await getTemplates()
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Project Templates</h1>
      </div>
      <TemplateManager initial={templates} />
    </div>
  )
}
