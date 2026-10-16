import { useEffect } from 'react'
import Icon from '../constants/Icons'
import './styles/ToastMessage.css'

interface ToastMessageProps {
    message: string
    onAfterToast: () => void
    isSuccess?: boolean
}

export default function ToastMessage({ message, onAfterToast, isSuccess = true }: ToastMessageProps) {
    useEffect(() => {
        if (!message) return

        const timeoutId = window.setTimeout(onAfterToast, 4000)

        return () => window.clearTimeout(timeoutId)
    }, [message, onAfterToast])

    return (
        message && (
            <div className={`toast ${isSuccess ? 'toast-success' : 'toast-error'}`} role='status' aria-live='polite'>
                {isSuccess ? (
                    <Icon icon='checkmark' size={19} color='none' viewbox='0 0 20 20' className='toast-message-icon' />
                ) : (
                    <Icon icon='x' size={19} color='currentColor' viewbox='0 0 20 20' className='toast-message-icon' />
                )}
                <span>{message}</span>
            </div>
        )
    )
}

