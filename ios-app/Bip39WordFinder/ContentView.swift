
import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            WordFinderView()
                .tabItem {
                    Image(systemName: "magnifyingglass")
                    Text("Word Finder")
                }
                .tag(0)

            MnemonicView()
                .tabItem {
                    Image(systemName: "list.bullet.rectangle")
                    Text("Mnemonic")
                }
                .tag(1)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
