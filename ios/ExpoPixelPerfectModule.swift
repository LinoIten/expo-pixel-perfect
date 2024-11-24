
import ExpoModulesCore
import UIKit

public class ExpoPixelPerfectModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoPixelPerfect")
        
        View(ExpoPixelPerfectView.self) {
            Prop("path") { (view: ExpoPixelPerfectView, value: String) in
                view.loadImageFromPath(value)
            }
            
            Prop("scale") { (view: ExpoPixelPerfectView, value: Int) in
                view.scale = value
            }
        }
    }
}
