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

  console.log("PlayerArea render:", {
    isPlayer1,
    playerData,
    bonusDie: playerData.bonusDie,
  });

  return (
    <div className={`player-area ${isOpponent ? "opponent" : "player"}`}>
      <div className="player-info">
        <div className="chip-count">Chips: ${playerData.chips}</div>
        <div className="dice-area">
          <DiceDisplay
            dice={playerData.dice}
            isOpponent={isOpponent}
            showdown={gameState.status === "complete"}
            bonusDie={playerData.bonusDie}
          />
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
            <div className="bet-input-group">
              <input
                type="number"
                value={betInput}
                onChange={(e) => onBetInputChange?.(Number(e.target.value))}
                min={gameState.currentBet + 1}
                className="bet-input"
                placeholder="Amount"
              />
              <button
                onClick={() => onAction?.("raise", betInput)}
                className="action-button raise"
                disabled={!betInput || betInput <= gameState.currentBet}
              >
                Raise to
              </button>
            </div>
            <div className="action-buttons">
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
                {gameState.currentBet === gameState.lastBet
                  ? "Check"
                  : `Call ${gameState.currentBet - gameState.lastBet}`}
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

interface MainMenuProps {
  onStartGame: () => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div className="main-menu">
      <h1>Dice Poker</h1>
      <button onClick={onStartGame} className="start-button">
        Start Game
      </button>
    </div>
  );
}
