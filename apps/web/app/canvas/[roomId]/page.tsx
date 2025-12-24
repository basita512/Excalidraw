// Server component (async doesnt works in client components)

import RoomCanvas from "components/RoomCanvas"


export default async function CanvasPage({ params }: {
    params: Promise<{
        roomId: string
    }>
}) {
    const roomId = (await params).roomId
    console.log(`Room id : ${roomId}`)

    return (
        <div className="">
            <RoomCanvas roomId={Number(roomId)} />
        </div>
    )
}