import SwiftUI

struct AnimationScreen: View {
    var body: some View {
        TimelineView(.animation) { context in
            let angle = context.date.timeIntervalSinceReferenceDate
                .truncatingRemainder(dividingBy: 2) * 180
            RoundedRectangle(cornerRadius: 40)
                .fill(.blue)
                .frame(width: 300, height: 300)
                .rotationEffect(.degrees(angle))
        }
        .navigationTitle("Animation")
    }
}
