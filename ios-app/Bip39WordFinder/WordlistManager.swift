
import Foundation

enum Language: String, CaseIterable, Identifiable {
    case english = "English"
    case spanish = "Spanish"
    // Add other languages here

    var id: String { self.rawValue }

    var wordlist: [String] {
        switch self {
        case .english:
            return Wordlists.english
        case .spanish:
            return Wordlists.spanish
        // Add other languages here
        }
    }
}

class WordlistManager {
    static let shared = WordlistManager()

    private init() {}

    func word(for index: Int, in language: Language) -> String? {
        let list = language.wordlist
        guard index >= 0 && index < list.count else {
            return nil
        }
        return list[index]
    }

    func findWord(_ word: String) -> (language: Language, index: Int)? {
        for language in Language.allCases {
            if let index = language.wordlist.firstIndex(of: word.lowercased()) {
                return (language, index)
            }
        }
        return nil
    }
}
