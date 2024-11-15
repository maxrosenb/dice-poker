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
