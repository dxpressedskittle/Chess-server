type Board = (string | null)[]

interface Room {
    code: number,
    client1: number,
    client2?: number,
    board: Board,
    clientTurn: 1 | 2

}