import { ReactNode } from "react"

interface DrawingIconProps {
    icon : ReactNode,
    onClick: () => void,
    activated: boolean
}

export default function DrawingIcon({ icon, onClick, activated } : DrawingIconProps) {
    return(
        <button onClick={onClick} className={`bg-black hover:bg-[#706f6f] duration-500 text-white p-2 rounded-full ${activated ? "ring-2 ring-green-400" : "" }`}>
            {icon}
        </button>
    )
}