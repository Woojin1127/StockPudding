import { Link } from 'react-router-dom'

import { SearchBar } from '@/components/SearchBar'
import { useRecentStocks } from '@/store/recentStocks'

const POPULAR_STOCKS = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '035420', name: 'NAVER' },
  { code: '035720', name: '카카오' },
  { code: '005380', name: '현대차' },
  { code: '068270', name: '셀트리온' },
]

const STEPS = [
  {
    step: '1',
    title: '종목을 검색해요',
    desc: '이름이든 코드든 괜찮아요. 코스피·코스닥 전 종목을 찾아드려요.',
  },
  {
    step: '2',
    title: '신호등을 확인해요',
    desc: '6가지 지표를 0~100점으로 모아 🟢🟡🔴 하나로 보여드려요.',
  },
  {
    step: '3',
    title: '판단은 직접 해요',
    desc: '저희는 사세요·파세요를 말하지 않아요. 근거만 쉽게 풀어드려요.',
  },
]

const FEATURES = [
  {
    emoji: '🔍',
    title: '용어 몰라도 OK',
    desc: 'RSI, PBR이 뭔지 몰라도 괜찮아요. 모든 지표 옆에 쉬운 말 해설이 붙어요.',
  },
  {
    emoji: '⚖️',
    title: '지표만, 감정 없이',
    desc: '뉴스도 소문도 AI 상상도 없어요. 오직 객관적 지표 6종, 규칙 기반 해석.',
  },
  {
    emoji: '🍮',
    title: '떠먹여 드려요',
    desc: '종합 점수 하나, 신호등 하나, 한줄 진단 하나. 5초면 상태 파악 끝.',
  },
]

function StockChip({ code, name }: { code: string; name: string }) {
  return (
    <Link
      to={`/stock/${code}`}
      className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
    >
      {name}
    </Link>
  )
}

export default function LandingPage() {
  const recent = useRecentStocks((s) => s.recent)
  const clearRecent = useRecentStocks((s) => s.clearRecent)

  return (
    <div>
      {/* 히어로 */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,theme(colors.indigo.100),transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 pt-14 pb-12 text-center">
          <span className="animate-fade-up rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-semibold text-indigo-600">
            주린이를 위한 종목 분석
          </span>
          <h1 className="animate-fade-up max-w-lg text-3xl leading-snug font-bold text-gray-900 sm:text-4xl">
            이 종목, 지금 어떤 상태일까요?
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              5초면 알 수 있어요.
            </span>
          </h1>
          <p className="animate-fade-up max-w-md text-sm text-gray-500 sm:text-base">
            어려운 지표 6가지를 계산해서 점수 하나, 신호등 하나로 떠먹여 드려요.
            판단은 당신이, 근거는 저희가.
          </p>

          <div className="animate-fade-up relative z-20 w-full max-w-md">
            <SearchBar autoFocus />
          </div>

          <div className="animate-fade-up flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400">바로 보기</span>
            {POPULAR_STOCKS.map((stock) => (
              <StockChip key={stock.code} {...stock} />
            ))}
          </div>

          {recent.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-gray-400">최근 본 종목</span>
              {recent.map((stock) => (
                <StockChip key={stock.code} {...stock} />
              ))}
              <button
                type="button"
                onClick={clearRecent}
                className="text-xs text-gray-400 underline-offset-2 hover:underline"
              >
                지우기
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3단계 */}
      <section className="border-y border-gray-200 bg-white px-4 py-12">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3 sm:flex-col">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                {step}
              </span>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 특징 */}
      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="text-2xl">{emoji}</div>
              <h2 className="mt-2 text-base font-semibold text-gray-900">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 예시 CTA */}
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 p-6 text-center text-white shadow-md sm:p-8">
          <h2 className="text-lg font-semibold sm:text-xl">
            백문이 불여일견 🍮
          </h2>
          <p className="mt-1 text-sm text-indigo-100">
            국민주 삼성전자는 지금 어떤 상태인지 직접 확인해보세요.
          </p>
          <Link
            to="/stock/005930"
            className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
          >
            삼성전자 분석 보러가기 →
          </Link>
        </div>
      </section>
    </div>
  )
}
