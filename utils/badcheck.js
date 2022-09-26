// CREDIT TO IroncladDev for this code
// He is an amazing coder, and has made very good projects.
// Check him out at https://replit.com/@IroncladDev
// His Github is https://github.com/Conner1115

/* eslint-disable quotes */
const englishWords = require("an-array-of-english-words");
const censors = require("badwords-list").array;
const words = englishWords.concat(censors);

// Determine the format of a given string
const stringFormat = (s) => {
  if (typeof s !== "string") return "none";
  let format = "";
  if (s.indexOf(" ") > -1) {
    if (s.split` `.every(x => x.length < 3)) {
      format = "split";
    } else if (!s.match(/[^a-zA-Z0-9\s]/)) {
      format = "words";
    } else if (s.match(/[^a-zA-Z0-9]/)) {
      if (/[,.:;?!]/.test(s)) {
        format = "sentence";
      } else {
        format = "unknown";
      }
    }
  } else if (s.indexOf(" ") < 0) {
    if (!s.match(/[^a-zA-Z0-9\_\-]/)) {
      if (s.indexOf("_") > -1 && s.indexOf("-") < 0) {
        format = "snake";
      } else if (s.indexOf("-") > -1 && s.indexOf("_") < 0) {
        format = "kebab";
      } else if (s.indexOf("_") > -1 && s.indexOf("-") > -1) {
        format = "mixed";
      } else if (s.indexOf("_") < 0 && s.indexOf("-") < 0) {
        if (/[A-Z]/.test(s)) {
          format = "camel";
        } else {
          format = "lowercase";
        }
      }
    } else {
      format = "unknown";
    }

  }
  return format;
};

// Replacable characters
const glyphs = {
  a: 'aå@аàáạąἀἁἂἃἄἅἆἇὰάᾀᾁᾂᾃᾄᾅᾆᾇɑα⍺𝐚𝑎𝒂𝒶𝓪𝔞𝕒𝖆𝖺𝗮𝘢𝙖𝚊𝛂𝛼𝜶𝝰𝞪ａA@4ἈἉἊἋἌἍἎἏÁ',
  b: 'bƄЬᏏᑲᖯ𝐛𝑏𝒃𝒷𝓫𝔟𝕓𝖇𝖻𝗯𝘣𝙗𝚋Bß',
  c: 'cсƈċçϲᴄⅽⲥꮯ𐐽𝐜𝑐𝒄𝒸𝓬𝔠𝕔𝖈𝖼𝗰𝘤𝙘𝚌ｃCÇ',
  d: '∂dԁɗᏧᑯⅆⅾꓒ𝐝𝑑𝒅𝒹𝓭𝕕𝖽𝗱𝘥𝙙𝚍D𝔡𝖉',
  e: 'eеẹėéèҽ℮ℯⅇ3ἐἑἒἓἔἕἘἙἚἛἜἝὲέE',
  f: 'fſẝF',
  g: 'gġ9ƍɡցᶃℊ𝐠𝑔𝒈𝓰𝔤𝕘𝖌𝗀𝗴𝘨𝙜𝚐ｇ9G',
  h: 'hһհᏂℎ𝐡𝒉𝒽𝓱𝔥𝕙𝖍𝗁𝗵𝘩𝙝𝚑ｈHἨἩἪἫἬἭἮἯ',
  i: 'iî¡!1іíìïἰἱἲἳἴἵἶἷὶίıɩɪιӏᎥℹⅈⅰ⍳ꭵ𑣃𝐢𝑖𝒊𝒾𝓲𝔦𝕚𝖎𝗂𝗶𝘪𝙞𝚒ｉI¡!1ἸἹἺἻἼἽἾἿ',
  j: 'jјʝϳⅉ𝐣𝑗𝒋𝒿𝓳𝔧𝕛𝖏𝗃𝗷𝘫𝙟𝚓ｊJ',
  k: 'k𝐤𝑘𝒌𝓀𝓴𝕜𝖐𝗄𝗸𝘬𝙠𝚔K',
  l: 'lӏḷ1|ƖǀІ׀וןا١۱ߊᛁℓⅼ∣⏽Ⲓⵏꓲ𐊊𐌉𐌠𖼨𝐥𝑙𝒍𝓁𝓵𝔩𝕀𝕝𝗅𝗹𝘭𝙡𝚕𝟏𝟙𝟣𝟭𝟷1L',
  m: 'mⅿ𑜀𑣣𝐦𝑚𝒎𝓂𝓶𝔪𝕞𝖒𝗆𝗺𝘮𝙢𝚖M',
  n: 'nոἠἡἢἣἤἥἦἧὴήռ𝐧𝑛𝒏𝓃𝓷𝔫𝕟𝖓𝗇𝗻𝘯𝙣𝚗N',
  o: '0oøоοօȯọỏơöóòὀὁὂὃὄὅὸό०੦૦௦౦ംഠ൦ං๐໐ဝ၀ჿᴏᴑℴⲟ𐐬𐓪𝐨𝑜𝒐𝓸𝔬𝕠𝖔𝗈𝗼𝘰𝙤𝚘𝛐𝛔𝜊𝜎𝝄𝝈𝝾𝞂𝞸O0ὈὉὊὋὌὍ೦',
  p: 'p𝔭𝕡𝖕𝗉𝗽𝘱𝙥𝚙𝛒𝜌𝜚𝝆𝝔𝞀𝞺Pр⍴ⲣ𝐩𝑝𝒑𝓅𝓹Pｐ',
  q: 'qզԛգ𝐪𝑞𝒒𝓆𝓺𝔮𝕢𝖖𝗊𝗾𝘲𝙦𝚚Q',
  r: 'rгᴦⲅꮁ𝐫𝑟𝒓𝓇𝓻𝔯𝕣𝖗𝗋𝗿𝘳𝙧𝚛R',
  s: 's$ʂƽѕꜱꮪ𐑈𑣁𝐬𝑠𝒔𝓈𝓼𝔰𝕤𝖘𝗌𝘀𝘴𝙨𝚜ｓS5$',
  t: 't†𝐭𝑡𝒕𝓉𝓽𝔱𝕥𝖙𝗍𝘁𝘵𝙩𝚝T',
  u: 'uυսüúùʋᴜ𐓶𑣘𝐮𝑢𝒖𝓊𝓾𝔲𝕦𝖚𝗎𝘂𝘶𝙪𝚞𝛖𝜐𝝊𝞄𝞾U𝙐',
  v: 'vνѵὐὑὒὓὔὕὖὗὺύטᴠⅴ∨⋁ꮩ𑜆𑣀𝐯𝒗𝓋𝓿𝕧𝗏𝘃𝘷𝙫𝚟𝛎𝜈𝝂𝝼𝞶ｖV',
  w: 'wὠὡὢὣὤὥὦὧὼώɯѡաᴡꮃ𑜊𑜎𑜏𝐰𝑤𝒘𝓌𝔀𝕨𝗐𝘄𝘸𝙬𝚠ԝW',
  x: 'xхҳ×ᕁᕽ᙮ⅹ⤫⤬⨯𝐱𝑥𝒙𝓍𝔁𝕩𝗑𝘅𝘹𝙭𝚡ｘ⤫⤬X',
  y: 'yуýʏγүყᶌỿ𝐲𝑦𝒚𝓎𝔂𝕪𝗒𝘆𝘺𝙮𝚢𝛄𝛾𝜸𝝲𝞬ｙYὙὛὝὟ',
  z: 'zʐżᴢꮓ𝐳𝑧𝒛𝓏𝔃𝕫𝗓𝘇𝘻𝙯𝚣Z'
};

