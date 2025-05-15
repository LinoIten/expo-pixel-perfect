import ExpoModulesCore
import UIKit

public class ExpoPixelPerfectModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoPixelPerfect")
       
        View(ExpoPixelPerfectView.self) {
            Prop("path") { (view: ExpoPixelPerfectView, value: String) in
                view.loadImageFromPath(value)
            }
            
            Prop("base64") { (view: ExpoPixelPerfectView, base64: String) in
                view.loadImageFromBase64(base64)
            }
           
            Prop("scale") { (view: ExpoPixelPerfectView, value: Int) in
                view.scale = value
            }
            
            Prop("ios_renderMode") { (view: ExpoPixelPerfectView, mode: String) in
                view.setRenderMode(mode)
            }
            
            Prop("scaleMode") { (view: ExpoPixelPerfectView, mode: String) in
                view.setScaleMode(mode)
            }
        }
    }
}