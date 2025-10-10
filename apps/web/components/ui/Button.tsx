"use client";

interface ButtonProps {
  label : string
  onClick : () => void,
  className : string
}

export default function Button ({ label, onClick, className }: ButtonProps) {
  return (
     <div onClick={onClick} className={`w-full text-center bg-black text-white font-medium py-2 rounded-md my-4 hover:bg-[#0b0b0b] ${className}`}>
      {label}
    </div>
  );
};
