import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Destination } from '../types/destination'
import { fetchDestinations } from '../services/api'
import { updateSettings } from '../services/auth'
import { useAuth } from './AuthContext'

interface DestinationContextValue {
    populateDestinations: () => Promise<void>
    destinations: Destination[]
    defaultDestination: Destination | null
    setDefaultDestination: (id: number) => Promise<void>
    destinationFetchError: string
}

const DestinationsContext = createContext<DestinationContextValue | undefined>(undefined)

export function DestinationProvider({ children }: { children: ReactNode }) {
    const [destinations, setDestinations] = useState<Destination[]>([])
    const [destinationFetchError, setDestinationFetchError] = useState('')

    const { user, refreshUser } = useAuth()

    const defaultDestination = destinations.find(d => d.id === user?.default_destination_id) ?? null

    const populateDestinations = async () => {
        setDestinationFetchError('')

        try {
            let destinationData = await fetchDestinations()
            destinationData = destinationData.sort((a, b) => {
                return a.destination_name.localeCompare(b.destination_name, 'fi')
            })

            setDestinations(destinationData)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'

            setDestinationFetchError(message)
            throw error
        }
    }

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
        populateDestinations()
    }, [])

    return (
        <DestinationsContext.Provider value={{ populateDestinations, destinations, defaultDestination, setDefaultDestination, destinationFetchError }}>
            {children}
        </DestinationsContext.Provider>
    )
}

export function useDestinations() {
    const context = useContext(DestinationsContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}