import React from "react";

export const ArrowLeftIconBlue = ({ color = "#0071F6" }) => {
  return (
    <>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.11372 12.6667L2.66927 8.00008M2.66927 8.00008L7.11372 3.33341M2.66927 8.00008L13.3359 8.00008"
          stroke={color}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </>
  );
};
