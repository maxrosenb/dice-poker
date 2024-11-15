import { GameState } from "../types/game";
import { DiceDisplay } from "./DiceDisplay";

interface PlayerAreaProps {
  isPlayer1: boolean;
  gameState: GameState;
  isOpponent?: boolean;
  onRoll?: () => void;
  onAction?: (action: "call" | "fold" | "raise", raiseAmount?: number) => void;
  betInput?: number;
  onBetInputChange?: (value: number) => void;
}

export function PlayerArea({
  isPlayer1,
  gameState,
  isOpponent = false,
  onRoll,
  onAction,
  betInput,
  onBetInputChange,
}: PlayerAreaProps) {
  const playerNumber = isPlayer1 ? 1 : 2;
  const playerData = isPlayer1 ? gameState.player1 : gameState.player2;

  return (
    <div className={`player-area ${isOpponent ? "opponent" : "player"}`}>
      <div className="player-info">
        <div className="chip-count">Chips: ${playerData.chips}</div>
        <div className="dice-area">
          <DiceDisplay dice={playerData.dice} isOpponent={isOpponent} />
        </div>
      </div>

      {!isOpponent &&
        !playerData.hasRolled &&
        gameState.status === "rolling" && (
          <button onClick={onRoll} className="roll-button">
            Roll Dice
          </button>
        )}

      {!isOpponent &&
        gameState.status === "betting" &&
        gameState.currentTurn === playerNumber && (
          <div className="betting-controls">
            <button
              onClick={() => onAction?.("fold")}
              className="action-button fold"
            >
              Fold
            </button>
            <button
              onClick={() => onAction?.("call")}
              className="action-button call"
            >
              {gameState.currentBet === 0
                ? "Check"
                : `Call ${gameState.currentBet - gameState.lastBet}`}
            </button>
            <div className="raise-controls">
              <input
                type="number"
                value={betInput}
                onChange={(e) => onBetInputChange?.(Number(e.target.value))}
                min={gameState.currentBet + 1}
                step={1}
              />
              <button
                onClick={() => onAction?.("raise", betInput)}
                className="action-button raise"
                disabled={betInput <= gameState.currentBet}
              >
                Raise to
              </button>
            </div>
          </div>
        )}

      {gameState.status === "complete" && gameState.winner === playerNumber && (
        <div className="winner-label">Winner!</div>
      )}
    </div>
  );
}
