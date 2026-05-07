interface IconProps {
  width?: number;
  height?: number;
}

export default function LayersIcon({
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
      <path d="M9.638 1.342a.75.75 0 01.724 0l7.25 4a.75.75 0 010 1.316l-7.25 4a.75.75 0 01-.724 0l-7.25-4a.75.75 0 010-1.316l7.25-4z" />
      <path d="M2.388 9.658a.75.75 0 011.018-.296L10 12.93l6.594-3.568a.75.75 0 01.722 1.316l-6.955 3.764a.75.75 0 01-.722 0L2.684 10.677a.75.75 0 01-.296-1.019z" />
      <path d="M2.388 13.658a.75.75 0 011.018-.296L10 16.93l6.594-3.568a.75.75 0 01.722 1.316l-6.955 3.764a.75.75 0 01-.722 0l-6.955-3.764a.75.75 0 01-.296-1.02z" />
    </svg>
  );
}
