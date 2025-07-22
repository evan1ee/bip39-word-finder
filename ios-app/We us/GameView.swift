//
//  MeetView.swift
//  Weus
//
//  Created by Evan Lee on 7/15/25.
//

// GameView.swift
import SwiftUI
import CoreHaptics

struct GameView: View {
    @Environment(\.scenePhase) private var scenePhase
    @State private var diceValue: Int = 1
    @State private var isRolling: Bool = false
    @State private var timer: Timer?
    @State private var engine: CHHapticEngine?

    var body: some View {
        VStack(spacing: 40) {
            Spacer()
            
            // Dice Face
            DiceFaceView(value: diceValue)
                .frame(width: 200, height: 200)
                .scaleEffect(isRolling ? 1.1 : 1.0)
                .rotationEffect(.degrees(isRolling ? 20 : 0))
                .animation(.easeInOut(duration: 0.2).repeatCount(isRolling ? .max : 0, autoreverses: true), value: isRolling)
            
            Spacer()
            
            Text("Shake your phone to roll the dice")
                .font(.subheadline)
                .foregroundColor(.gray)
                .padding(.bottom, 10) // Add spacing above the tab bar
        }
        .padding()
        .onAppear(perform: prepareHaptics)
        .onReceive(NotificationCenter.default.publisher(for: .deviceDidShakeNotification)) { _ in
            rollDice()
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .active {
                prepareHaptics() // Re-initialize when returning from background
            }
        }
    }

    func rollDice() {
        guard !isRolling else { return }

        isRolling = true
        var count = 0

        // Start rolling with timer
        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { t in
            diceValue = Int.random(in: 1...6)
            triggerRollingHaptic() // NEW: feedback during rolling
            count += 1

            if count >= 20 {
                t.invalidate()
                isRolling = false
                triggerStrongHaptic()
            }
        }
    }

    func prepareHaptics() {
        do {
            engine = try CHHapticEngine()
            try engine?.start()
        } catch {
            print("Haptics not supported: \(error.localizedDescription)")
        }
    }

    func triggerRollingHaptic() {
        let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.3)
        let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.3)
        let event = CHHapticEvent(eventType: .hapticTransient, parameters: [intensity, sharpness], relativeTime: 0)

        do {
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try engine?.makePlayer(with: pattern)
            try player?.start(atTime: 0)
        } catch {
            print("Rolling haptic failed: \(error.localizedDescription)")
        }
    }

    func triggerHaptic() {
        let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 1)
        let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 1)
        let event = CHHapticEvent(eventType: .hapticTransient, parameters: [intensity, sharpness], relativeTime: 0)

        do {
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try engine?.makePlayer(with: pattern)
            try player?.start(atTime: 0)
        } catch {
            print("Failed to play haptic: \(error.localizedDescription)")
        }
    }

    func triggerStrongHaptic() {
        let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0)
        let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.9)
        let event1 = CHHapticEvent(eventType: .hapticTransient, parameters: [intensity, sharpness], relativeTime: 0)
        let event2 = CHHapticEvent(eventType: .hapticTransient, parameters: [intensity, sharpness], relativeTime: 0.1)
        let event3 = CHHapticEvent(eventType: .hapticTransient, parameters: [intensity, sharpness], relativeTime: 0.2)

        do {
            let pattern = try CHHapticPattern(events: [event1, event2, event3], parameters: [])
            let player = try engine?.makePlayer(with: pattern)
            try player?.start(atTime: 0)
        } catch {
            print("Strong haptic failed: \(error.localizedDescription)")
        }
    }
}

struct DotPosition: Hashable {
    let x: CGFloat
    let y: CGFloat
}

struct DiceFaceView: View {
    let value: Int

    var body: some View {
        GeometryReader { geometry in
            let size = min(geometry.size.width, geometry.size.height)
            let dotSize = size * 0.2

            ZStack {
                // Dice background
                RoundedRectangle(cornerRadius: size * 0.2)
                    .fill(Color.white)
                    .shadow(radius: 10)

                // Dice dots
                ForEach(dotPositions(for: value), id: \.self) { pos in
                    Circle()
                        .fill(Color.black)
                        .frame(width: dotSize, height: dotSize)
                        .position(x: pos.x * size, y: pos.y * size)
                }
            }
        }
    }

    func dotPositions(for value: Int) -> [DotPosition] {
        switch value {
        case 1: return [DotPosition(x: 0.5, y: 0.5)]
        case 2: return [DotPosition(x: 0.25, y: 0.25), DotPosition(x: 0.75, y: 0.75)]
        case 3: return [DotPosition(x: 0.25, y: 0.25), DotPosition(x: 0.5, y: 0.5), DotPosition(x: 0.75, y: 0.75)]
        case 4: return [DotPosition(x: 0.25, y: 0.25), DotPosition(x: 0.25, y: 0.75),
                        DotPosition(x: 0.75, y: 0.25), DotPosition(x: 0.75, y: 0.75)]
        case 5: return [DotPosition(x: 0.25, y: 0.25), DotPosition(x: 0.25, y: 0.75),
                        DotPosition(x: 0.5, y: 0.5),
                        DotPosition(x: 0.75, y: 0.25), DotPosition(x: 0.75, y: 0.75)]
        case 6: return [DotPosition(x: 0.25, y: 0.25), DotPosition(x: 0.25, y: 0.5), DotPosition(x: 0.25, y: 0.75),
                        DotPosition(x: 0.75, y: 0.25), DotPosition(x: 0.75, y: 0.5), DotPosition(x: 0.75, y: 0.75)]
        default: return []
        }
    }
}

extension UIWindow {
    open override func motionEnded(_ motion: UIEvent.EventSubtype, with event: UIEvent?) {
        super.motionEnded(motion, with: event)
        if motion == .motionShake {
            NotificationCenter.default.post(name: .deviceDidShakeNotification, object: nil)
        }
    }
}

extension Notification.Name {
    static let deviceDidShakeNotification = Notification.Name("deviceDidShakeNotification")
}
