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
type WordlistLanguage =
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

type WordList = string[];

type WordlistsMap = Record<WordlistLanguage, WordList>;

type WordsResult = Record<WordlistLanguage, string>;

type WordSearchResult = {
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
