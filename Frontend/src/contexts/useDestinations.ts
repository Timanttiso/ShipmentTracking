import { createContext, useContext } from 'react'
import type Destination from '../types/destination'

interface DestinationContextValue {
    populateDestinations: () => Promise<void>
    destinations: Destination[]
    defaultDestination: Destination | null
    setDefaultDestination: (id: number) => Promise<void>
    destinationFetchError: string
}

export const DestinationsContext = createContext<DestinationContextValue | undefined>(undefined)

export default function useDestinations() {
    const context = useContext(DestinationsContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}