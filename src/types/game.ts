export interface GameState {
  player1: {
    chips: number;
    dice: number[];
    hasRolled: boolean;
    bonusDie?: number;
  };
  player2: {
    chips: number;
    dice: number[];
    hasRolled: boolean;
    bonusDie?: number;
  };
  currentBet: number;
  lastBet: number;
  currentTurn: number;
  status: "rolling" | "betting" | "complete";
  dealer: number;
  smallBlind: number;
  bigBlind: number;
  blindsPaid: boolean;
  lastStartingPlayer: number;
  winner?: number;
  lastAction?: string;
}
export type PlayerAction = "call" | "fold" | "raise";
