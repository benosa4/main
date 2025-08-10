
export const PaperclipIcon = ({
  className = 'w-5 h-5',
  stroke = 'currentColor',
}: {
  className?: string;
  stroke?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke={stroke}
    className={className}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.44 11.05l-8.49 8.49a6 6 0 11-8.49-8.49l8.49-8.49a4 4 0 115.66 5.66l-8.49 8.49a2 2 0 11-2.83-2.83l7.07-7.07"
    />
  </svg>
);

export default PaperclipIcon;
