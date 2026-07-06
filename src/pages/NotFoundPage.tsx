import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-4xl" aria-hidden="true">
        🍮
      </p>
      <h1 className="mt-4 text-xl font-semibold text-gray-900">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        주소가 잘못됐거나 사라진 페이지예요.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
