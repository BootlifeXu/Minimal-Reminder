import { Spinner } from "@/components/ui/spinner"

export default function SpinnerPreview() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
        <p className="text-sm text-slate-600">Spinner component preview</p>
      </div>
    </div>
  )
}
