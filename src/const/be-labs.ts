export const colorList = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
];

export const colorPicker = (num: number) =>
  ["bg", colorList[num % colorList.length], "500"].join("-");
