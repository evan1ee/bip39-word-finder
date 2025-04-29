'use client'

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Copy, Github, RefreshCw, Info } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import chinese_simplified_wordlist from "@/lib/wordlist/chinese_simplified";
import chinese_traditional_wordlist from "@/lib/wordlist/chinese_traditional";
import czech_wordlist from "@/lib/wordlist/czech";
import english_wordlist from "@/lib/wordlist/english";
import french_wordlist from "@/lib/wordlist/french";
import italian_wordlist from "@/lib/wordlist/italian";
import japanese_wordlist from "@/lib/wordlist/japanese";
import korean_wordlist from "@/lib/wordlist/korean";
import portuguese_wordlist from "@/lib/wordlist/portuguese";
import spanish_wordlist from "@/lib/wordlist/spanish";

interface SelectedValues {
  [key: string]: boolean;
}

export default function Home() {
  // Initialize state for 12 lines of checkboxes
  const initialSelectedValues: SelectedValues = {};
  for (let line = 0; line < 24; line++) {
    for (let bit = 0; bit < 11; bit++) {
      initialSelectedValues[`${line}-${bit}`] = false;
    }
  }

  const [selectedValues, setSelectedValues] = useState<SelectedValues>(initialSelectedValues);
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Values in reverse order (1024 to 1)
  const binaryValues: number[] = [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];

  // Calculate the sum for a specific line based on selected checkboxes
  const calculateLineSum = (line: number): number => {
    let sum = 0;
    
    for (let bit = 0; bit < 11; bit++) {
      if (selectedValues[`${line}-${bit}`]) {
        sum += binaryValues[bit];
      }
    }
    
    return sum;
  };

  // Handle checkbox changes
  const handleCheckboxChange = (line: number, bit: number): void => {
    const key = `${line}-${bit}`;
    setSelectedValues({
      ...selectedValues,
      [key]: !selectedValues[key],
    });
  };

  // Reset all checkboxes
  const handleReset = (): void => {
    setSelectedValues(initialSelectedValues);
    toast.success("All checkboxes have been reset");
  };

  // Generate array of sums for all 12 lines
  const lineSums = Array.from({ length: 24 }, (_, i) => calculateLineSum(i));
  
  // Check if there are any selections
  const hasAnySelection = lineSums.some(sum => sum > 0);

  const wordlistMap = [
    { name: "English", list: english_wordlist, id: "english" },
    { name: "Chinese (Simplified)", list: chinese_simplified_wordlist, id: "chinese-simplified" },
    { name: "Chinese (Traditional)", list: chinese_traditional_wordlist, id: "chinese-traditional" },
    { name: "Czech", list: czech_wordlist, id: "czech" },
    { name: "French", list: french_wordlist, id: "french" },
    { name: "Italian", list: italian_wordlist, id: "italian" },
    { name: "Japanese", list: japanese_wordlist, id: "japanese" },
    { name: "Korean", list: korean_wordlist, id: "korean" },
    { name: "Portuguese", list: portuguese_wordlist, id: "portuguese" },
    { name: "Spanish", list: spanish_wordlist, id: "spanish" }
  ];

  // Generate complete mnemonic phrase for a given language
  const generateMnemonicPhrase = (wordlist: string[]): string => {
    return lineSums.map(sum => wordlist[sum]).join(' ');
  };

  // Copy mnemonic phrase to clipboard
  const copyPhraseToClipboard = (language: string) => {
    const wordlist = wordlistMap.find(wl => wl.id === language)?.list;
    if (!wordlist) return;
    
    const phrase = generateMnemonicPhrase(wordlist);
    navigator.clipboard.writeText(phrase);
    setCopiedPhrase(language);
    toast.success(`Copied ${language} mnemonic phrase to clipboard!`);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedPhrase(null);
    }, 2000);
  };

  const githubRepoUrl = "https://github.com/evan1ee/bip39-word-finder";

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto w-full bg-white rounded-2xl shadow-xl overflow-hidden flex-grow">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">BIP39 Word Finder</h1>
              <p className="text-indigo-100 mt-2 max-w-2xl">The BIP39 mnemonic list contains 2048 words, each corresponding to a value from 0 to 2047. These values can be represented using 11 checkboxes for binary selection to determine the matching BIP39 word.</p>
            </div>
            
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="relative">
              <button 
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="h-4 w-4 mr-1" /> How it works
              </button>
              {showTooltip && (
                <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-lg border border-slate-200 w-72 text-sm text-slate-700">
                  Each row represents one word in your mnemonic. Select checkboxes to add their binary values for each word (0-2047 in the BIP39 wordlist).
                </div>
              )}
            </div>
            
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Reset All
            </button>
          </div>
          
          <div className="grid gap-3">
            {Array.from({ length: 24 }).map((_, lineIndex) => (
              <div key={lineIndex} className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm mr-3">
                    {lineIndex + 1}
                  </div>
                  <div className="text-sm text-slate-500">
                    Word: <span className="font-mono font-medium text-indigo-600">{calculateLineSum(lineIndex)}</span>
                    {calculateLineSum(lineIndex) > 0 && (
                      <span className="ml-2 text-slate-600">
                        → {english_wordlist[calculateLineSum(lineIndex)]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-11 gap-1 sm:gap-2">
                  {binaryValues.map((value, bitIndex) => (
                    <div key={`${lineIndex}-${bitIndex}`} className="flex flex-col items-center">
                      <span className="text-xs font-mono mb-1 text-slate-500">{value}</span>
                      <div 
                        onClick={() => handleCheckboxChange(lineIndex, bitIndex)}
                        className={`p-2 rounded-md cursor-pointer transition-all ${
                          selectedValues[`${lineIndex}-${bitIndex}`] 
                            ? 'bg-indigo-100 border border-indigo-300' 
                            : 'bg-white border border-slate-200 hover:border-indigo-200'
                        }`}
                      >
                        <Checkbox 
                          id={`checkbox-${lineIndex}-${bitIndex}`} 
                          checked={selectedValues[`${lineIndex}-${bitIndex}`]} 
                          onCheckedChange={() => handleCheckboxChange(lineIndex, bitIndex)}
                          className="h-4 w-4 data-[state=checked]:bg-indigo-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-gradient-to-r from-slate-50 to-indigo-50 p-6 rounded-xl border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">Complete Mnemonic Phrase</span>
              {!hasAnySelection && (
                <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded-md">
                  Select checkboxes above to generate
                </span>
              )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wordlistMap.map((wordlist) => (
                <div 
                  key={wordlist.id} 
                  className={`p-4 bg-white border rounded-lg transition-all ${
                    hasAnySelection 
                      ? 'border-indigo-200 shadow-sm hover:shadow-md' 
                      : 'border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-slate-600">{wordlist.name}</h3>
                    <button
                      onClick={() => hasAnySelection && copyPhraseToClipboard(wordlist.id)}
                      className={`focus:outline-none ${
                        hasAnySelection 
                          ? 'text-slate-400 hover:text-indigo-600' 
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                      aria-label={`Copy ${wordlist.name} mnemonic phrase`}
                      disabled={!hasAnySelection}
                    >
                      {copiedPhrase === wordlist.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div 
                    className={`mt-3 p-2 rounded-md font-mono text-sm ${
                      hasAnySelection 
                        ? 'bg-slate-50 cursor-pointer hover:bg-indigo-50 transition-colors' 
                        : 'bg-slate-50'
                    }`}
                    onClick={() => hasAnySelection && copyPhraseToClipboard(wordlist.id)}
                  >
                    <p className="break-words leading-relaxed">
                      {hasAnySelection 
                        ? generateMnemonicPhrase(wordlist.list)
                        : "Select checkboxes to generate phrase"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center py-6 text-slate-500 text-sm">
        <p>BIP39 Word Finder • Make sure to secure your mnemonic phrases</p>
      </footer>
    </div>
  );
}
