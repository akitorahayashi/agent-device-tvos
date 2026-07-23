import SwiftUI

struct LongListScreen: View {
    var body: some View {
        List(1...100, id: \.self) { index in
            Button("Row \(index)") {}
        }
        .navigationTitle("Long List")
    }
}
