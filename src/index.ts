import { Elysia, t } from 'elysia'

interface Room {
    code: number,
    client1: number,
    client2?: number
}

const rooms: Room[] = [];
const key = t.Number({ minimum: 10000, maximum: 100000 })

function randomInt(): number {
    return Math.floor(Math.random() * 90000) + 10000;
}

const Server = new Elysia()
    .ws("/game", {
        body: t.Object({
            room: key,
            client: key,
            message: t.String(),
            data: t.String()
        }),

        message(ws, { room, client, message, data }) {
            if (room && client) {
                const room = rooms.find(room => room.code === room)
                switch (message) {
                    case "move": {
                        
                    }
                }
            }
        }
    })

    .post("/room", () => {
        const roomCode = randomInt()
        const clientKey = randomInt()

        const payload = {
            code: roomCode,
            client1: clientKey
        }
        rooms.push(payload)
        return payload
    })

    .post("/join", ({ body }) => {
        const room = rooms.find(room => room.code === body)
        if (room && !room.client2) {
            const clientKey = randomInt()
            room.client2 = clientKey
            return clientKey
        }
    }, {
        body: key
    })
    .listen(3000)



