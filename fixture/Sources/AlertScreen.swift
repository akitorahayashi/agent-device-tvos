import SwiftUI

struct AlertScreen: View {
    @State private var showsAlert = false
    @State private var result = "No result"

    var body: some View {
        VStack(spacing: 40) {
            Button("Show Alert") { showsAlert = true }
            Text(result)
        }
        .navigationTitle("Alert")
        .alert("Fixture Alert", isPresented: $showsAlert) {
            Button("OK") { result = "Accepted" }
            Button("Cancel", role: .cancel) { result = "Dismissed" }
        } message: {
            Text("Choose OK or Cancel")
        }
    }
}
