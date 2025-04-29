'use client'

import React, { useState, useEffect, useMemo } from "react";
import { Copy, Github, RefreshCw, Binary, Plus, Minus } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import { getWordsFromIndex,  } from "@/lib/wordlist";
import { BinaryInput } from "@/components/binaryButton";

export default function Home() {
  const [indexes, setIndexes] = useState<number[]>([0]);
  const [words, setWords] = useState<string[]>([""]);
  const [isResetting, setIsResetting] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  // Add a new state for selected language
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const githubRepoUrl = "https://github.com/evan1ee/bip39-word-finder";

  // Memoize wordlists based on indexes to avoid recalculation on every render
  const wordlists = useMemo(() => {
    const wordsForIndexes = Array.isArray(getWordsFromIndex(indexes))
      ? getWordsFromIndex(indexes) as any[]
      : [getWordsFromIndex(indexes)];

    return wordsForIndexes.map((wordsResult) => [
      { id: "english", name: "English", word: wordsResult.english },
      { id: "chinese_simplified", name: "Chinese (Simplified)", word: wordsResult.chinese_simplified },
      { id: "chinese_traditional", name: "Chinese (Traditional)", word: wordsResult.chinese_traditional },
      { id: "czech", name: "Czech", word: wordsResult.czech },
      { id: "french", name: "French", word: wordsResult.french },
      { id: "italian", name: "Italian", word: wordsResult.italian },
      { id: "japanese", name: "Japanese", word: wordsResult.japanese },
      { id: "korean", name: "Korean", word: wordsResult.korean },
      { id: "portuguese", name: "Portuguese", word: wordsResult.portuguese },
      { id: "spanish", name: "Spanish", word: wordsResult.spanish },
    ]);
  }, [indexes]);

  // Sync words with indexes when they change
  useEffect(() => {
    setWords(indexes.map((_, i) => wordlists[i]?.find(w => w.id === selectedLanguage)?.word || ""));
  }, [indexes, wordlists, selectedLanguage]);

  // Handle binary input change with index clamping (0-2047 for BIP39)
  const handleBinaryChange = (newValue: string) => {
    let newIndex = parseInt(newValue, 2);
    newIndex = Math.max(0, Math.min(2047, newIndex)); // Clamp index to valid range
    const newIndexes = [...indexes];
    newIndexes[activeWordIndex] = newIndex;
    setIndexes(newIndexes);
  };

  // Reset to default state
  const resetToDefault = () => {
    setIsResetting(true);
    setIndexes([0]);
    setWords([""]);
    setActiveWordIndex(0);
    setSelectedLanguage("english");
    setTimeout(() => {
      setIsResetting(false);
      toast.success("Reset to default values");
    }, 300);
  };

  // Copy text to clipboard with toast notification
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.dismiss();
    toast.success(`"${text}" copied to clipboard!`);
  };

  // Add a new word slot (up to 12)
  const addWordSlot = () => {
    if (indexes.length < 12) {
      setIndexes([...indexes, 0]);
      setWords([...words, ""]);
      setActiveWordIndex(indexes.length);
      toast.success(`Added word slot #${indexes.length + 1}`);
    }
  };

  // Remove the last word slot (minimum 1)
  const removeWordSlot = () => {
    if (indexes.length > 1) {
      setIndexes(indexes.slice(0, -1));
      setWords(words.slice(0, -1));
      setActiveWordIndex(Math.max(0, indexes.length - 2));
      toast.success(`Removed word slot #${indexes.length}`);
    }
  };

  // Select a word slot by index
  const selectWordSlot = (index: number) => {
    setActiveWordIndex(index);
  };

  // Get displayed words based on selected language
  const getDisplayedWords = () => {
    return indexes.map((_, i) => 
      wordlists[i]?.find(w => w.id === selectedLanguage)?.word || ''
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col gap-3 md:w-3/4">
                <h1 className="text-2xl md:text-3xl font-bold text-white">BIP39 Word Finder</h1>
                <p className="text-white/80 text-sm md:text-base max-w-3xl">
                  The BIP39 mnemonic list contains 2048 words (0-2047), each with an 11-bit binary representation.
                  Find words by index or search by word across multiple languages.
                </p>
              </div>
              <div className="md:w-1/4 flex md:justify-end">
                <a
                  href={githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Word Slot Navigation */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-md font-semibold text-gray-500">
                  BIP39 Seed Words ({indexes.length}/12)
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={removeWordSlot}
                    disabled={indexes.length <= 1}
                    className={`flex items-center p-2 rounded-full ${
                      indexes.length <= 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                    aria-label="Remove word slot"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={addWordSlot}
                    disabled={indexes.length >= 12}
                    className={`flex items-center p-2 rounded-full ${
                      indexes.length >= 12
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                    aria-label="Add word slot"
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  <button
                    onClick={resetToDefault}
                    disabled={isResetting}
                    className={`flex items-center p-2 rounded-full ${
                      isResetting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                    aria-label="Reset to default values"
                  >
                    <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                  
                  </button>
                
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => idx < indexes.length && selectWordSlot(idx)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      idx < indexes.length
                        ? idx === activeWordIndex
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    } transition-all duration-200`}
                    disabled={idx >= indexes.length}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Binary Input Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold flex items-center">
                    <Binary className="h-4 w-4 mr-2" />
                    Binary Position (Index: {indexes[activeWordIndex]})
                  </h2>
                
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <BinaryInput
                    value={indexes[activeWordIndex].toString(2).padStart(11, '0')}
                    onChange={handleBinaryChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mnemonic Phrase Summary Section */}
          {indexes.length > 1 && (
            <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-500">Your Full BIP39 Mnemonic Phrase</h2>
                <p className="text-sm text-gray-500 mt-1">Your complete seed phrase across all selected words.</p>
              </div>
              <div className="p-6">
                <div className="mb-4 border-b border-gray-200">
                  <div className="flex overflow-x-auto space-x-4 p-1">
                    {wordlists[0].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                          selectedLanguage === lang.id 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {getDisplayedWords().map((word, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                          i === activeWordIndex
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                        onClick={() => selectWordSlot(i)}
                      >
                        <span className="text-xs opacity-75 mr-1">{i + 1}.</span> {word}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      const phrase = getDisplayedWords().join(' ');
                      copyToClipboard(phrase);
                    }}
                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Full Phrase
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-sm text-gray-500">BIP39 Word Finder © {new Date().getFullYear()}</p>
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm"
            aria-label="View source code on GitHub"
          >
            <Github className="h-4 w-4" />
            <span>View on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
