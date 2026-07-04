import { useState } from 'react'
import { SearchBar } from '@/components/SearchBar'

type IndicatorTone = 'green' | 'yellow' | 'red'

const toneStyles: Record<
  IndicatorTone,
  { border: string; dot: string; text: string }
> = {
  green: {
    border: 'border-l-emerald-400',
    dot: 'bg-emerald-400',
    text: 'text-emerald-700',
  },
  yellow: {
    border: 'border-l-amber-400',
    dot: 'bg-amber-400',
    text: 'text-amber-700',
  },
  red: { border: 'border-l-red-400', dot: 'bg-red-400', text: 'text-red-700' },
}

function FeatureItem({
  emoji,
  title,
  desc,
}: {
  emoji: string
  title: string
  desc: string
}) {
  return (
    <div className="rounded-xl bg-white p-4 text-center shadow-sm">
      <div className="text-2xl">{emoji}</div>
      <h2 className="mt-2 text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-gray-500">{desc}</p>
    </div>
  )
}

function IndicatorPreview({
  label,
  value,
  desc,
  tone,
}: {
  label: string
  value: string
  desc: string
  tone: IndicatorTone
}) {
  const styles = toneStyles[tone]
  return (
    <div
      className={`rounded-xl border border-l-4 border-gray-200 bg-white p-4 shadow-sm ${styles.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs tracking-wide text-gray-500 uppercase">
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          {label}
        </span>
        <span className={`text-xl font-bold tabular-nums ${styles.text}`}>
          {value}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null)

  const handleSearch = (query: string) => {
    setSubmittedQuery(query)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-center py-6">
        <span className="text-xl font-semibold text-gray-900">
          🍮 <span className="text-indigo-600">스톡</span>푸딩
        </span>
      </header>

      <section className="flex flex-col items-center gap-6 px-4 pt-8 pb-12 text-center">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          주린이를 위한 종목 분석
        </span>
        <h1 className="max-w-lg text-3xl leading-snug font-bold text-gray-900 sm:text-4xl">
          이 종목, 지금 어떤 상태일까요?
        </h1>
        <p className="max-w-md text-sm text-gray-500 sm:text-base">
          어려운 지표는 저희가 풀어드릴게요.
          <br />
          종목명이나 코드만 입력하면 5초 안에 딱 보여드려요.
        </p>

        <div className="w-full max-w-md">
          <SearchBar onSearch={handleSearch} />
        </div>

        {submittedQuery && (
          <p className="text-sm text-gray-400">
            &ldquo;{submittedQuery}&rdquo; 분석 페이지는 아직 준비 중이에요.
            조금만 기다려주세요 🍮
          </p>
        )}
      </section>

      <section className="bg-gray-100 px-4 py-12">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureItem
            emoji="🔍"
            title="쉬운 해석"
            desc="RSI, PBR 같은 용어 몰라도 괜찮아요. 쉬운 말로 바로 알려드려요."
          />
          <FeatureItem
            emoji="⚖️"
            title="객관적 지표"
            desc="감정이나 뉴스 없이 6가지 핵심 지표로만 판단해요."
          />
          <FeatureItem
            emoji="🚫"
            title="매매 권유 없음"
            desc="사세요, 파세요는 없어요. 신호만 보여드리고 판단은 직접."
          />
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-lg font-semibold text-gray-900">
            이렇게 보여드려요
          </h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            예시: 삼성전자 (005930)
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  삼성전자
                </h3>
                <p className="text-xs text-gray-500">005930 · 코스피</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                🟢 안정
              </span>
            </div>

            <div className="mt-6 text-center">
              <p className="text-5xl font-bold tabular-nums text-gray-900">
                68
              </p>
              <p className="text-xs text-gray-400">/ 100점</p>
              <div className="mx-auto mt-3 h-3 w-full max-w-xs rounded-full bg-gray-100">
                <div
                  className="h-3 rounded-full bg-emerald-400"
                  style={{ width: '68%' }}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600">
                지금은 비교적 안정적이에요
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <IndicatorPreview
                label="RSI"
                value="62.3"
                desc="과열도 침체도 아닌 적정 구간이에요."
                tone="green"
              />
              <IndicatorPreview
                label="PBR"
                value="1.23배"
                desc="자산 대비 크게 비싸지 않아요."
                tone="green"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-400">
        <p>투자 판단은 직접 하세요. 스톡푸딩은 신호만 보여드려요.</p>
        <p className="mt-1">© 2026 Stock Pudding</p>
      </footer>
    </div>
  )
}
