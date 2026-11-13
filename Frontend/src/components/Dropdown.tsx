import { useEffect, useRef, useState, type ReactElement } from 'react';
import './styles/Dropdown.css';

interface DropdownProps<T extends { id: number }> {
	getOptionLabel: (option: T | null) => string | null;
	getMmsiLabel?: (option: T | null) => string | null;
	label: string;
	options: readonly T[];
	selectedOption: T | null;
	onChange: (option: T) => void;
	onAdd: () => void;
}

export default function Dropdown<T extends { id: number }>({
	getOptionLabel,
	getMmsiLabel,
	label,
	options,
	selectedOption,
	onChange,
	onAdd,
}: DropdownProps<T>): ReactElement {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const closeOnOutsideClick = (e: PointerEvent) => {
			if (!dropdownRef.current?.contains(e.target as Node)) setIsOpen(false);
		};
		const closeOnEscape = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			setIsOpen(false);
			triggerRef.current?.focus();
		};

		document.addEventListener('pointerdown', closeOnOutsideClick);
		document.addEventListener('keydown', closeOnEscape);

		return () => {
			document.removeEventListener('pointerdown', closeOnOutsideClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	}, [isOpen]);

	const selectOption = (nextValue: T) => {
		onChange(nextValue);
		setIsOpen(false);
		triggerRef.current?.focus();
	};

	return (
		<div className='dropdown__control' ref={dropdownRef}>
			<button
				aria-expanded={isOpen}
				aria-haspopup='menu'
				aria-label={`${label}: ${(getOptionLabel(selectedOption) ?? 'Valitse', label)}`}
				className='dropdown__trigger dropdown__trigger--select'
				onClick={() => setIsOpen((open) => !open)}
				ref={triggerRef}
				type='button'
			>
				<span className='dropdown__value'>{getOptionLabel(selectedOption) ?? `Valitse ${label}`}</span>
				<span className='dropdown__chevron' aria-hidden='true' />
			</button>
			{isOpen && (
				<div className='dropdown__menu dropdown__menu--select' role='menu'>
					<button className='dropdown__add-action' onClick={onAdd} role='menuitem' type='button'>
						<span className='dropdown__add-icon' aria-hidden='true'>
							+
						</span>
						<span>Lisää {label}</span>
					</button>
					{options.map((option) => {
						const mmsiLabel = getMmsiLabel?.(option);

						return (
							<button
								aria-checked={selectedOption?.id === option.id}
								className={`dropdown__option${selectedOption?.id === option.id ? ' dropdown__option--selected' : ''}`}
								key={option.id}
								onClick={() => selectOption(option)}
								role='menuitemradio'
								type='button'
							>
								<span className='dropdown__option-main'>
									<span>{getOptionLabel(option)}</span>
									{mmsiLabel && <span className='dropdown__option-meta'>{mmsiLabel}</span>}
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
