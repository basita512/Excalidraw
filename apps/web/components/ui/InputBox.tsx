"use client";

interface InputBoxProps {
    label : string,
    placeholder : string,
    onChange : (e: React.ChangeEvent<HTMLInputElement>) => void,
    value : string,
    type : string
    name : string
}

export default function InputBox ({label, placeholder, onChange, value, name, type} : InputBoxProps) {
  return (
    <div className='w-full mt-4'>

      <div className="text-black font-medium">
        {label}
      </div>

      <input 
        onChange={onChange}
        placeholder={placeholder}
        value={value}
        name={name}
        type={type}
        className=' w-full outline-none focus:border-[#4a9a74f6] border-2 rounded-md border-gray-300 placeholder-gray-500 py-2 px-3 mt-1' />
    </div>
  )
}