import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { html } from '@elysiajs/html'
import { isLegalMove } from './legalMove';

type Piece = string | null
type Board = Piece[]

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
    const index = row * 8 + col
    return index
} // returns the row and col of a index on a specific board

function findPos(index: number) {
    const row = Math.floor(index / 8)
    const col = index % 8
    return { row, col }
}

const Server = new Elysia()
    .use(cors({
        origin: "http://localhost:3000",
        credentials: false,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"]
    }))

    .use(html())

    .get("/rooms", () => {
        return rooms.map(room => `
      <div> 
        ----------------------<br>
        Room ID: ${room.code}<br>
        Client 1: ${room.client1}<br>
        Client 2: ${room.client2 || 'None'}<br>
        Client turn: ${room.clientTurn}
      </div> 
    `).join(""); // maybe try further info on matches + players for server
    })

    .get("/debug/rooms", ({ set }) => {
        if (Bun.env.NODE_ENV === "production") {
            set.status = 404
            return { error: "Not found" }
        }

        const snapshot = rooms.map(room => ({
            code: room.code,
            board: [...room.board],
            clientTurn: room.clientTurn,
            playersJoined: {
                client1: true,
                client2: Boolean(room.client2)
            }
        }))

        console.log("[Debug Rooms]", snapshot)
        return snapshot
    })
    .ws("/game", {
        body: t.Object({
            room: key,
            client: key,
            message: t.String(),
            data: t.String()
        }),

        message(ws, { room, client, message, data }) {
            console.log("[Client -> Server]", { room, client, message, data })
            if (!room || !client || !message || !data) return;

            const roomCode = room;
            const currentRoom = rooms.find(r => r.code === roomCode);
            console.log(room)
            if (!currentRoom) {
                const response = { error: `Room ${room} not found` }
                ws.send(response)
                return
            }

            if (message === 'move') {
                console.log(`[Move Received] Room: ${room} | Client: ${client} | Move: ${data}`);
            }



            switch (message) {
                case "move": {


                    const isClient1 = client === currentRoom.client1;
                    const isClient2 = client === currentRoom.client2;
                    console.log(client, currentRoom.client1)
                    console.log(isClient1, currentRoom.clientTurn)
                    if ((currentRoom.clientTurn === 1 && !isClient1)) { // fix
                        const response = { error: "Not your turn" };
                        ws.send(JSON.stringify(response));
                        return;
                    }
                    const move = data;
                    if (!/^[wb][prnbqk][0-7]{4}$/.test(move)) {
                        const response = { error: `Invalid move format: ${move}` }
                        console.log("[Server -> Client]", response)
                        ws.send(response)
                        return
                    }

                    const piece = move.slice(0, 2)

                    const startRow = Number(move[2]);
                    const startCol = Number(move[3]);
                    const targetRow = Number(move[4]);
                    const targetCol = Number(move[5]);

                    const startIndex = findIndex(startRow, startCol);
                    const targetIndex = findIndex(targetRow, targetCol);
                    const legal = isLegalMove(piece, startIndex, targetIndex, currentRoom.board) === true;

                    console.log(`[Move Validation] ${piece} ${startRow},${startCol} -> ${targetRow},${targetCol}: ${legal}`);
                    const response = { legal }
                    console.log("[Server -> Client]", response)
                    if (legal) {
                        currentRoom.board[startIndex] = null
                        currentRoom.board[targetIndex] = piece
                    }
                    ws.send(response)
                    break;
                }
                case "reqBoard": { // no need to check room
                    const response = { type: "board", data: currentRoom.board };
                    ws.send(JSON.stringify(response));
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
            board: [...defaultBoard],
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
    .listen(Number(Bun.env.PORT ?? 8080), ({ hostname = "localhost", port = 8080 }) => {
        console.log(`Backend running at: http://${hostname}:${port}`);
    });



