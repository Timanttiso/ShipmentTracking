import { useEffect } from 'react'
import './styles/ToastMessage.css'

type ToastMessageProps = {
    message: string
    onAfterToast: () => void
    isSuccess?: boolean
}

export default function ToastMessage({ message, onAfterToast, isSuccess = true }: ToastMessageProps) {
    useEffect(() => {
        if (!message) return

        const timeoutId = window.setTimeout(onAfterToast, 4000)

        return () => window.clearTimeout(timeoutId)
    }, [message])

    return (
        message && (
            <div className={`toast ${isSuccess ? 'toast-success' : 'toast-error'}`} role='status' aria-live='polite'>
                {isSuccess ? (
                    <svg aria-hidden='true' viewBox='0 0 20 20' fill='none'>
                        <path d='m4.5 10.2 3.4 3.4 7.6-7.7' />
                    </svg>
                ) : (
                    <svg aria-hidden='true' viewBox='0 0 20 20' fill='currentColor'>
                        <path d='M4.4 4.4L10 10l5.6-5.6 1.2 1.2L11.2 11.2l5.6 5.6-1.2 1.2L10 12.4 4.4 18l-1.2-1.2 5.6-5.6-5.6-5.6z' />
                    </svg>
                )}
                <span>{message}</span>
            </div>
        )
    )
}

