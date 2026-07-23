import SwiftUI

struct RootListScreen: View {
    @Binding var screen: FixtureScreen?

    var body: some View {
        NavigationStack {
            List {
                NavigationLink("Long List") { LongListScreen() }
                NavigationLink("Text Entry") { TextEntryScreen() }
                NavigationLink("Alert") { AlertScreen() }
                NavigationLink("Animation") { AnimationScreen() }
            }
            .navigationTitle("AdtvFixture Root")
            .navigationDestination(item: $screen) { screen in
                switch screen {
                case .list: LongListScreen()
                case .text: TextEntryScreen()
                case .alert: AlertScreen()
                case .animation: AnimationScreen()
                }
            }
        }
    }
}
