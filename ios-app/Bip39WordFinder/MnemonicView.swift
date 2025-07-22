import SwiftUI

struct MnemonicView: View {
    @State private var wordIndices: [Int]
    @State private var phraseLength = 12
    @State private var selectedLanguage: Language = .english
    @State private var activeWordIndex = 0

    init() {
        _wordIndices = State(initialValue: Array(repeating: 0, count: 12))
    }

    var body: some View {
        NavigationView {
            VStack {
                // Configuration
                VStack {
                    Picker("Phrase Length", selection: $phraseLength) {
                        Text("12").tag(12)
                        Text("15").tag(15)
                        Text("18").tag(18)
                        Text("21").tag(21)
                        Text("24").tag(24)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .onChange(of: phraseLength) { newLength in
                        let currentCount = wordIndices.count
                        if newLength > currentCount {
                            wordIndices.append(contentsOf: Array(repeating: 0, count: newLength - currentCount))
                        } else if newLength < currentCount {
                            wordIndices = Array(wordIndices.prefix(newLength))
                        }
                        if activeWordIndex >= newLength {
                            activeWordIndex = newLength - 1
                        }
                    }

                    HStack {
                        Button(action: { if wordIndices.count > 1 { wordIndices.removeLast() } }) {
                            Image(systemName: "minus.circle")
                        }
                        .disabled(wordIndices.count <= 1)

                        Button(action: { wordIndices.append(0) }) {
                            Image(systemName: "plus.circle")
                        }
                    }
                }
                .padding()

                // Word Selection Grid
                ScrollView {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))]) {
                        ForEach(wordIndices.indices, id: \.self) { index in
                            Text("\(index + 1)")
                                .frame(width: 40, height: 40)
                                .background(activeWordIndex == index ? Color.blue : Color.gray.opacity(0.5))
                                .foregroundColor(.white)
                                .cornerRadius(20)
                                .onTapGesture {
                                    activeWordIndex = index
                                }
                        }
                    }
                }
                .frame(maxHeight: 150)

                // Binary Input
                BinaryInputView(index: $wordIndices[activeWordIndex])

                // Phrase Display
                Text(generatedPhrase)
                    .padding()
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(8)
                
                Button("Copy Phrase") {
                    UIPasteboard.general.string = generatedPhrase
                }

                Spacer()
            }
            .navigationTitle("Mnemonic Generator")
        }
    }

    private var generatedPhrase: String {
        wordIndices.map { index in
            WordlistManager.shared.word(for: index, in: selectedLanguage) ?? ""
        }.joined(separator: " ")
    }
}

struct MnemonicView_Previews: PreviewProvider {
    static var previews: some View {
        MnemonicView()
    }
}