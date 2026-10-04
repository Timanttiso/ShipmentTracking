import { useEffect, useRef, useState, type ReactElement } from 'react'
import './SortDropdown.css'

type SortDropdownOption<Value extends string> = {
    value: Value
    label: string
}

export type SortDirection = 'asc' | 'desc'

type SortDropdownProps<Value extends string> = {
    options: readonly SortDropdownOption<Value>[]
    value: Value
    onChange: (value: Value) => void
    direction: SortDirection
    onDirectionChange: (direction: SortDirection) => void
}

export default function SortDropdown<Value extends string>({
    options,
    value,
    onChange,
    direction,
    onDirectionChange
}: SortDropdownProps<Value>): ReactElement {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const selectedOption = options.find((option) => option.value === value)

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

    const selectOption = (nextValue: Value) => {
        onChange(nextValue)
        setIsOpen(false)
        triggerRef.current?.focus()
    }

    return (
        <div className='shipment-sort'>
            <span className='shipment-sort__label'>Järjestä</span>
            <div className='shipment-sort__dropdown' ref={dropdownRef}>
                <button
                    aria-expanded={isOpen}
                    aria-haspopup='menu'
                    aria-label={`Järjestä: ${selectedOption?.label ?? value}`}
                    className='shipment-sort__trigger'
                    onClick={() => setIsOpen((open) => !open)}
                    ref={triggerRef}
                    type='button'
                >
                    {selectedOption?.label ?? value}
                    <span className='shipment-sort__chevron' aria-hidden='true' />
                </button>
                {isOpen && (
                    <div className='shipment-sort__menu' role='menu'>
                        {options.map((option) => (
                            <button
                                aria-checked={value === option.value}
                                className={`shipment-sort__option${value === option.value ? ' shipment-sort__option--selected' : ''}`}
                                key={option.value}
                                onClick={() => selectOption(option.value)}
                                role='menuitemradio'
                                type='button'
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button
                aria-label={`Järjestys: ${direction === 'asc' ? 'nouseva' : 'laskeva'}. Vaihda ${direction === 'asc' ? 'laskevaan' : 'nousevaan'} järjestykseen`}
                className='shipment-sort-direction'
                onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
                title={direction === 'asc' ? 'Nouseva järjestys' : 'Laskeva järjestys'}
                type='button'
            >
                <span aria-hidden='true'>{direction === 'asc' ? '↑' : '↓'}</span>
            </button>
        </div>
    )
}