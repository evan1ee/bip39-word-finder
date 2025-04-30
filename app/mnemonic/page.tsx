"use client";

import React, { useState, useMemo } from "react";
import { Copy, Github, RefreshCw, Binary, Plus, Minus } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import { getWordsFromIndex, WordlistLanguage } from "@/lib/wordlist";
import { BinaryInput } from "@/components/binaryButton";

// Define a type for the language display object

const MIN_WORDS = 1;
const MAX_INDEX = 2047;
const GITHUB_REPO_URL = "https://github.com/evan1ee/bip39-word-finder";

// All supported languages array to avoid repetition
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
  const [maxWords, setMaxWords] = useState(12);
  const [indexes, setIndexes] = useState<number[]>([0]);
  const [isResetting, setIsResetting] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] =
    useState<WordlistLanguage>("english");

  // Memoize wordlists based on indexes to avoid recalculation on every render
  const wordlists = useMemo(() => {
    // Map each index to its corresponding word result
    return indexes.map((index) => {
      const wordResult = getWordsFromIndex(index);

      // Map each language to its display format
      return SUPPORTED_LANGUAGES.map((lang) => ({
        id: lang.id,
        name: lang.name,
        word: wordResult[lang.id],
      }));
    });
  }, [indexes]);

  // Get displayed words based on selected language
  const displayedWords = useMemo(() => {
    return indexes.map(
      (_, i) => wordlists[i]?.find((w) => w.id === selectedLanguage)?.word || ""
    );
  }, [indexes, wordlists, selectedLanguage]);

  // Handle binary input change with index clamping (0-2047 for BIP39)
  const handleBinaryChange = (newValue: string) => {
    let newIndex = parseInt(newValue, 2);
    newIndex = Math.max(0, Math.min(MAX_INDEX, newIndex)); // Clamp index to valid range

    setIndexes((prevIndexes) => {
      const newIndexes = [...prevIndexes];
      newIndexes[activeWordIndex] = newIndex;
      return newIndexes;
    });
  };

  // Reset to default state
  const resetToDefault = () => {
    setIsResetting(true);
    setIndexes([0]);
    setActiveWordIndex(0);
    setSelectedLanguage("english");

    setTimeout(() => {
      setIsResetting(false);
      toast.success("Reset to default values");
    }, 300);
  };

  // Copy text to clipboard with toast notification
  // Copy text to clipboard with toast notification and auto-clear after 10 seconds
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.dismiss();
        toast.success(
          `"${text}" copied to clipboard! \n \n It will be cleared in 10 seconds.`
        );

        // Attempt to clear clipboard after 10 seconds
        setTimeout(() => {
          navigator.clipboard
            .writeText("")
            .then(() => {
              toast.success("Clipboard cleared for security.");
            })
            .catch((err) => {
              toast.error(
                "Failed to clear clipboard due to browser restrictions."
              );
              console.error("Clipboard clear failed:", err);
            });
        }, 10000); // 10 seconds delay
      })
      .catch((err) => {
        toast.error("Failed to copy to clipboard");
        console.error("Copy failed:", err);
      });
  };

  // Add a new word slot (up to maxWords)
  const addWordSlot = () => {
    if (indexes.length < maxWords) {
      setIndexes((prev) => [...prev, 0]);
      setActiveWordIndex(indexes.length);
      toast.success(`Added word slot #${indexes.length + 1}`);
    }
  };

  // Remove the last word slot (minimum MIN_WORDS)
  const removeWordSlot = () => {
    if (indexes.length > MIN_WORDS) {
      setIndexes((prev) => prev.slice(0, -1));
      setActiveWordIndex((prev) => Math.min(prev, indexes.length - 2));
      toast.success(`Removed word slot #${indexes.length}`);
    }
  };

  // Select a word slot by index
  const selectWordSlot = (index: number) => {
    if (index >= 0 && index < indexes.length) {
      setActiveWordIndex(index);
    }
  };

  // Generate complete seed phrase
  const seedPhrase = useMemo(() => displayedWords.join(" "), [displayedWords]);

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
                  The BIP39 mnemonic list contains 2048 words (0-2047), each
                  with an 11-bit binary representation. Find words by index or
                  search by word across multiple languages.
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

          {/* Word Slot Navigation */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

                <div className= "flex items-center  space-x-3">

                {/* <h2 className="text-sm sm:text-md font-semibold text-gray-500">
                 Seed:
                </h2> */}

                     {/* Seed Length Selection */}
                     <div className="flex justify-start sm:justify-end">
                      <div
                        className="inline-flex rounded-md shadow-sm"
                        role="group"
                      >
                        {[12, 15,18,21, 24].map((length) => (
                          <button
                            key={length}
                            onClick={() => {
                              // Set new max words
                              const newMaxWords = length;

                              // Adjust current indexes if needed
                              if (indexes.length > newMaxWords) {
                                setIndexes((prev) =>
                                  prev.slice(0, newMaxWords)
                                );
                                setActiveWordIndex((prev) =>
                                  Math.min(prev, newMaxWords - 1)
                                );
                                toast.success(
                                  `Adjusted to ${newMaxWords} word phrase`
                                );
                              }

                              // Update maxWords (assuming you'll make this a state variable)
                              setMaxWords(newMaxWords);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium 
                ${
                  maxWords === length
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } 
                ${length === 12 ? "rounded-l-lg" : ""} 
                ${length === 24 ? "rounded-r-lg" : ""}`}
                          >
                            {length}
                          </button>
                        ))}
                      </div>
                    </div>
                </div>


                

                <div className="flex items-center">
                  <div className="flex space-x-3">
                 

                    {/* Add/Remove Word Slots */}

                    <button
                      onClick={removeWordSlot}
                      disabled={indexes.length <= MIN_WORDS}
                      className={`flex items-center p-2 rounded-full ${
                        indexes.length <= MIN_WORDS
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                      aria-label="Remove word slot"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={addWordSlot}
                      disabled={indexes.length >= maxWords}
                      className={`flex items-center p-2 rounded-full ${
                        indexes.length >= maxWords
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                      aria-label="Add word slot"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <button
                      onClick={resetToDefault}
                      disabled={isResetting}
                      className={`flex items-center p-2 rounded-full ${
                        isResetting
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                      aria-label="Reset to default values"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          isResetting ? "animate-spin" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-1 sm:gap-2 justify-center md:px-25">
                {Array.from({ length: maxWords }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => idx < indexes.length && selectWordSlot(idx)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      idx < indexes.length
                        ? idx === activeWordIndex
                          ? "bg-blue-500 text-white"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    } transition-all duration-200`}
                    disabled={idx >= indexes.length}
                    aria-label={`Select word ${idx + 1}`}
                    aria-pressed={idx === activeWordIndex}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Binary Input Section */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 font-semibold flex items-center">
                    <Binary
                      className="h-4 w-4 mr-1 sm:mr-2"
                      aria-hidden="true"
                    />
                    Binary Position (Index: {indexes[activeWordIndex]})
                  </h2>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <BinaryInput
                    value={indexes[activeWordIndex]
                      .toString(2)
                      .padStart(11, "0")}
                    onChange={handleBinaryChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mnemonic Phrase Summary Section */}
          {indexes.length > 1 && (
            <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-500">
                  Your Full BIP39 Mnemonic Phrase
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Your complete seed phrase across all selected words.
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
                        className={`px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors relative min-w-[50px] ${
                          selectedLanguage === lang.id
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

                {/* Phrase Display */}
                <div
                  id={`${selectedLanguage}-panel`}
                  role="tabpanel"
                  aria-labelledby={`${selectedLanguage}-tab`}
                  className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {displayedWords.map((word, i) => (
                      <div
                        key={i}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer ${
                          i === activeWordIndex
                            ? "bg-blue-500 text-white"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                        onClick={() => selectWordSlot(i)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select word ${i + 1}: ${word}`}
                      >
                        <span className="text-xs opacity-75 mr-1">
                          {i + 1}.
                        </span>{" "}
                        {word}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Copy Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => copyToClipboard(seedPhrase)}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium"
                    aria-label="Copy full phrase to clipboard"
                  >
                    <Copy
                      className="h-3 w-3 sm:h-4 sm:w-4"
                      aria-hidden="true"
                    />
                    Copy Full Phrase
                  </button>
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
            <Github className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>View on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
