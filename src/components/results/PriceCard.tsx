import type { Price } from '@/lib/algolia'

interface PriceCardProps {
  price: Price
}

export function PriceCard({ price }: PriceCardProps) {
  const items = [
    { label: 'Gas, per gallon', value: price.gas_price_gallon },
    { label: 'Minimum wage, per hour', value: price.minimum_wage },
    { label: 'Movie ticket', value: price.movie_ticket_price },
  ].filter((item) => item.value != null)

  if (items.length === 0) return null

  return (
    <section aria-labelledby="sec-prices">
      <h3 id="sec-prices" className="ed-label text-faded">Cost of living</h3>
      <p className="mt-1 ed-label text-faded">{price.year} prices</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-end font-display text-base">
            <span>{item.label}</span>
            <span className="ed-leader" aria-hidden="true" />
            <span className="font-display text-xl font-bold">${item.value!.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface PriceComparisonProps {
  oldPrice: Price
  currentYear?: number
}

export function PriceComparison({ oldPrice, currentYear = 2024 }: PriceComparisonProps) {
  const yearsAgo = currentYear - oldPrice.year
  const inflationMultiplier = Math.pow(1.03, yearsAgo)

  if (!oldPrice.gas_price_gallon) return null

  const adjustedGas = oldPrice.gas_price_gallon * inflationMultiplier

  return (
    <p className="mt-6 border-t border-ink pt-4 font-body text-sm text-pretty">
      <span className="ed-label block text-faded">Adjusted for inflation</span>
      <span className="mt-1 block">
        Gas at ${oldPrice.gas_price_gallon.toFixed(2)} in {oldPrice.year} would be about ${adjustedGas.toFixed(2)} today.
      </span>
    </p>
  )
}
