import type Destination from '../types/destination'
import { useEffect, useRef, useState, type ReactElement } from 'react'
import './styles/DestinationDropdown.css'

interface DestinationDropdownProps {
    options: readonly Destination[]
    selectedOption: Destination | null
    onChange: (value: Destination) => void
    onOpenManager: () => void
}

export default function DestinationDropdown({ options, selectedOption, onChange, onOpenManager }: DestinationDropdownProps): ReactElement {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!isOpen) return

        const closeOnOutsideClick = (e: PointerEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node)) setIsOpen(false)
        }
        const closeOnEscape = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return
            setIsOpen(false)
            triggerRef.current?.focus()
        }

        document.addEventListener('pointerdown', closeOnOutsideClick)
        document.addEventListener('keydown', closeOnEscape)

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick)
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [isOpen])

    const selectOption = (nextValue: Destination) => {
        onChange(nextValue)
        setIsOpen(false)
        triggerRef.current?.focus()
    }

    return (
        <div className='destination-dropdown'>
            <div className='destination-dropdown__control' ref={dropdownRef}>
                <button
                    aria-expanded={isOpen}
                    aria-haspopup='menu'
                    aria-label={`Määränpää: ${selectedOption?.destination_name ?? 'Valitse määränpää'}`}
                    className='dropdown__trigger destination-dropdown__trigger'
                    onClick={() => setIsOpen((open) => !open)}
                    ref={triggerRef}
                    type='button'
                >
                    <span className='destination-dropdown__value'>
                        {selectedOption?.destination_name ?? 'Valitse määränpää'}
                    </span>
                    <span className='dropdown__chevron' aria-hidden='true' />
                </button>
                {isOpen && (
                    <div className='dropdown__menu destination-dropdown__menu' role='menu'>
                        <button
                            className='destination-dropdown__add-action'
                            onClick={onOpenManager}
                            role='menuitem'
                            type='button'
                        >
                            <span className='destination-dropdown__add-icon' aria-hidden='true'>+</span>
                            <span>Lisää määränpää</span>
                        </button>
                        {options.map((option) => (
                            <button
                                aria-checked={selectedOption?.destination_name === option.destination_name}
                                className={`dropdown__option destination-dropdown__option${selectedOption?.id === option.id ? ' dropdown__option--selected' : ''}`}
                                key={option.id}
                                onClick={() => selectOption(option)}
                                role='menuitemradio'
                                type='button'
                            >
                                {option.destination_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}