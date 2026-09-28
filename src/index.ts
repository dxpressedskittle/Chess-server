import { Elysia, t } from 'elysia'
import { isLegalMove } from './legalMove';

type Piece = string | null
type Board = Piece[]
type Room = {
    code: number;
    client1: number;
    client2?: number;
    board: Board;
    clientTurn: 1 | 2

}
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

function findIndex(row: number, col: number) {
    const index = col * 8 + row
    return index
} // returns the row and col of a index on a specific board

function findPos(index: number) {
    const row = Math.floor(index / 8)
    const col = index % 8
    return { row, col }
}

const Server = new Elysia()
    .get("/", () => "Server is running!")
    .ws("/game", {
        body: t.Object({
            room: key,
            client: key,
            message: t.String(),
            data: t.String()
        }),

        message(ws, { room, client, message, data }) {
            console.log(message, data)
            if (!room || !client || !message || !data) return;

            const roomCode = room;
            const currentRoom = rooms.find(r => r.code === roomCode);
            if (!currentRoom) {
                ws.send({ error: `Room ${room} not found` })
                return
            }

            if (message === 'move') {
                console.log(`[Move Received] Room: ${room} | Client: ${client} | Move: ${data}`);
            }


            const isClient1 = client === currentRoom.client1;
            const isClient2 = client === currentRoom.client2;
            if ((currentRoom.clientTurn === 1 && !isClient1) || (currentRoom.clientTurn === 2 && !isClient2)) {
                ws.send({ error: "Not your turn" });
                return;
            }


            switch (message) {
                case "move": {
                    // Example data format: "bkh3h4"
                    const move = data;
                    const color = String(move[0])
                    const piece = String(move[1]);

                    const startRow = parseInt(move[2]!);
                    const startCol = parseInt(move[3]!);
                    const targetRow = parseInt(move[4]!);
                    const targetCol = parseInt(move[5]!);

                    const startIndex = findIndex(startRow, startCol);
                    const targetIndex = findIndex(targetRow, targetCol);

                    if (isLegalMove(piece, startIndex, targetIndex, currentRoom.board)) {
                        console.log("Move is legal");
                    } else {
                        console.log("Illegal move attempted");
                    }
                    break;
                }
                default:
                    console.log("Unknown message type:", message);
                    break;
            }
        },
        error({ error }) {
            console.error("WebSocket Error:", error);
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
    .listen(8080, ({ hostname="localhost", port=8080 }) => {
        console.log(`Backend running at: http://${hostname}:${port}`);
    });



