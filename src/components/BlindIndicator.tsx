import { GameState } from "../types/game";

interface BlindIndicatorProps {
  gameState: GameState;
}

export function BlindIndicator({ gameState }: BlindIndicatorProps) {
  return (
    <div className="blind-positions">
      <div>
        Player {gameState.dealer === 1 ? 1 : 2} is BB (${gameState.bigBlind})
      </div>
      <div>
        Player {gameState.dealer === 1 ? 2 : 1} is SB (${gameState.smallBlind})
      </div>
    </div>
  );
}
