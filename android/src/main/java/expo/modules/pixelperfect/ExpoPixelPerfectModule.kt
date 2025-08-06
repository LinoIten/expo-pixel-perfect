package expo.modules.pixelperfect
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.util.Log
import android.view.View

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
            
            // Support multiple number types for scale
            Prop("scale") { view: ExpoPixelPerfectView, scale: Int ->
                view.setScale(scale.toFloat())
            }
            
            Prop("scale") { view: ExpoPixelPerfectView, scale: Float ->
                view.setScale(scale)
            }
            
            Prop("scale") { view: ExpoPixelPerfectView, scale: Double ->
                view.setScale(scale.toFloat())
            }
            
            // Render mode prop
            Prop("android_renderMode") { view: ExpoPixelPerfectView, mode: String ->
                view.setRenderMode(mode)
            }
            
            // Add scale mode prop
            Prop("scaleMode") { view: ExpoPixelPerfectView, mode: String ->
                view.setScaleMode(mode)
            }
        }
    }
}