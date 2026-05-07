interface IconProps {
  width?: number;
  height?: number;
}

export default function PlayIcon({
  width = 20,
  height = 20,
}: Readonly<IconProps>) {
  return (
    <svg
      width={width}
      height={height}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.5 6.6a.75.75 0 011.166-.626l4 2.4a.75.75 0 010 1.252l-4 2.4A.75.75 0 018.5 11.4V6.6z"
        clipRule="evenodd"
      />
    </svg>
  );
}
