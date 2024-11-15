export type GameState = {
  player1: { dice: [number, number]; hasRolled: boolean; chips: number };
  player2: { dice: [number, number]; hasRolled: boolean; chips: number };
  currentBet: number;
  lastBet: number;
  currentTurn: 1 | 2;
  lastStartingPlayer?: 1 | 2;
  status: "rolling" | "betting" | "complete";
  winner?: 1 | 2;
  lastAction?: string;
  smallBlind: number;
  bigBlind: number;
  blindsPaid: boolean;
  dealer: number;
};
export type PlayerAction = "call" | "fold" | "raise";
