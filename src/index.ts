import { Elysia, t } from 'elysia'
import { isLegalMove } from './legalMove';

const defaultBoard: Board = [
  "br",
  "bn",
  "bb",
  "bq",
  "bk",
  "bb",
  "bn",
  "br",
  "bp",
  "bp",
  "bp",
  "bp",
  "bp",
  "bp",
  "bp",
  "bp",
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  "wp",
  "wp",
  "wp",
  "wp",
  "wp",
  "wp",
  "wp",
  "wp",
  "wr",
  "wn",
  "wb",
  "wq",
  "wk",
  "wb",
  "wn",
  "wr",
];


const boards: Board[] = [] 

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
            let roomCode
            const room = rooms.find(r => r.code === roomCode);
                switch (message) {
                    case "move": {
                        // Move data format bkh3/wkb2 - black king to h,3/ white knight to b,2
                        const move = data 
                        const row = parseInt(data[3]!) 
                        const col = parseInt(data[2]!)
                        const targetIndex = (col * 8) + row
                        
                        
                    }
                }
            }
        }
    })

    .post("/room", () => {
        const roomCode = randomInt()
        const clientKey = randomInt()

        const payload: Room = {
            code: roomCode,
            client1: clientKey,
            board: defaultBoard,
            clientTurn: 1
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



