import OSLog
import SwiftUI

enum FixtureScreen: String {
    case list
    case text
    case alert
    case animation
}

@main
struct AdtvFixtureApp: App {
    @State private var screen: FixtureScreen?

    var body: some Scene {
        WindowGroup {
            RootListScreen(screen: $screen)
                .onOpenURL { url in
                    Logger(subsystem: "com.akitorahayashi.adtv-fixture", category: "deeplink")
                        .log("adtv-fixture deep-link: \(url.absoluteString, privacy: .public)")
                    print("adtv-fixture deep-link: \(url.absoluteString)")
                    screen = (url.host).flatMap(FixtureScreen.init(rawValue:))
                }
        }
    }
}
