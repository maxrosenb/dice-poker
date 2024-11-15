import { useState, useEffect, useRef } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "./firebase";
import { ChipStack } from "./components/ChipStack";
import { GameState } from "./types/game";
import { PlayerArea } from "./components/PlayerArea";
import "./styles.css";
// import "./App.css";
// other imports below

function App() {
  const [gameId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("gameId") || crypto.randomUUID();
  });

  const determineIsPlayer1 = () => {
    const params = new URLSearchParams(window.location.search);
    return !params.get("gameId"); // First player if no gameId in URL
  };

  const isPlayer1 = determineIsPlayer1();

  const [gameState, setGameState] = useState<GameState>({
    player1: { dice: [0, 0], hasRolled: false, chips: 200 },
    player2: { dice: [0, 0], hasRolled: false, chips: 200 },
    currentBet: 0,
    lastBet: 0,
    currentTurn: 1,
    status: "rolling",
    smallBlind: 5,
    bigBlind: 10,
    blindsPaid: false,
    dealer: 1,
  });

  const [betInput, setBetInput] = useState<number>(0);

  useEffect(() => {
    const gameRef = ref(db, `games/${gameId}`);

    if (isPlayer1) {
      set(gameRef, gameState);
    }

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val() as GameState | null;
      if (data) {
        setGameState(data);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, isPlayer1]);

  // Add logging to handleBlinds
  const handleBlinds = (newGameState: GameState) => {
    if (
      !newGameState.blindsPaid &&
      newGameState.player1.hasRolled &&
      newGameState.player2.hasRolled
    ) {
      // Non-dealer posts small blind
      const smallBlindPlayer = newGameState.lastStartingPlayer === 1 ? 2 : 1;
      // Dealer posts big blind
      const bigBlindPlayer = newGameState.lastStartingPlayer;

      // Deduct small blind from non-dealer
      if (smallBlindPlayer === 1) {
        newGameState.player1.chips -= newGameState.smallBlind;
      } else {
        newGameState.player2.chips -= newGameState.smallBlind;
      }
      newGameState.currentBet = newGameState.smallBlind;
      newGameState.lastBet = newGameState.smallBlind;

      // Deduct big blind from dealer
      if (bigBlindPlayer === 1) {
        newGameState.player1.chips -= newGameState.bigBlind;
      } else {
        newGameState.player2.chips -= newGameState.bigBlind;
      }
      newGameState.currentBet = newGameState.bigBlind;
      newGameState.lastBet = newGameState.smallBlind;

      newGameState.blindsPaid = true;
    }
    return newGameState;
  };

  const rollDice = () => {
    playSound("roll");

    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const gameRef = ref(db, `games/${gameId}`);

    const playerKey = isPlayer1 ? "player1" : "player2";
    let newGameState = {
      ...gameState,
      [playerKey]: {
        ...gameState[playerKey],
        dice: [roll1, roll2],
        hasRolled: true,
      },
    };

    // Check if both players have rolled
    const bothPlayersRolled =
      (isPlayer1
        ? newGameState.player2.hasRolled
        : newGameState.player1.hasRolled) && newGameState[playerKey].hasRolled;

    if (bothPlayersRolled) {
      newGameState.status = "betting";
      // Handle blinds before setting current turn
      newGameState = handleBlinds(newGameState);
    }

    set(gameRef, newGameState);
  };

  const soundRefs = useRef({
    join: new Audio("/join-sound.mp3"), // Player 2 joins
    roll: new Audio("/roll-sound.mp3"), // Dice rolling
    win: new Audio("/win-sound.mp3"), // When you win
    lose: new Audio("/lose-sound.mp3"), // When you lose
    raise: new Audio("/raise-sound.mp3"), // Player raises
    fold: new Audio("/fold-sound.mp3"), // Player folds
  });

  const playSound = (soundName: keyof typeof soundRefs.current) => {
    soundRefs.current[soundName]
      .play()
      .catch((e) => console.log("Error playing sound:", e));
  };

  // Add logging to handleAction
  const handleAction = (
    action: "call" | "fold" | "raise",
    raiseAmount?: number
  ) => {
    const gameRef = ref(db, `games/${gameId}`);
    const playerNumber = isPlayer1 ? 1 : 2;
    const playerChips = isPlayer1
      ? gameState.player1.chips
      : gameState.player2.chips;

    console.log("Action attempted:", {
      action,
      playerNumber,
      currentTurn: gameState.currentTurn,
      gameState,
    });

    if (gameState.currentTurn !== playerNumber) {
      console.log("Not player's turn");
      alert("It's not your turn!");
      return;
    }

    const newGameState = { ...gameState };

    // Add the last action before updating game state
    const actionText =
      action === "raise"
        ? `raised to $${raiseAmount}`
        : action === "call"
        ? gameState.currentBet === 0
          ? "checked"
          : "called"
        : "folded";
    newGameState.lastAction = `Player ${playerNumber} ${actionText}`;

    // Play appropriate sound based on action
    if (action === "fold") {
      playSound("fold");
    } else if (action === "raise") {
      playSound("raise");
    }

    switch (action) {
      case "call":
        if (gameState.currentBet === 0) {
          // This is a check
          const isFirstActionOfRound =
            gameState.lastBet === 0 &&
            !gameState.lastAction?.includes("checked");
          // const isSecondPlayerChecking = playerNumber === 2;
          const isFirstPlayerChecking = playerNumber === 1;

          if (isFirstActionOfRound) {
            // First check of the round - give other player a chance
            newGameState.currentTurn = isFirstPlayerChecking ? 2 : 1;
            newGameState.lastAction = `Player ${playerNumber} checked`;
          } else {
            // This is a check-back, end the round
            newGameState.status = "complete";
            newGameState.winner = determineWinner(
              gameState.player1.dice,
              gameState.player2.dice
            );
          }
        } else {
          console.log("DETAILED CALL ACTION STATE:", {
            currentPlayer: playerNumber,
            currentBet: gameState.currentBet,
            lastBet: gameState.lastBet,
            dealer: gameState.dealer,
            blindsPaid: gameState.blindsPaid,
            lastAction: gameState.lastAction,
            currentTurn: gameState.currentTurn,
          });

          // Calculate how much more this player needs to call
          const alreadyBet = gameState.lastBet;
          const toCall = gameState.currentBet - alreadyBet;
          const callAmount = Math.min(playerChips, toCall);

          // Subtract the call amount from the player's chips
          if (isPlayer1) {
            newGameState.player1.chips -= callAmount;
          } else {
            newGameState.player2.chips -= callAmount;
          }

          // Simple check: if this is the first call to the big blind, give BB their option
          const isFirstCall =
            gameState.blindsPaid &&
            gameState.currentBet === gameState.bigBlind &&
            !gameState.lastAction;

          console.log("Call check:", {
            isFirstCall,
            blindsPaid: gameState.blindsPaid,
            currentBet: gameState.currentBet,
            bigBlind: gameState.bigBlind,
            lastAction: gameState.lastAction,
          });

          if (isFirstCall) {
            // Give the other player their option
            newGameState.currentTurn = isPlayer1 ? 2 : 1;
            newGameState.lastAction = `Player ${playerNumber} called`;
            newGameState.lastBet = gameState.currentBet;
            console.log("Giving option to other player");
          } else {
            // End the round
            console.log("Ending round");
            newGameState.status = "complete";
            newGameState.winner = determineWinner(
              gameState.player1.dice,
              gameState.player2.dice
            );

            if (newGameState.winner === 1) {
              newGameState.player1.chips += gameState.currentBet * 2;
            } else {
              newGameState.player2.chips += gameState.currentBet * 2;
            }
          }
        }
        break;

      case "raise": {
        if (!raiseAmount) return;

        // Calculate the additional amount needed to raise
        const currentPlayerBet = gameState.lastBet; // What they've already put in
        const totalToCall = gameState.currentBet - currentPlayerBet; // What they need to call
        const additionalRaise = raiseAmount - gameState.currentBet; // Extra for the raise
        const totalNeeded = totalToCall + additionalRaise; // Total chips needed

        // Validate raise amount
        const minRaise = gameState.currentBet + 1;
        if (raiseAmount < minRaise) {
          alert(`Raise must be at least ${minRaise}`);
          return;
        }

        // Check if player has enough chips
        if (totalNeeded > playerChips) {
          alert("You can't bet more than you have!");
          return;
        }

        // Subtract the total needed from the player's chips
        if (isPlayer1) {
          newGameState.player1.chips -= totalNeeded;
        } else {
          newGameState.player2.chips -= totalNeeded;
        }

        newGameState.currentBet = raiseAmount;
        newGameState.lastBet = gameState.currentBet; // Track last bet for minimum raise
        newGameState.currentTurn = isPlayer1 ? 2 : 1;

        break;
      }

      case "fold":
        newGameState.status = "complete";
        newGameState.winner = isPlayer1 ? 2 : 1;
        // No additional chips are taken from the folding player
        // The current pot (already deducted chips) goes to the winner
        if (isPlayer1) {
          // If player 1 folds, player 2 gets the current pot
          newGameState.player2.chips += gameState.currentBet;
        } else {
          // If player 2 folds, player 1 gets the current pot
          newGameState.player1.chips += gameState.currentBet;
        }
        break;
    }

    console.log("Setting new game state:", newGameState);
    set(gameRef, newGameState);
  };

  const playerData = isPlayer1 ? gameState.player1 : gameState.player2;
  const opponentData = isPlayer1 ? gameState.player2 : gameState.player1;

  const getShareableUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("gameId", gameId);
    return url.toString();
  };

  // Add this effect to handle automatic round reset
  useEffect(() => {
    if (gameState.status === "complete" && isPlayer1) {
      console.log("Starting reset timer...");

      const timer = setTimeout(() => {
        console.log("Executing reset...");
        const gameRef = ref(db, `games/${gameId}`);

        // Alternate the dealer position each hand
        const nextDealer = gameState.lastStartingPlayer === 1 ? 2 : 1;
        // Small blind is posted by non-dealer, so they act first
        const firstToAct = nextDealer === 1 ? 2 : 1;

        console.log("Next dealer:", nextDealer, "First to act:", firstToAct);

        const newGameState = {
          player1: {
            chips: gameState.player1.chips,
            dice: [0, 0],
            hasRolled: false,
          },
          player2: {
            chips: gameState.player2.chips,
            dice: [0, 0],
            hasRolled: false,
          },
          currentBet: 0,
          lastBet: 0,
          currentTurn: firstToAct, // Small blind acts first
          lastStartingPlayer: nextDealer, // Track dealer position
          dealer: nextDealer, // Explicitly track dealer
          status: "rolling",
          smallBlind: gameState.smallBlind,
          bigBlind: gameState.bigBlind,
          blindsPaid: false,
        };

        console.log("New game state:", newGameState);
        set(gameRef, newGameState);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [
    gameState.status,
    isPlayer1,
    gameId,
    gameState.player1.chips,
    gameState.player2.chips,
    gameState.lastStartingPlayer,
    gameState.smallBlind,
    gameState.bigBlind,
  ]);

  // Keep the countdown effect separate
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (gameState.status === "complete") {
      setCountdown(4);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCountdown(4);
    }
  }, [gameState.status]);

  // Add useEffect to set initial bet input when it's player's turn
  useEffect(() => {
    if (
      gameState.status === "betting" &&
      gameState.currentTurn === (isPlayer1 ? 1 : 2)
    ) {
      const minRaise =
        gameState.currentBet +
        Math.max(gameState.currentBet - gameState.lastBet, 1);
      setBetInput(minRaise);
    }
  }, [
    gameState.status,
    gameState.currentTurn,
    gameState.currentBet,
    gameState.lastBet,
    isPlayer1,
  ]);

  const determineWinner = (
    p1Dice: [number, number],
    p2Dice: [number, number]
  ): 1 | 2 => {
    // Calculate sums for each player
    const p1Sum = p1Dice[0] + p1Dice[1];
    const p2Sum = p2Dice[0] + p2Dice[1];

    if (p1Sum !== p2Sum) {
      // Higher sum wins
      return p1Sum > p2Sum ? 1 : 2;
    } else {
      // In case of equal sums, Player 1 wins the tie
      return 1;
    }
  };

  // Keep the win/lose sound effect
  useEffect(() => {
    if (gameState.status === "complete" && gameState.winner) {
      const isWinner = gameState.winner === (isPlayer1 ? 1 : 2);
      playSound(isWinner ? "win" : "lose");
    }
  }, [gameState.status, gameState.winner, isPlayer1]);

  // Keep the join sound effect
  const [player2Joined, setPlayer2Joined] = useState(false);

  useEffect(() => {
    if (isPlayer1 && !player2Joined && gameState.player2.hasRolled) {
      setPlayer2Joined(true);
      playSound("join");
    }
  }, [isPlayer1, player2Joined, gameState.player2.hasRolled]);

  return (
    <div className="poker-table">
      {/* Share URL for Player 1 */}
      {isPlayer1 && !gameState.player2.hasRolled && (
        <div className="share-link">
          <h3>Share this URL with your opponent:</h3>
          <input
            readOnly
            value={getShareableUrl()}
            onClick={(e) => e.currentTarget.select()}
          />
        </div>
      )}

      {/* Move the last action display out of the turn indicator */}
      {gameState.lastAction && (
        <div
          style={{
            position: "fixed",
            left: "20px", // Position from left edge
            top: "50%", // Center vertically
            transform: "translateY(-50%)",
            fontSize: "1.4em",
            fontWeight: "bold",
            color: "#fbbf24",
            textShadow: "0 0 10px rgba(251, 191, 36, 0.3)",
            padding: "12px 20px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: "8px",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-in-out",
            maxWidth: "200px", // Prevent it from getting too wide
          }}
        >
          {gameState.lastAction}
        </div>
      )}

      {/* Turn indicator now only shows turn status */}
      <div
        className="turn-indicator"
        style={{
          position: "fixed",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          borderRadius: "8px",
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          textAlign: "center",
          zIndex: 1000,
          width: "auto",
          maxWidth: "90%",
        }}
      >
        {gameState.status === "rolling" && (
          <>
            {!playerData.hasRolled ? (
              <span style={{ color: "#4ade80" }}>Your turn to roll!</span>
            ) : !opponentData.hasRolled ? (
              <span style={{ color: "#94a3b8" }}>
                Waiting for opponent to roll...
              </span>
            ) : null}
          </>
        )}

        {gameState.status === "betting" && (
          <>
            {gameState.currentTurn === (isPlayer1 ? 1 : 2) ? (
              <span style={{ color: "#4ade80" }}>Your turn to bet!</span>
            ) : (
              <span style={{ color: "#94a3b8" }}>
                Waiting for opponent's bet...
                {gameState.currentBet > 0 &&
                  ` (Current bet: $${gameState.currentBet})`}
              </span>
            )}
          </>
        )}
      </div>

      <PlayerArea
        isPlayer1={!isPlayer1}
        gameState={gameState}
        isOpponent={true}
      />

      {/* Center area with pot and game status */}
      <div className="table-center">
        {gameState.status === "complete" ? (
          <div className="game-result">
            <h2
              className="result-text"
              style={{
                color:
                  gameState.winner === (isPlayer1 ? 1 : 2)
                    ? "#4ade80"
                    : "#ef4444",
              }}
            >
              {gameState.winner === (isPlayer1 ? 1 : 2)
                ? "YOU WON!"
                : "YOU LOST!"}
            </h2>
            <div className="countdown">New round in {countdown}...</div>
          </div>
        ) : (
          <div className="pot-area">
            {gameState.currentBet > 0 && (
              <>
                <div className="current-bet-amount">
                  Current Bet: ${gameState.currentBet}
                </div>
                <ChipStack amount={gameState.currentBet} />
              </>
            )}
          </div>
        )}
      </div>

      <PlayerArea
        isPlayer1={isPlayer1}
        gameState={gameState}
        onRoll={rollDice}
        onAction={handleAction}
        betInput={betInput}
        onBetInputChange={(value) => setBetInput(value)}
      />
    </div>
  );
}

export default App;
