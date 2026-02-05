import { Price } from '@/lib/algolia'
import { AnimatedNumber } from '@/components/animations/AnimatedNumber'

interface PriceCardProps {
  price: Price
}

export function PriceCard({ price }: PriceCardProps) {
  const items = [
    {
      label: 'GAS',
      value: price.gas_price_gallon,
      unit: '/gal',
      icon: '⛽',
    },
    {
      label: 'WAGE',
      value: price.minimum_wage,
      unit: '/hr',
      icon: '◐',
    },
    {
      label: 'MOVIE',
      value: price.movie_ticket_price,
      unit: '',
      icon: '▶',
    },
  ].filter((item) => item.value != null)

  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Section header - gas station sign style */}
      <div className="flex items-center gap-3 pb-2 border-b border-crt-light/20">
        <div className="led-display px-2 py-1">
          <span className="text-phosphor-green text-lg">$</span>
        </div>
        <div>
          <h3 className="font-display text-xl text-aged-cream">
            Price Check
          </h3>
          <p className="led-text text-phosphor-green text-xs tracking-widest">
            {price.year} PRICES
          </p>
        </div>
      </div>

      {/* Price grid - LED display style like old gas station signs */}
      <div className="grid grid-cols-3 gap-3">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="bg-crt-black border-2 border-crt-light/40 rounded p-3 text-center hover:border-phosphor-green/50 transition-colors group cascade-in"
            style={{ animationDelay: `${0.3 + index * 0.15}s` }}
          >
            {/* Icon */}
            <div className="text-2xl mb-2 text-phosphor-amber group-hover:animate-pulse">
              {item.icon}
            </div>

            {/* Price - LED segment display style */}
            <div className="led-display inline-block px-3 py-2 mb-2">
              <AnimatedNumber
                value={item.value!}
                prefix="$"
                suffix={item.unit}
                decimals={2}
                className="led-text text-phosphor-green text-xl"
              />
            </div>

            {/* Label */}
            <div className="led-text text-aged-cream/50 text-xs tracking-widest">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
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
    <div className="bg-gradient-to-r from-crt-dark via-crt-medium/50 to-crt-dark border border-crt-light/30 rounded p-4">
      <div className="flex items-start gap-3">
        {/* Ticker tape style indicator */}
        <div className="w-2 h-2 rounded-full bg-phosphor-green animate-pulse mt-2 flex-shrink-0" />

        <div>
          <p className="led-text text-phosphor-green text-xs tracking-widest mb-2">
            INFLATION ADJUSTMENT
          </p>
          <p className="text-aged-cream/80 text-sm font-body">
            Gas at <AnimatedNumber value={oldPrice.gas_price_gallon} prefix="$" decimals={2} className="text-phosphor-amber font-bold" /> in {oldPrice.year} would be about{' '}
            <AnimatedNumber value={adjustedGas} prefix="$" decimals={2} className="text-phosphor-green font-bold" /> today
          </p>
        </div>
      </div>
    </div>
  )
}
