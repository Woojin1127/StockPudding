import { PATCH_NOTES } from '@/data/patchNotes'

export default function PatchNotesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900">패치노트</h1>
      <p className="mt-1 text-sm text-gray-500">
        스톡푸딩이 어떻게 자라고 있는지 기록해요.
      </p>

      <ol className="mt-6 space-y-5">
        {PATCH_NOTES.map((note, index) => (
          <li
            key={note.version}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                {note.version}
              </span>
              {index === 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  NEW
                </span>
              )}
              <span className="ml-auto text-xs text-gray-400 tabular-nums">
                {note.date}
              </span>
            </div>
            <h2 className="mt-3 text-base font-semibold text-gray-900">
              {note.emoji} {note.title}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {note.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm leading-relaxed text-gray-600"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300" />
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
