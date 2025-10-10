"use client"

interface ErrorAlertProps {
    errorMessage: string
}

export default function ErrorAlert ({errorMessage} : ErrorAlertProps) {
    return (
        <div className='mt-4 py-2 w-full text-center text-sm rounded bg-red-100 text-red-700'>
            {errorMessage}
        </div>
    )
}