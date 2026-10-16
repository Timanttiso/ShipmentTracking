import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type Destination from '../types/destination'
import { fetchDestinations } from '../services/api'
import { updateSettings } from '../services/auth'
import { DestinationsContext } from './useDestinations'
import useAuth from './useAuth'

export function DestinationProvider({ children }: { children: ReactNode }) {
    const [destinations, setDestinations] = useState<Destination[]>([])
    const [destinationFetchError, setDestinationFetchError] = useState('')

    const { user, refreshUser } = useAuth()

    const defaultDestination = destinations.find(d => d.id === user?.default_destination_id) ?? null

    const populateDestinations = useCallback(async () => {
        try {
            let destinationData = await fetchDestinations()
            destinationData = destinationData.sort((a, b) => {
                return a.destination_name.localeCompare(b.destination_name, 'fi')
            })

            setDestinations(destinationData)
            setDestinationFetchError('')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'

            setDestinationFetchError(message)
            throw error
        }
    }, [])

    const setDefaultDestination = async (id: number) => {
        setDestinationFetchError('')

        try {
            await updateSettings({ default_destination_id: id })
            await refreshUser()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'

            setDestinationFetchError(message)
            throw error
        }
    }

    useEffect(() => {
        void Promise.resolve().then(populateDestinations)
    }, [populateDestinations])

    return (
        <DestinationsContext.Provider value={{ populateDestinations, destinations, defaultDestination, setDefaultDestination, destinationFetchError }}>
            {children}
        </DestinationsContext.Provider>
    )
}