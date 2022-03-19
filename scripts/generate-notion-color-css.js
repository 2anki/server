const NOTION_COLORS = [
  { name: "default", color: "#37352F" },
  { name: "gray", color: "#9B9A97" },
  { name: "brown", color: "#64473A" },
  { name: "orange", color: "#D9730D" },
  { name: "yellow", color: "#DFAB01" },
  { name: "green", color: "#0F7B6C" },
  { name: "blue", color: "#0B6E99" },
  { name: "purple", color: "#6940A5" },
  { name: "pink", color: "#AD1A72" },
  { name: "red", color: "#E03E3E" },
  { name: "gray_background", color: "#9B9A97" },
  { name: "brown_background", color: "#64473A" },
  { name: "orange_background", color: "#D9730D" },
  { name: "yellow_background", color: "#DFAB01" },
  { name: "green_background", color: "#0F7B6C" },
  { name: "blue_background", color: "#0B6E99" },
  { name: "purple_background", color: "#E03E3E" },
  { name: "pink_background", color: "#AD1A72" },
  { name: "red_background", color: "#E03E3E" },
];

for (const color of NOTION_COLORS) {
  if (color.name.includes('background')) {
    console.log(`.n2a-highlight-${color.name} { background-color: ${color.color}; }`);
  } else {
    console.log(`.n2a-highlight-${color.name} { color: ${color.color}; }`);
  }
}
