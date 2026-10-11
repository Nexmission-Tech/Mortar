/**
 * The five journey drawings: a booking form with a key and unit tag, a
 * document folder, a bank, a letter of offer with a stamp, and a signed
 * agreement with a pen. One 2-unit stroke in a 96-unit box over a faint ground
 * mark; journey.css colours them from theme tokens. Decorative: the station's
 * name, node and caption carry the meaning.
 */
import type { ReactNode } from 'react'
import type { JourneyStopId } from '../bookingJourney'

const PAPER = 'journey-art-paper journey-art-line'
const SHADE = 'journey-art-shade journey-art-line'
const LINE = 'journey-art-line'

const DRAWINGS: Record<JourneyStopId, ReactNode> = {
  booked: (
    <>
      <path className={PAPER} d="M21 12h34l11 11v56H21z" />
      <path className={SHADE} d="M55 12v12h11" />
      <path className={LINE} d="M30 31h22M30 43h26M30 51h19M30 65h13" />
      <path className={SHADE} d="m60 63 12-7 14 18-12 9-14-15z" />
      <circle className={LINE} cx="69" cy="65" r="2" />
      <circle className={PAPER} cx="65" cy="49" r="9" />
      <path className={LINE} d="m61 57-9 18m4-8 5 3m-8 3 5 3" />
    </>
  ),
  documents: (
    <>
      <path className={SHADE} d="M13 31h24l6 6h39v43H13z" />
      <path className={PAPER} d="M26 14h35l10 11v38H26z" />
      <path className={SHADE} d="M61 14v11h10" />
      <path className={LINE} d="M35 32h23M35 41h23" />
      <path className={PAPER} d="M12 46h27l7 6h38l-7 29H18z" />
      <rect className={SHADE} x="27" y="58" width="19" height="8" rx="1" />
    </>
  ),
  loan_submitted: (
    <>
      <path className={PAPER} d="m13 31 35-20 35 20z" />
      <path className={SHADE} d="M16 31h64v8H16z" />
      <path className={SHADE} d="M21 39h54v31H21z" />
      <path className={PAPER} d="M22 39h10v31H22zM43 39h10v31H43zM64 39h10v31H64z" />
      <path className={PAPER} d="M18 70h60v6H18zM12 76h72v7H12z" />
      <path className={LINE} d="M41 26h14" />
    </>
  ),
  loan_approved: (
    <>
      <path className={PAPER} d="M20 12h34l11 11v57H20z" />
      <path className={SHADE} d="M54 12v12h11" />
      <path className={LINE} d="M29 32h22M29 44h26M29 53h18M29 68h12" />
      <path className={SHADE} d="M50 70h34v11H50z" />
      <path className={PAPER} d="M61 70V59c0-6-5-7-5-13a11 11 0 0 1 22 0c0 6-5 7-5 13v11z" />
      <path className={LINE} d="M61 62h12" />
    </>
  ),
  spa_signed: (
    <>
      <path className={SHADE} d="M25 16h32l12 12v55H25z" />
      <path className={PAPER} d="M19 12h33l11 11v56H19z" />
      <path className={SHADE} d="M52 12v11h11" />
      <path className={LINE} d="M28 32h23M28 44h25M28 53h18M28 68c9-11 12-11 8-3s8-4 9-1-2 5 8 0" />
      <g transform="rotate(23 75 47)">
        <path className={PAPER} d="M71 16h8v47l-4 14-4-14z" />
        <path className={SHADE} d="M71 16h8v29h-8z" />
        <path className={LINE} d="M71 63h8M75 67v7" />
      </g>
    </>
  )
}

export function MilestoneIllustration({ id }: { id: JourneyStopId }) {
  return (
    <svg className="journey-art" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <ellipse className="journey-art-ground" cx="48" cy="89" rx="34" ry="3" />
      {DRAWINGS[id]}
    </svg>
  )
}
