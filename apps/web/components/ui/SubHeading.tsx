"use client";

interface SubHeadingProps {
    label : string
}

export default function SubHeading ({label} : SubHeadingProps) {
  return (
    <div className='text-gray-600 text-center font-medium my-3'>
      {label}
    </div>
  )
}
