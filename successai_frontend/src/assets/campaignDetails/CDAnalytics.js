export const CDAnalytics = ({ color }) => {
  return (
    <>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.4353 21.8825C16.4253 21.8825 20.4706 17.8372 20.4706 12.8472H11.4353L11.4353 3.81183C6.44526 3.8118 2.39999 7.85708 2.39999 12.8472C2.39999 17.8372 6.44523 21.8825 11.4353 21.8825Z"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M15.3882 2.11755V8.80715H21.6V8.32932C21.6 4.89866 18.8189 2.11755 15.3882 2.11755Z"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </>
  );
};
