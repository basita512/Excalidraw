import { Circle, Pencil, RectangleHorizontalIcon, Slash } from "lucide-react";
import DrawingIcon from "./ui/DrawingIcon";
import { Tool } from "./Canvas";

export default function TopBar ({selectedTool, setSelectedTool} : {
    selectedTool : Tool,
    setSelectedTool : (s: Tool) => void
}) {
    return(
        <div className="flex gap-2">
            <DrawingIcon 
                activated={selectedTool === 'line'}
                icon={<Slash/>}
                onClick={() => setSelectedTool('line')}  
            />
            <DrawingIcon 
                activated={selectedTool === 'pencil'}
                icon={<Pencil/>}
                onClick={() => setSelectedTool('pencil')}  
            />
            <DrawingIcon 
                activated={selectedTool === 'rect'}
                icon={<RectangleHorizontalIcon/>} 
                onClick={() => setSelectedTool('rect')} 
            />
            <DrawingIcon 
                activated={selectedTool === 'circle'}
                icon={<Circle/>} 
                onClick={() => setSelectedTool('circle')} 
            />
        </div>
       
    )
}