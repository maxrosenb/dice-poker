interface DiceDisplayProps {
  dice: number[];
  isOpponent?: boolean;
}

export function DiceDisplay({ dice, isOpponent = false }: DiceDisplayProps) {
  return (
    <div className="dice-display">
      {dice.map((value, index) => (
        <div key={index} className={`die ${isOpponent ? "hidden" : ""}`}>
          {!isOpponent ? (
            <>
              {value === 1 && <div className="dot center" />}
              {value === 2 && (
                <>
                  <div className="dot top-left" />
                  <div className="dot bottom-right" />
                </>
              )}
              {value === 3 && (
                <>
                  <div className="dot top-left" />
                  <div className="dot center" />
                  <div className="dot bottom-right" />
                </>
              )}
              {value === 4 && (
                <>
                  <div className="dot top-left" />
                  <div className="dot top-right" />
                  <div className="dot bottom-left" />
                  <div className="dot bottom-right" />
                </>
              )}
              {value === 5 && (
                <>
                  <div className="dot top-left" />
                  <div className="dot top-right" />
                  <div className="dot center" />
                  <div className="dot bottom-left" />
                  <div className="dot bottom-right" />
                </>
              )}
              {value === 6 && (
                <>
                  <div className="dot top-left" />
                  <div className="dot top-right" />
                  <div className="dot middle-left" />
                  <div className="dot middle-right" />
                  <div className="dot bottom-left" />
                  <div className="dot bottom-right" />
                </>
              )}
            </>
          ) : (
            <div className="question-mark">?</div>
          )}
        </div>
      ))}
    </div>
  );
}
