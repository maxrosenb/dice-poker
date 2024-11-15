interface DiceDisplayProps {
  dice: number[];
  isOpponent?: boolean;
  showdown?: boolean;
  bonusDie?: number;
}

export function DiceDisplay({
  dice,
  isOpponent = false,
  showdown = false,
  bonusDie,
}: DiceDisplayProps) {
  console.log("DiceDisplay render:", {
    dice,
    isOpponent,
    showdown,
    bonusDie,
  });

  return (
    <div className="dice-display">
      {dice.map((value, index) => (
        <div
          key={index}
          className={`die ${isOpponent && !showdown ? "hidden" : ""}`}
        >
          {!isOpponent || showdown ? (
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
      {bonusDie !== undefined && (
        <div className={`die bonus ${isOpponent && !showdown ? "hidden" : ""}`}>
          {!isOpponent || showdown ? (
            <>
              {bonusDie === 1 && <div className="dot center" />}
              {bonusDie === 2 && (
                <>
                  <div className="dot top-left" />
                  <div className="dot bottom-right" />
                </>
              )}
              {bonusDie === 3 && (
                <>
                  <div className="dot top-left" />
                  <div className="dot center" />
                  <div className="dot bottom-right" />
                </>
              )}
              {bonusDie === 4 && (
                <>
                  <div className="dot top-left" />
                  <div className="dot top-right" />
                  <div className="dot bottom-left" />
                  <div className="dot bottom-right" />
                </>
              )}
            </>
          ) : (
            <div className="question-mark">?</div>
          )}
        </div>
      )}
    </div>
  );
}
