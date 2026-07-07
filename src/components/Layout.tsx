import { Link, Outlet, useLocation } from 'react-router-dom'

import { SearchBar } from '@/components/SearchBar'

/** 공통 셸 — 상단 로고(+분석 페이지에선 검색바), 하단 고지 푸터 */
export function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-gray-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="shrink-0 text-lg font-bold text-gray-900 transition hover:opacity-80"
          >
            🍮 <span className="text-indigo-600">스톡</span>푸딩
          </Link>
          {!isHome && (
            <div className="ml-auto w-full max-w-xs">
              <SearchBar variant="compact" />
            </div>
          )}
          <Link
            to="/patches"
            className={`shrink-0 text-sm font-medium text-gray-500 transition hover:text-indigo-600 ${
              isHome ? 'ml-auto' : ''
            }`}
          >
            📋 <span className="hidden sm:inline">패치노트</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-400">
        <p>
          스톡푸딩은 신호만 보여드려요. 매매 권유가 아니며, 투자 판단과 책임은
          본인에게 있어요.
        </p>
        <p className="mt-1">© 2026 Stock Pudding</p>
      </footer>
    </div>
  )
}
