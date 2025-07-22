
import SwiftUI

struct BinaryInputView: View {
    @Binding var index: Int

    private let bitValues = [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1]

    var body: some View {
        VStack {
            Text("Index: \(index)").font(.headline)
            HStack(spacing: 10) {
                ForEach(bitValues, id: \.self) { value in
                    VStack {
                        Text("\(value)").font(.caption)
                        Button(action: { toggleBit(value) }) {
                            Circle()
                                .fill(isBitSet(value) ? Color.blue : Color.gray.opacity(0.5))
                                .frame(width: 30, height: 30)
                        }
                    }
                }
            }
        }
    }

    private func isBitSet(_ bit: Int) -> Bool {
        (index & bit) != 0
    }

    private func toggleBit(_ bit: Int) {
        if isBitSet(bit) {
            index &= ~bit
        } else {
            index |= bit
        }
    }
}
