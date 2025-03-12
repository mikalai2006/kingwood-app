export function getShortFIO(fio: string | undefined, trimSecondName?: boolean) {
  if (!fio) {
    return "Noname";
  }

  const _arr = fio.split(" ");
  const _newArr = _arr.map((x, index) => (index > 0 ? x[0] + "." : x));
  const _trimArr = trimSecondName
    ? _newArr.slice(_newArr.length - 3, 2)
    : _newArr;
  return _trimArr.join(" ");
}

export function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export interface IRGB {
  r: number;
  g: number;
  b: number;
}

var colourIsLight = function (rgb: IRGB) {
  // Counting the perceptive luminance
  // human eye favors green color...
  var a = 1 - (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  console.log("a=", a);

  return a < 0.5;
};

export function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function contrastColor(hex: string) {
  const rgbColor = hexToRgb(hex);

  return rgbColor && colourIsLight(rgbColor) ? "black" : "white";
}

function padZero(str: string, len?: number) {
  len = len || 2;
  var zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}

export function invertColor(hex?: string, bw?: boolean) {
  if (!hex) return "black";

  if (!hex.startsWith("#")) return "black";

  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    // throw new Error("Invalid HEX color.");
    hex = hex.slice(0, 6);
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
  }
  return (
    "#" +
    padZero((255 - r).toString(16)) +
    padZero((255 - g).toString(16)) +
    padZero((255 - b).toString(16))
  );
}

export const getObjectId = (id?: string) => {
  return id ? (id === "000000000000000000000000" ? "0" : id) : "0";
};

export const replaceSubstringByArray = function (
  text: string,
  replacements: any[]
) {
  const regex = /(\%s)/g;
  const _text = text.replace(regex, () => replacements.shift());
  return _text;
};

export const colorWorkTimeProgress = [
  "bg-g-200 dark:bg-g-500 hover:bg-s-500 dark:hover:bg-g-400",
  "bg-g-300 dark:bg-g-600 hover:bg-s-500 dark:hover:bg-g-500",
  "bg-g-400 dark:bg-g-700 hover:bg-s-500 dark:hover:bg-g-500",
  "bg-s-500 dark:bg-g-800 hover:bg-s-500 dark:hover:bg-g-500",
  "bg-s-600 dark:bg-g-900 hover:bg-s-500 dark:hover:bg-g-500",
];

// var randomRgb = function () {
//   var r = Math.floor(Math.random() * 256);
//   var g = Math.floor(Math.random() * 256);
//   var b = Math.floor(Math.random() * 256);
//   return [r, g, b];
// };

// var colourFromRgb = function (r, g, b) {
//   return 'rgb(' + r + ',' + g + ',' + b + ')';
// };

// for (var i = 0; i < 1000; i += 1) {
//   var el = document.createElement('div');
//   el.setAttribute('class', 'box');
//   el.textContent = "Hello";

//   var bgRgb = randomRgb();
//   var bgColour = colourFromRgb(bgRgb[0], bgRgb[1], bgRgb[2]);
//   var textColour = colourIsLight(bgRgb[0], bgRgb[1], bgRgb[2]) ? 'black' : 'white';

//   el.setAttribute('style', 'background-color: ' + bgColour + '; color: ' + textColour);

//   c.appendChild(el);
// }
