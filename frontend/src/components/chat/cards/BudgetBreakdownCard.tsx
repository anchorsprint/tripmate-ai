'use client'

interface BudgetCategory {
  name: string
  icon: string
  amount: number
  percentage?: number
}

interface BudgetBreakdownCardProps {
  title: string
  categories: BudgetCategory[]
  totalEstimate: number
  currency?: string
  onAdjustBudget?: () => void
  onSaveToTrip?: () => void
}

function BudgetBar({ percentage }: { percentage: number }) {
  const bars = 10
  const filledBars = Math.round((percentage / 100) * bars)

  return (
    <div className="flex space-x-0.5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-2 rounded-sm ${
            i < filledBars ? 'bg-primary-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

export function BudgetBreakdownCard({
  title,
  categories,
  totalEstimate,
  currency = 'USD',
  onAdjustBudget,
  onSaveToTrip,
}: BudgetBreakdownCardProps) {
  const currencySymbol = currency === 'USD' ? '$' : currency

  // Calculate percentages if not provided
  const categoriesWithPercentage = categories.map((cat) => ({
    ...cat,
    percentage: cat.percentage ?? Math.round((cat.amount / totalEstimate) * 100),
  }))

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center">
          <span className="text-lg mr-2">&#x1F4B0;</span>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 space-y-3">
        {categoriesWithPercentage.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-base">{category.icon}</span>
              <span className="text-sm text-gray-700">{category.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <BudgetBar percentage={category.percentage} />
              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                {currencySymbol}{category.amount.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-base mr-2">&#x1F4CA;</span>
            <span className="font-medium text-gray-900">Total Estimate:</span>
          </div>
          <span className="text-lg font-bold text-primary-600">
            {currencySymbol}{totalEstimate.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      {(onAdjustBudget || onSaveToTrip) && (
        <div className="px-4 py-3 border-t border-gray-100 flex space-x-2">
          {onAdjustBudget && (
            <button
              onClick={onAdjustBudget}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Adjust Budget
            </button>
          )}
          {onSaveToTrip && (
            <button
              onClick={onSaveToTrip}
              className="flex-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Save to Trip
            </button>
          )}
        </div>
      )}
    </div>
  )
}
