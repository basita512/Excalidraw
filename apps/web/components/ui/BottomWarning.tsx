"use client";

interface BottomWarningProps {
    label : string,
    bottomText : string
    to : string
}

export default function BottomWarning ({label, bottomText, to} : BottomWarningProps) {
  return (
    <div className='flex text-sm justify-center pb-3 font-medium'>
      <div>
        {label}
      </div>
      
      <a href={to} className='pointer underline pl-1 cursor-pointer' >
        {bottomText}
      </a>
    </div>
  )
}