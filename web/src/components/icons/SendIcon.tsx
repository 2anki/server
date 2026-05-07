interface IconProps {
  width?: number;
  height?: number;
}

export default function SendIcon({
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
      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.926A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.085l-1.414 4.926a.75.75 0 00.826.95 28.897 28.897 0 0015.293-7.155.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
    </svg>
  );
}
