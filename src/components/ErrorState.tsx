/** 분석/검색 실패 화면 (DesignSystem.md §5.9) */
export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-8 text-center">
      <p className="text-3xl" aria-hidden="true">
        🍮
      </p>
      <p className="mt-3 text-base font-semibold text-gray-900">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          다시 시도하기
        </button>
      )}
    </div>
  )
}
