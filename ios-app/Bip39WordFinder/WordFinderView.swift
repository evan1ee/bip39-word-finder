
import SwiftUI

struct WordFinderView: View {
    @State private var searchText = ""
    @State private var searchResults: [(word: String, details: (language: Language, index: Int)?)] = []

    var body: some View {
        NavigationView {
            VStack {
                TextField("Enter BIP39 words separated by spaces", text: $searchText)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding()
                
                Button("Find") {
                    search()
                }

                List(searchResults, id: \.word) { result in
                    VStack(alignment: .leading) {
                        Text(result.word).font(.headline)
                        if let details = result.details {
                            Text("Found in \(details.language.rawValue): #\(details.index)")
                            BinaryDisplayView(index: details.index)
                        } else {
                            Text("Word not found").foregroundColor(.red)
                        }
                    }
                }
            }
            .navigationTitle("BIP39 Word Finder")
        }
    }

    private func search() {
        let words = searchText.trimmingCharacters(in: .whitespacesAndNewlines).components(separatedBy: .whitespaces)
        searchResults = words.map { word in
            (word, WordlistManager.shared.findWord(word))
        }
    }
}

struct BinaryDisplayView: View {
    let index: Int
    private let bitValues = [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1]

    var body: some View {
        HStack {
            ForEach(bitValues, id: \.self) { value in
                Text((index & value) != 0 ? "1" : "0")
                    .font(.system(.body, design: .monospaced))
            }
        }
    }
}

struct WordFinderView_Previews: PreviewProvider {
    static var previews: some View {
        WordFinderView()
    }
}
