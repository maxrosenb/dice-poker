import React from "react";

interface PositionButtonProps {
  position: "SB" | "BB" | "BTN";
}

export const PositionButton: React.FC<PositionButtonProps> = ({ position }) => {
  return (
    <div
      style={{
        backgroundColor: "#2563eb",
        color: "white",
        padding: "4px 8px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "absolute",
        left: "-40px",
        top: "-20px",
        transform: "none",
      }}
    >
      {position}
    </div>
  );
};
