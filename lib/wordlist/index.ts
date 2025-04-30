import chinese_simplified_wordlist from "./chinese_simplified";
import chinese_traditional_wordlist from "./chinese_traditional";
import czech_wordlist from "./czech";
import english_wordlist from "./english";
import french_wordlist from "./french";
import italian_wordlist from "./italian";
import japanese_wordlist from "./japanese";
import korean_wordlist from "./korean";
import portuguese_wordlist from "./portuguese";
import spanish_wordlist from "./spanish";

// --- Types ---
export type WordlistLanguage =
  | 'english'
  | 'chinese_simplified'
  | 'chinese_traditional'
  | 'czech'
  | 'french'
  | 'italian'
  | 'japanese'
  | 'korean'
  | 'portuguese'
  | 'spanish';

export type WordList = string[];

export type WordlistsMap = Record<WordlistLanguage, WordList>;

export type WordsResult = Record<WordlistLanguage, string>;

export type WordSearchResult = {
  language: WordlistLanguage;
  index: number;
} | null;

// --- Wordlists ---
const wordlists: WordlistsMap = {
  english: english_wordlist,
  chinese_simplified: chinese_simplified_wordlist,
  chinese_traditional: chinese_traditional_wordlist,
  czech: czech_wordlist,
  french: french_wordlist,
  italian: italian_wordlist,
  japanese: japanese_wordlist,
  korean: korean_wordlist,
  portuguese: portuguese_wordlist,
  spanish: spanish_wordlist,
};

// --- Utilities ---
const CASE_INSENSITIVE_LANGUAGES: WordlistLanguage[] = [
  'english',
  'french',
  'italian',
  'spanish',
  'portuguese',
  'czech',
];

function normalizeWord(word: string, language: WordlistLanguage): string {
  return CASE_INSENSITIVE_LANGUAGES.includes(language)
    ? word.trim().toLowerCase()
    : word.trim();
}

// --- Main Functions ---

/**
 * Gets BIP39 word(s) from index/indices across all languages.
 */
export function getWordsFromIndex(index: number): WordsResult;
export function getWordsFromIndex(indices: number[]): WordsResult[];
export function getWordsFromIndex(input: number | number[]): WordsResult | WordsResult[] {
  const validateIndex = (idx: number) => {
    if (idx < 0 || idx > 2047) {
      throw new Error(`Index ${idx} must be between 0 and 2047`);
    }
  };

  const getWords = (idx: number): WordsResult => {
    const words = {} as WordsResult;
    for (const language of Object.keys(wordlists) as WordlistLanguage[]) {
      words[language] = wordlists[language][idx];
    }
    return words;
  };

  if (typeof input === 'number') {
    validateIndex(input);
    return getWords(input);
  }

  if (Array.isArray(input)) {
    return input.map(idx => {
      validateIndex(idx);
      return getWords(idx);
    });
  }

  throw new Error('Input must be a number or an array of numbers');
}

/**
 * Finds the language and index of a given BIP39 word (first match only).
 */
export function findWordDetails(word: string): WordSearchResult {
  for (const language of Object.keys(wordlists) as WordlistLanguage[]) {
    const normalized = normalizeWord(word, language);
    const index = wordlists[language].findIndex(w => normalizeWord(w, language) === normalized);
    if (index !== -1) {
      return { language, index };
    }
  }
  return null;
}




// generate mnemonic function
// This function generates a BIP-39 mnemonic phrase based on the specified entropy bits and language.

// Helper function to convert a binary string to a decimal number
function binaryToDecimal(binary: string): number {
  return parseInt(binary, 2);
}

// Helper function to convert a byte array to a binary string
function bytesToBinary(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join('');
}

// Helper function to compute SHA-256 hash (using Web Crypto API)
async function sha256(buffer: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return new Uint8Array(hashBuffer);
}

// Main function to generate a BIP-39 mnemonic
export async function generateMnemonic(
  entropyBits: number = 128,
  language: WordlistLanguage = 'english'
): Promise<string> {
  if (![128, 160, 192, 224, 256].includes(entropyBits)) {
    throw new Error('Entropy bits must be 128, 160, 192, 224, or 256');
  }

  // Step 1: Generate random entropy
  const entropyBytes: number = entropyBits / 8;
  const entropy: Uint8Array = new Uint8Array(entropyBytes);
  crypto.getRandomValues(entropy);

  // Step 2: Compute checksum (first ENT/32 bits of SHA-256 hash)
  const checksumBits: number = entropyBits / 32;
  const hash: Uint8Array = await sha256(entropy);
  const checksumBinary: string = bytesToBinary(hash).slice(0, checksumBits);

  // Step 3: Combine entropy and checksum
  const entropyBinary: string = bytesToBinary(entropy);
  const combinedBinary: string = entropyBinary + checksumBinary;

  // Step 4: Split into 11-bit groups
  const groups: string[] = combinedBinary.match(/.{1,11}/g) || [];
  const indices: number[] = groups.map(binaryToDecimal);

  // Step 5: Map indices to words using the specified wordlist
  const wordlist: WordList = wordlists[language];
  if (!wordlist) {
    throw new Error(`Unsupported language: ${language}`);
  }
  const mnemonic: string[] = indices.map((index) => wordlist[index]);

  // Step 6: Return the mnemonic phrase
  return mnemonic.join(' ');
}


export async function validateMnemonic(
  mnemonic: string,
  language: WordlistLanguage = 'english'
): Promise<boolean> {
  const wordlist: WordList = wordlists[language];
  if (!wordlist) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const words = mnemonic.trim().split(/\s+/);

  // Validate word count
  if (![12, 15, 18, 21, 24].includes(words.length)) return false;

  // Convert words to binary
  const binaryString = words.map(word => {
    const index = wordlist.indexOf(word);
    if (index === -1) return null; // Invalid word
    return index.toString(2).padStart(11, '0');
  }).join('');

  if (binaryString.includes('null')) return false;

  const totalBits = words.length * 11;
  const checksumBits = totalBits / 33;
  const entropyBits = totalBits - checksumBits;

  const entropyBinary = binaryString.slice(0, entropyBits);
  const checksumBinary = binaryString.slice(entropyBits);

  // Convert entropy binary to byte array
  const entropyBytes = new Uint8Array(entropyBits / 8);
  for (let i = 0; i < entropyBytes.length; i++) {
    const byte = entropyBinary.slice(i * 8, (i + 1) * 8);
    entropyBytes[i] = parseInt(byte, 2);
  }

  // Compute and compare checksum
  const hash = await sha256(entropyBytes);
  const hashBinary = bytesToBinary(hash);
  const actualChecksum = hashBinary.slice(0, checksumBits);

  return checksumBinary === actualChecksum;
}


// const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
// const isValid = await validateMnemonic(mnemonic);
// console.log(isValid); // true
