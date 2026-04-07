import { Button } from "@/components/ui/button"

export default function ButtonPreview() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Button Preview</h1>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
    </div>
  )
}
