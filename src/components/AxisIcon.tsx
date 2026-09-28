import type { ReactNode } from 'react'
import type { Axis } from '../types.ts'

const size = 28

function Svg({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-burgundy"
    >
      <title>{label}</title>
      {children}
    </svg>
  )
}

/** Kleine Strich-Icons je Kategorie — Holztisch-Stil, kein Emoji. */
export function AxisIcon({ axis }: { axis: Axis }) {
  switch (axis) {
    case 'weight':
      return (
        <Svg label="Gewicht">
          <path d="M8 11h12l-1.5 10H9.5L8 11Z" />
          <path d="M11 11c0-2 1.2-3.5 3-3.5S17 9 17 11" />
        </Svg>
      )
    case 'height':
      return (
        <Svg label="Höhe">
          <path d="M14 5v18" />
          <path d="M10 9l4-4 4 4" />
          <path d="M10 19l4 4 4-4" />
        </Svg>
      )
    case 'distance':
      return (
        <Svg label="Strecke">
          <circle cx="7" cy="14" r="2.5" />
          <circle cx="21" cy="14" r="2.5" />
          <path d="M9.5 14h9" />
        </Svg>
      )
    case 'year':
      return (
        <Svg label="Geburtsjahr">
          <rect x="6" y="7" width="16" height="15" rx="1.5" />
          <path d="M6 12h16" />
          <path d="M10 5v3M18 5v3" />
        </Svg>
      )
    case 'speed':
      return (
        <Svg label="Tempo">
          <path d="M6 18c2-7 6-11 14-12-2 4-2 8 0 12H6Z" />
          <path d="M11 14h4" />
        </Svg>
      )
    case 'temp':
      return (
        <Svg label="Temperatur">
          <path d="M12 4v11.2a3.5 3.5 0 1 0 4 0V4a2 2 0 0 0-4 0Z" />
          <path d="M12 16.5h4" />
        </Svg>
      )
    case 'count':
      return (
        <Svg label="Anzahl">
          <circle cx="9" cy="10" r="2" />
          <circle cx="19" cy="10" r="2" />
          <circle cx="9" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
        </Svg>
      )
    case 'population':
      return (
        <Svg label="Einwohner">
          <circle cx="10" cy="9" r="2.5" />
          <circle cx="18" cy="10" r="2" />
          <path d="M5 21c.5-3.5 2.5-5.5 5-5.5s4.5 2 5 5.5" />
          <path d="M15 21c.3-2.2 1.4-3.5 3-3.5s2.5 1 3 3.5" />
        </Svg>
      )
    case 'area':
      return (
        <Svg label="Fläche">
          <path d="M6 8l8-3 8 3v12l-8 3-8-3V8Z" />
          <path d="M14 5v15" />
        </Svg>
      )
    case 'duration':
      return (
        <Svg label="Dauer">
          <circle cx="14" cy="15" r="8" />
          <path d="M14 15V9M14 15l4 3" />
          <path d="M11 4h6" />
        </Svg>
      )
    case 'depth':
      return (
        <Svg label="Tiefe">
          <path d="M5 8h18" />
          <path d="M8 8c1 4 2 8 6 12 4-4 5-8 6-12" />
          <path d="M14 12v5" />
        </Svg>
      )
    case 'power':
      return (
        <Svg label="Leistung">
          <path d="M15 4L8 15h5l-1 9 8-12h-5L15 4Z" />
        </Svg>
      )
    case 'calories':
      return (
        <Svg label="Kalorien">
          <path d="M14 5c-4 5-6 8-6 11a6 6 0 0 0 12 0c0-3-2-6-6-11Z" />
        </Svg>
      )
    case 'price':
      return (
        <Svg label="Preis">
          <circle cx="14" cy="14" r="9" />
          <path d="M14 8v12M11 11h4.5a2 2 0 0 1 0 4H11a2 2 0 0 0 0 4h5" />
        </Svg>
      )
    default:
      return (
        <Svg label="Fakt">
          <circle cx="14" cy="14" r="8" />
          <path d="M14 10v5M14 18.5v.5" />
        </Svg>
      )
  }
}
