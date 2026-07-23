import SwiftUI

struct TextEntryScreen: View {
    @State private var text = ""

    var body: some View {
        VStack(spacing: 40) {
            TextField("Fixture Field", text: $text)
            Text("Entered: \(text)")
        }
        .padding(80)
        .navigationTitle("Text Entry")
    }
}
