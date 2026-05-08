interface IconProps {
  width?: number;
  height?: number;
}

export default function CheckIcon({
  width = 20,
  height = 20,
}: Readonly<IconProps>) {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}
