//
//  ContentView.swift
//  We us
//
//  Created by Evan Lee on 7/16/25.
//

import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 1
    var body: some View {
            TabView(selection: $selectedTab) {
                MeetView()
                    .tabItem {
                        Label("Meet", systemImage: "person.2.fill")
                    }
                    .tag(0)
                
                GameView()
                    .tabItem {
                        Label("Game", systemImage: "gamecontroller.fill")
                    }
                    .tag(1)

                MoodView()
                    .tabItem {
                        Label("Mood", systemImage: "face.smiling.fill")
                    }
                    .tag(2)
                
                FootprintView()
                    .tabItem {
                        Label("Footprint", systemImage: "figure.walk")
                    }
                    .tag(3)
                MoreView()
                    .tabItem {
                        Label("More", systemImage: "ellipsis")
                    }
                    .tag(4)
            }
            .onChange(of: selectedTab) { oldValue, newValue in
                let generator = UIImpactFeedbackGenerator(style: .light)
                generator.impactOccurred()
            }
        }
}

#Preview {
    ContentView()
}
