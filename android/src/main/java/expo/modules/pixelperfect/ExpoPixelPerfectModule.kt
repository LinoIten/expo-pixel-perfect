
package expo.modules.pixelperfect

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.util.Log

class ExpoPixelPerfectModule : Module() {
    private val TAG = "PixelPerfect"
    
    override fun definition() = ModuleDefinition {
        Name("ExpoPixelPerfect")
        
        View(ExpoPixelPerfectView::class) {
            Prop("path") { view: ExpoPixelPerfectView, path: String ->
                view.loadImageFromPath(path)
            }
                
            Prop("base64") { view: ExpoPixelPerfectView, base64: String ->
                view.loadImageFromBase64(base64)
            }
            
            Prop("scale") { view: ExpoPixelPerfectView, scale: Int ->
                view.setScale(scale)
            }
            
        }
    }
}