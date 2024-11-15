import React from "react";

interface ChipStackProps {
  amount: number;
}

export const ChipStack: React.FC<ChipStackProps> = ({ amount }) => {
  // Define chip denominations and their colors (more casino-like colors)
  const chipTypes = [
    { value: 100, color: "#2C3E50", textColor: "#FFD700" }, // Dark blue/black
    { value: 25, color: "#27AE60", textColor: "white" }, // Rich green
    { value: 5, color: "#C0392B", textColor: "white" }, // Deep red
    { value: 1, color: "#ECF0F1", textColor: "#2C3E50" }, // Off-white
  ];

  // Calculate how many of each chip we need
  const getChipCounts = (total: number) => {
    let remaining = total;
    return chipTypes.map((chip) => {
      const count = Math.floor(remaining / chip.value);
      remaining = remaining % chip.value;
      return count;
    });
  };

  const chipCounts = getChipCounts(amount);

  return (
    <div className="chip-stacks">
      {chipTypes.map(
        (chip, typeIndex) =>
          chipCounts[typeIndex] > 0 && (
            <div key={typeIndex} className="stack-column">
              <div className="stack-wrapper">
                {Array(Math.min(chipCounts[typeIndex], 10))
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={`${typeIndex}-${index}`}
                      className="chip"
                      style={{
                        backgroundColor: chip.color,
                        transform: `translateY(${-index * 2}px)`,
                        zIndex: index,
                      }}
                    />
                  ))}
              </div>
            </div>
          )
      )}
    </div>
  );
};
