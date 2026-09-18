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

function findIndex(row: number, col: number) {
    const index = col * 8 + row
    return index
} // returns the row and col of a index on a specific board

function findPos(index: number) {
    const row = Math.floor(index / 8)
    const col = index % 8
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
            if (!room || !client || !message || !data) return;

            const roomCode = room.code;
            const currentRoom = rooms.find(r => r.code === roomCode);
            if (!currentRoom) return;
            switch (message) {
                case "move": {
                    // Example data format: "bkh3h4"
                    const move = data;
                    const piece = String(move[1]);

                    // Parse grid coordinates (Ensure indices match your data string)
                    const startRow = parseInt(move[2]!);
                    const startCol = parseInt(move[3]!);
                    const targetRow = parseInt(move[4]!);
                    const targetCol = parseInt(move[5]!);

                    // Calculate matching board indices
                    const startIndex = findIndex(startRow, startCol);
                    const targetIndex = findIndex(targetRow, targetCol); // Fixed reversed parameters

                    // Validate move legality against the room's board state
                    if (isLegalMove(piece, startIndex, targetIndex, currentRoom.board)) {
                        console.log("Move is legal");
                        // Insert code here to update currentRoom.board and broadcast the move
                    } else {
                        console.log("Illegal move attempted");
                    }
                    break;
                }
                default:
                    console.log("Unknown message type:", message);
                    break;
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



