export default function BookIcon({
  className = "h-6 w-6",
}: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Open book line art */}
      <path d="M2 6.5C2 5.4 2.9 4.5 4 4.5h7v15H4c-1.1 0-2-.9-2-2V6.5z" />
      <path d="M22 6.5C22 5.4 21.1 4.5 20 4.5h-7v15h7c1.1 0 2-.9 2-2V6.5z" />
      <line x1="11" y1="4.5" x2="13" y2="4.5" />
      <line x1="12" y1="4.5" x2="12" y2="19.5" />
    </svg>
  );
}
