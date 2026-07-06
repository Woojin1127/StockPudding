import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { useStockSearch } from '@/hooks/useStockSearch'
import type { StockSearchResult } from '@/types/stock'
import { formatMarket, isStockCode } from '@/utils/format'

interface SearchBarProps {
  /** hero: 랜딩 대형 / compact: 헤더용 소형 */
  variant?: 'hero' | 'compact'
  autoFocus?: boolean
}

export function SearchBar({
  variant = 'hero',
  autoFocus = false,
}: SearchBarProps) {
  const navigate = useNavigate()
  const inputId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)

  const { data: results, isFetching, debouncedQuery } = useStockSearch(query)
  const items = open && debouncedQuery ? (results ?? []) : []

  // 바깥 클릭으로 드롭다운 닫기
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const goToStock = (stock: Pick<StockSearchResult, 'code'>) => {
    setOpen(false)
    setQuery('')
    navigate(`/stock/${stock.code}`)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    if (highlighted >= 0 && items[highlighted]) {
      goToStock(items[highlighted])
    } else if (isStockCode(trimmed)) {
      goToStock({ code: trimmed })
    } else if (items.length > 0) {
      goToStock(items[0])
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlighted((i) => Math.min(i + 1, items.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((i) => Math.max(i - 1, -1))
    } else if (event.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  const isHero = variant === 'hero'
  const showEmpty =
    open && debouncedQuery.length > 0 && !isFetching && items.length === 0

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.3-4.3M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
            />
          </svg>
          <label htmlFor={inputId} className="sr-only">
            종목명 또는 코드 검색
          </label>
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls={`${inputId}-listbox`}
            aria-autocomplete="list"
            autoComplete="off"
            autoFocus={autoFocus}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
              setHighlighted(-1)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              isHero
                ? '종목명 또는 코드 입력 (예: 삼성전자, 005930)'
                : '종목 검색'
            }
            className={`w-full rounded-xl border border-gray-200 bg-white pr-4 pl-11 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              isHero ? 'py-3.5 text-base' : 'py-2.5 text-sm'
            }`}
          />
        </div>
        <button
          type="submit"
          className={`flex shrink-0 items-center justify-center rounded-xl bg-indigo-500 font-semibold text-white shadow-sm transition hover:bg-indigo-600 active:bg-indigo-700 ${
            isHero ? 'px-5 py-3.5' : 'px-4 py-2.5 text-sm'
          }`}
        >
          {isFetching ? (
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
              />
            </svg>
          ) : (
            '검색'
          )}
        </button>
      </form>

      {(items.length > 0 || showEmpty) && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {items.map((stock, index) => (
            <li
              key={stock.code}
              role="option"
              aria-selected={index === highlighted}
            >
              <button
                type="button"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => goToStock(stock)}
                onMouseEnter={() => setHighlighted(index)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
                  index === highlighted ? 'bg-indigo-50' : 'bg-white'
                }`}
              >
                <span className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {stock.name}
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {stock.code}
                  </span>
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {formatMarket(stock.market)}
                </span>
              </button>
            </li>
          ))}
          {showEmpty && (
            <li className="px-4 py-3 text-sm text-gray-500">
              &ldquo;{debouncedQuery}&rdquo; 검색 결과가 없어요
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
