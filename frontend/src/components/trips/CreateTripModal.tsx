'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTripStore } from '@/stores/tripStore'

interface CreateTripModalProps {
  onClose: () => void
}

export function CreateTripModal({ onClose }: CreateTripModalProps) {
  const { createTrip, isLoading } = useTripStore()
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    start_date: '',
    end_date: '',
    travelers: 1,
    budget: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trip = await createTrip({
      name: formData.name,
      destination: formData.destination || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      travelers: formData.travelers,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
    })

    if (trip) {
      onClose()
    }
  }

  return (
    <Modal title="Create New Trip" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Trip Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Summer vacation to Italy"
        />

        <Input
          id="destination"
          label="Destination"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          placeholder="e.g., Rome, Italy"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="start_date"
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
          <Input
            id="end_date"
            label="End Date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="travelers"
            label="Number of Travelers"
            type="number"
            min={1}
            value={formData.travelers}
            onChange={(e) =>
              setFormData({ ...formData, travelers: parseInt(e.target.value) || 1 })
            }
          />
          <Input
            id="budget"
            label="Budget (USD)"
            type="number"
            min={0}
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="e.g., 2000"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formData.name || isLoading}>
            {isLoading ? 'Creating...' : 'Create Trip'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
