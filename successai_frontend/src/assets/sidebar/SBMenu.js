import React from "react";

const SBMenu = ({ color = "#FFFFFF" }) => {
  return (
    <svg width="4" height="19" viewBox="0 0 4 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 10.2168C2.55228 10.2168 3 9.76908 3 9.2168C3 8.66451 2.55228 8.2168 2 8.2168C1.44772 8.2168 1 8.66451 1 9.2168C1 9.76908 1.44772 10.2168 2 10.2168Z"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2 3.2168C2.55228 3.2168 3 2.76908 3 2.2168C3 1.66451 2.55228 1.2168 2 1.2168C1.44772 1.2168 1 1.66451 1 2.2168C1 2.76908 1.44772 3.2168 2 3.2168Z"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2 17.2168C2.55228 17.2168 3 16.7691 3 16.2168C3 15.6645 2.55228 15.2168 2 15.2168C1.44772 15.2168 1 15.6645 1 16.2168C1 16.7691 1.44772 17.2168 2 17.2168Z"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default SBMenu;
