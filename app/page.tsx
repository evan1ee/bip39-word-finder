'use client'

import React, { useState, useEffect, useMemo } from "react";
import { Check, Copy, Github, RefreshCw, Search, Binary } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import { getWordsFromIndex, findWordDetails, WordlistLanguage } from "@/lib/wordlist";
import { BinaryInput } from "@/components/binaryButton";

// Constants
const MAX_INDEX = 2047;
const GITHUB_REPO_URL = "https://github.com/evan1ee/bip39-word-finder";

// Supported languages for wordlists
const SUPPORTED_LANGUAGES: Array<{ id: WordlistLanguage; name: string }> = [
  { id: "english", name: "English" },
  { id: "chinese_simplified", name: "Chinese (Simplified)" },
  { id: "chinese_traditional", name: "Chinese (Traditional)" },
  { id: "czech", name: "Czech" },
  { id: "french", name: "French" },
  { id: "italian", name: "Italian" },
  { id: "japanese", name: "Japanese" },
  { id: "korean", name: "Korean" },
  { id: "portuguese", name: "Portuguese" },
  { id: "spanish", name: "Spanish" },
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [word, setWord] = useState("");
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [inputSource, setInputSource] = useState<'binary' | 'word' | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Memoize wordlists to prevent recalculation on every render
  const wordlists = useMemo(() => {
    const wordResult = getWordsFromIndex(index);
    return SUPPORTED_LANGUAGES.map(lang => ({
      id: lang.id,
      name: lang.name,
      word: wordResult[lang.id]
    }));
  }, [index]);

  // Reset function to clear everything and set index to 0
  const resetToDefault = () => {
    setIsResetting(true);
    setWord("");
    setInputSource('binary');
    setIndex(0);

    setTimeout(() => {
      setIsResetting(false);
      toast.success("Reset to default values");
    }, 300);
  };

  // Handle copying to clipboard with proper timeout management and toast dismissal
  const copyToClipboard = (word: string, id: string) => {
    navigator.clipboard.writeText(word).then(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setCopiedWord(id);
      toast.dismiss();
      toast.success(`"${word}" copied to clipboard!`);
      const newTimeoutId = setTimeout(() => setCopiedWord(null), 2000);
      setTimeoutId(newTimeoutId);
    }).catch(err => {
      toast.error("Failed to copy to clipboard");
      console.error("Copy failed:", err);
    });
  };

  // Handle word input change and track input source
  const handleWordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWord(event.target.value);
    setInputSource('word');
  };

  // Handle binary input change with index clamping (0-2047 for BIP39)
  const handleBinaryChange = (newValue: string) => {
    let newIndex = parseInt(newValue, 2);
    newIndex = Math.max(0, Math.min(MAX_INDEX, newIndex));
    setIndex(newIndex);
    setInputSource('binary');
  };

  const wordDetails = findWordDetails(word);
  const wordIndex = wordDetails?.index;

  // Update index only if input source is 'word' and a valid word is found
  useEffect(() => {
    if (wordIndex !== undefined && inputSource === 'word') {
      setIndex(wordIndex);
    } else if (!word && inputSource === 'word') {
      setIndex(0);
    }
  }, [wordIndex, word, inputSource]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />
      <main className="flex-grow py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col gap-2 sm:gap-3 md:w-3/4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">BIP39 Word Finder</h1>
                <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-3xl">
                  The BIP39 mnemonic list contains 2048 words (0-2047), each with an 11-bit binary representation.
                  Find words by index or search by word across multiple languages.
                </p>
              </div>
              <div className="md:w-1/4 flex md:justify-end">
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="space-y-6 sm:space-y-8">
              {/* Word Input Section */}
              <div>
                <h2 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center">
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                  Search by Word
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    value={word}
                    onChange={handleWordChange}
                    placeholder="Enter a BIP39 word..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-md border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Enter a BIP39 word to find its index"
                  />
                  {word && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      onClick={() => setWord("")}
                      aria-label="Clear input"
                    >
                      ×
                    </button>
                  )}
                </div>
                {wordDetails && (
                  <div className="mt-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 border border-green-100 rounded-md">
                    <p className="text-xs sm:text-sm text-green-700 flex items-center">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" aria-hidden="true" />
                      Found in <span className="font-medium mx-1">{wordDetails.language}</span>
                      with index <span className="font-medium mx-1">{wordDetails.index}</span>
                    </p>
                  </div>
                )}
                {word && !wordDetails && (
                  <div className="mt-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 border border-red-100 rounded-md">
                    <p className="text-xs sm:text-sm text-red-700">
                      No matching BIP39 word found.
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 sm:px-3 text-xs sm:text-sm text-gray-500">OR</span>
                </div>
              </div>

              {/* Binary Input Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 font-semibold flex items-center">
                    <Binary className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                    Binary Position (Index: {index})
                  </h2>
                  <button
                    onClick={resetToDefault}
                    disabled={isResetting}
                    className={`flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${isResetting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    aria-label="Reset to default values"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isResetting ? 'animate-spin' : ''}`} aria-hidden="true" />
                    Reset
                  </button>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <BinaryInput
                    value={index.toString(2).padStart(11, '0')}
                    onChange={handleBinaryChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                BIP39 Words for Index: <span className="text-blue-600">{index}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Click any word to copy it to clipboard.
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {wordlists.map((wordlist) => (
                  <div
                    key={wordlist.id}
                    className="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">{wordlist.name}</h3>
                      <button
                        onClick={() => copyToClipboard(wordlist.word, wordlist.id)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                        aria-label={`Copy ${wordlist.name} word`}
                      >
                        {copiedWord === wordlist.id ? (
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" aria-hidden="true" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <div
                      className="mt-2 text-md sm:text-lg font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors flex items-center"
                      onClick={() => copyToClipboard(wordlist.word, wordlist.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Copy ${wordlist.name} word: ${wordlist.word}`}
                    >
                      <span className="truncate">{wordlist.word}</span>
                      {copiedWord === wordlist.id && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 rounded">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 sm:py-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <p className="text-xs sm:text-sm text-gray-500">BIP39 Word Finder © {new Date().getFullYear()}</p>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-blue-600 transition-colors text-xs sm:text-sm"
            aria-label="View source code on GitHub"
          >
            <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>View on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
