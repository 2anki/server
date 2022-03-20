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
  { name: "gray_background", color: "rgb(241, 241, 239)" },
  { name: "brown_background", color: "rgb(244, 238, 238)" },
  { name: "orange_background", color: "rgb(251, 236, 221)" },
  { name: "yellow_background", color: "rgb(251, 243, 219)" },
  { name: "green_background", color: "rgb(237, 243, 236)" },
  { name: "blue_background", color: "rgb(231, 243, 248)" },
  { name: "purple_background", color: "rgba(244, 240, 247, 0.8)" },
  { name: "pink_background", color: "rgba(249, 238, 243, 0.8)" },
  { name: "red_background", color: "rgb(253, 235, 236)" },
];

for (const color of NOTION_COLORS) {
  if (color.name.includes('background')) {
    console.log(`.n2a-highlight-${color.name} { background-color: ${color.color}; }`);
  } else {
    console.log(`.n2a-highlight-${color.name} { color: ${color.color}; }`);
  }
}
