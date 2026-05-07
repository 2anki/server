interface IconProps {
  width?: number;
  height?: number;
}

export default function SparkleIcon({
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
      <path d="M9.315 2.226a.5.5 0 01.945 0l.94 2.628a3 3 0 001.821 1.82l2.628.94a.5.5 0 010 .945l-2.628.94a3 3 0 00-1.82 1.821l-.94 2.628a.5.5 0 01-.946 0l-.94-2.628a3 3 0 00-1.82-1.82l-2.628-.94a.5.5 0 010-.945l2.628-.94a3 3 0 001.82-1.821l.94-2.628zM15.5 12a.5.5 0 01.474.34l.39 1.16a1.5 1.5 0 00.948.948l1.16.39a.5.5 0 010 .947l-1.16.39a1.5 1.5 0 00-.948.948l-.39 1.16a.5.5 0 01-.947 0l-.39-1.16a1.5 1.5 0 00-.948-.948l-1.16-.39a.5.5 0 010-.948l1.16-.39a1.5 1.5 0 00.948-.948l.39-1.16A.5.5 0 0115.5 12z" />
    </svg>
  );
}
