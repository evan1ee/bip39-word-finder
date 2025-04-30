"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check, Copy, Github, RefreshCw, Search, Binary } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import {
  getWordsFromIndex,
  findWordDetails,
  WordlistLanguage,
} from "@/lib/wordlist";
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
  const [inputSource, setInputSource] = useState<"binary" | "word" | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<WordlistLanguage>("english");
  const [wordIndices, setWordIndices] = useState<number[]>([]); // Store indices for multiple words

  // Memoize wordlists to prevent recalculation on every render
  const wordlists = useMemo(() => {
    const wordResult = getWordsFromIndex(index);
    return SUPPORTED_LANGUAGES.map((lang) => ({
      id: lang.id,
      name: lang.name,
      word: wordResult[lang.id],
    }));
  }, [index]);

  // Reset function to clear everything and set index to 0
  const resetToDefault = () => {
    setIsResetting(true);
    setWord("");
    setInputSource("binary");
    setIndex(0);
    setWordIndices([]);

    setTimeout(() => {
      setIsResetting(false);
      toast.success("Reset to default values");
    }, 300);
  };

  // Handle copying to clipboard with toast notification
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.dismiss();
        toast.success(`"${text}" copied to clipboard!`);
      })
      .catch((err) => {
        toast.error("Failed to copy to clipboard");
        console.error("Copy failed:", err);
      });
  };

  // Handle word input change and track input source
  const handleWordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWord(event.target.value);
    setInputSource("word");
  };

  // Handle binary input change with index clamping (0-2047 for BIP39)
  const handleBinaryChange = (newValue: string, position?: number) => {
    let newIndex = parseInt(newValue, 2);
    newIndex = Math.max(0, Math.min(MAX_INDEX, newIndex));

    if (position !== undefined && position >= 0 && position < wordIndices.length) {
      // Update specific position in wordIndices
      const updatedIndices = [...wordIndices];
      updatedIndices[position] = newIndex;
      setWordIndices(updatedIndices);
      // Update main index if it's the first word or relevant
      if (position === 0) {
        setIndex(newIndex);
      }
    } else {
      setIndex(newIndex);
      // If single word, update wordIndices as well
      if (wordIndices.length <= 1) {
        setWordIndices([newIndex]);
      }
    }
    setInputSource("binary");
  };

  // Split input into words and find details for each
  const words = useMemo(() => word.trim().split(/\s+/).filter(Boolean), [word]);
  const wordDetailsList = useMemo(() => {
    return words.map(w => findWordDetails(w)).filter(Boolean);
  }, [words]);

  // Update indices based on word input
  useEffect(() => {
    if (inputSource === "word") {
      if (wordDetailsList.length > 0) {
        const indices = wordDetailsList.map(detail => detail!.index);
        setWordIndices(indices);
        setIndex(indices[0] || 0); // Set main index to first word's index
      } else if (!word) {
        setWordIndices([]);
        setIndex(0);
      }
    }
  }, [wordDetailsList, word, inputSource]);

  // Check for words not found
  const notFoundWords = useMemo(() => {
    if (!word) return [];
    const foundWords = wordDetailsList.filter(d => d !== null).map(d => d?.word || "");
    return words.filter(w => !foundWords.some(found => found.toLowerCase() === w.toLowerCase()));
  }, [word, wordDetailsList, words]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />
      <main className="flex-grow py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col gap-2 sm:gap-3 md:w-3/4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  BIP39 Word Finder
                </h1>
                <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-3xl">

                A tool to explore BIP39 mnemonic words by index or search for their binary positions. Convert between binary indices (0-2047) and words across multiple languages, ideal for cryptocurrency wallet seed phrase recovery or verification.

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
                  <Search
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2"
                    aria-hidden="true"
                  />
                  Search by Word
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    value={word}
                    onChange={handleWordChange}
                    placeholder="Enter BIP39 word(s) separated by spaces..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-md border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Enter BIP39 words to find their indices"
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
                {/* Show success message only if all words are found */}
                {word && wordDetailsList.length === words.length && words.length > 0 && notFoundWords.length === 0 && (
                  <div className="mt-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 border border-green-100 rounded-md">
                    <p className="text-xs sm:text-sm text-green-700 flex items-center">
                      <Check
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1"
                        aria-hidden="true"
                      />
                      All entered words are found in the BIP39 wordlist.
                    </p>
                  </div>
                )}
                {/* Show error message only if there are words not found */}
                {word && notFoundWords.length > 0 && (
                  <div className="mt-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 border border-red-100 rounded-md">
                    <p className="text-xs sm:text-sm text-red-700">
                      The following word(s) are not in the BIP39 wordlist: <span className="font-medium">{notFoundWords.join(", ")}</span>
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
                  <span className="bg-white px-2 sm:px-3 text-xs sm:text-sm text-gray-500">
                    OR
                  </span>
                </div>
              </div>

              {/* Binary Input Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 font-semibold flex items-center">
                    <Binary
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2"
                      aria-hidden="true"
                    />
                    Binary Position(s)
                  </h2>
                  <button
                    onClick={resetToDefault}
                    disabled={isResetting}
                    className={`flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${isResetting
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                    aria-label="Reset to default values"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 mr-1 ${isResetting ? "animate-spin" : ""
                        }`}
                      aria-hidden="true"
                    />
                    Reset
                  </button>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-center flex-wrap gap-6">
                    {wordIndices.length > 1 && inputSource === "word" ? (
                      wordIndices.map((idx, position) => (
                        <div key={position} className="flex flex-row items-center gap-2 min-w-[180px]">
                          <span className="flex items-center justify-center w-8 h-8 text-md font-medium text-green-600 bg-green-100 rounded-full mx-5">
                            {position + 1}
                          </span>
                          <BinaryInput
                            value={idx.toString(2).padStart(11, "0")}
                            readOnly = {true}
                            onChange={(value) => handleBinaryChange(value, position)}
                          />

                        </div>
                      ))
                    ) : (
                      <BinaryInput
                        value={index.toString(2).padStart(11, "0")}
                        onChange={(value) => handleBinaryChange(value)}
                      />
                    )}
                  </div>
                </div>





              </div>
            </div>
          </div>

          {/* Results Section - Show only when input source is binary or no word input */}
          {inputSource !== "word" && (
            <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-500">
                  BIP39 Words for Index: <span className="text-blue-600">{index}</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Select a language to view the corresponding word. Click to copy.
                </p>
              </div>
              <div className="p-4 sm:p-6">
                {/* Language Selection Tabs */}
                <div className="mb-4 sm:mb-6">
                  <div
                    role="tablist"
                    className="flex overflow-x-auto pb-1 border-b border-gray-200 scrollbar-hide"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        role="tab"
                        aria-selected={selectedLanguage === lang.id}
                        aria-controls={`${lang.id}-panel`}
                        id={`${lang.id}-tab`}
                        tabIndex={selectedLanguage === lang.id ? 0 : -1}
                        className={`px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors relative min-w-[50px] ${selectedLanguage === lang.id
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        {lang.name}
                        {selectedLanguage === lang.id && (
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Word Display */}
                <div
                  id={`${selectedLanguage}-panel`}
                  role="tabpanel"
                  aria-labelledby={`${selectedLanguage}-tab`}
                  className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="px-3 py-2 rounded-md text-sm font-medium cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100"
                      onClick={() =>
                        copyToClipboard(
                          wordlists.find((w) => w.id === selectedLanguage)?.word || ""
                        )
                      }
                      role="button"
                      tabIndex={0}
                      aria-label={`Copy word for ${selectedLanguage}`}
                    >
                      {wordlists.find((w) => w.id === selectedLanguage)?.word || "N/A"}
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          wordlists.find((w) => w.id === selectedLanguage)?.word || ""
                        )
                      }
                      className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                      aria-label="Copy word to clipboard"
                    >
                      <Copy className="h-3 w-3" aria-hidden="true" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 sm:py-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <p className="text-xs sm:text-sm text-gray-500">
            BIP39 Word Finder © {new Date().getFullYear()}
          </p>
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
