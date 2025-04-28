'use client'

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Copy, Github } from "lucide-react";
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
  [key: number]: boolean;
}

export default function Home() {
  const [selectedValues, setSelectedValues] = useState<SelectedValues>({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
  });
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  // Values in reverse order (1024 to 1)
  const binaryValues: number[] = [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];

  // Calculate the sum based on selected checkboxes
  const calculateSum = (): number => {
    let sum = 0;
    
    Object.keys(selectedValues).forEach((indexStr) => {
      const index = Number(indexStr);
      if (selectedValues[index]) {
        sum += binaryValues[index];
      }
    });
    
    return sum;
  };

  // Handle checkbox changes
  const handleCheckboxChange = (index: number): void => {
    setSelectedValues({
      ...selectedValues,
      [index]: !selectedValues[index],
    });
  };

  const sum = calculateSum();
  const hasSelection = sum > 0;

  const copyToClipboard = (word: string, language: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(language);
    toast.success(`Copied "${word}" to clipboard!`);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedWord(null);
    }, 2000);
  };

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

  const githubRepoUrl = "https://github.com/evan1ee/bip39-word-finder";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex-grow">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h1 className="text-2xl font-bold text-white">BIP39 Word Finder</h1>
          <p className="text-white/80 mt-2">Select binary values to find corresponding BIP39 mnemonic words</p>
        </div>
        
        <div className="p-6">          
          <div className="flex flex-wrap gap-4 items-center justify-center mb-8 bg-gray-50 p-6 rounded-xl">
            {binaryValues.map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-sm font-medium mb-1 text-gray-700">{value}</span>
                <div className={`p-3 rounded-lg transition-colors ${selectedValues[index] ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}>
                  <Checkbox 
                    id={`checkbox-${index}`} 
                    checked={selectedValues[index]} 
                    onCheckedChange={() => handleCheckboxChange(index)}
                    className="h-5 w-5 data-[state=checked]:bg-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Result: <span className="text-blue-600">{hasSelection ? sum : "0"}</span>
            </h2>
            
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wordlistMap.map((wordlist) => (
                  <div 
                    key={wordlist.id} 
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-500">{wordlist.name}</h3>
                      <button
                        onClick={() => copyToClipboard(wordlist.list[sum], wordlist.id)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        aria-label={`Copy ${wordlist.name} word`}
                      >
                        {copiedWord === wordlist.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p 
                      className="text-lg font-medium mt-1 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => copyToClipboard(wordlist.list[sum], wordlist.id)}
                    >
                      {wordlist.list[sum]}
                    </p>
                  </div>
                ))}
              </div>
           
          </div>
        </div>
      </div>

      {/* Footer with GitHub link */}
      <footer className="mt-12 text-center py-6 text-gray-500 text-sm">
        <a
          href={githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