// Extract all words from a sentence so each can be tested
const extractWords = (s, format, allWords) => {
  if (typeof s !== "string" || format === "none") return [];
  try {
    let words = [];
    switch (format) {
      case "words":
        words = s.split` `;
        break;
      case "sentence":
        words = s.split(/[\s.,;:?!]+/);
        break;
      case "snake":
      case "kebab":
      case "mixed":
        words = s.split(/[-_]/g);
        break;
      case "split":
        words = [s.split` `.join``];
        break;
      case "camel":
        words = s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
        break;
      case "lowercase":
        if (s.length > 100) return [];
        if (allWords.indexOf(s) > -1) {
          words = [s];
          return words;
        }
        let wordsFound = [];
        for (let i = 0; i < s.length; i++) {
          for (let j = i; j <= s.length; j++) {
            wordsFound.push(s.slice(i, j));
          }
        }
        let valid = [...new Set(wordsFound.filter(x => allWords.indexOf(x) > -1))];
        if (valid.length === 0) return [s];
        else words = valid;
        break;
      default:
        return [...new Set([].concat(s.split(/[\s.,;:?!]+/), s.split(/[-_]/g), s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)))];
    }
    return words.map(x => x.toLowerCase());
  } catch (e) { return []; }
};

// Replace certain characters with glyphs to be able to catch words like "s3lfb0t" or "nuk3r"
const renderWord = (word) => {
  let w = String(word).split``;
  for (let letter = 0; letter < w.length; letter++) {
    let l = w[letter];
    if (/[^a-zA-Z]/.test(l)) {
      let v = Object.values(glyphs);
      let i = v.findIndex(x => x.indexOf(l) > -1);
      if (i > -1) w[letter] = Object.keys(glyphs)[i];
    }
  }
  return w.join``;
};

// Main Function
const getCensorOutput = (text, allWords, bad) => {
  let out = [...new Set(
    [].concat(
      extractWords(text, stringFormat(text), allWords),
      extractWords(text, stringFormat(text), allWords).map(renderWord)
      )
    )
  ];
  return {
    contains: out.some(word => bad.indexOf(word) > -1),
    words: [...new Set(out.filter(word => bad.indexOf(word) > -1))]
  };
};

// All done!
const Scan = (__w__) => {
  if (typeof __w__ === "string" && !Array.isArray(__w__)) {
    return getCensorOutput(__w__, words, censors);
  } else if (typeof __w__ === "object" && Array.isArray(__w__)) {
    return __w__.map(x => getCensorOutput(x, words, censors));
  }
};

module.exports = Scan;