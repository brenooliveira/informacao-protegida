import Link from "next/link";
export function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="30"
      height="34"
      viewBox="0 0 30 34"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m15 2 12 5v9c0 8-5 13-12 16C8 29 3 24 3 16V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="m9 17 4 4 8-9" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Informação Protegida — início">
      <ShieldIcon />
      <span>
        informação
        <span className="brand-second">
          protegida<span className="brand-dot">.</span>
        </span>
      </span>
    </Link>
  );
}
