package expo.modules.pixelperfect

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.widget.ImageView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import android.util.Log
import android.graphics.Bitmap.createScaledBitmap
import android.view.ViewGroup.LayoutParams
import android.widget.FrameLayout

class ExpoPixelPerfectView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private val TAG = "PixelPerfect"
    private val imageView: ImageView
    private var scale: Int = 1
    private var currentPath: String? = null
    private var currentBitmap: Bitmap? = null
    
    init {
        imageView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
            layoutParams = FrameLayout.LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT
            )
        }
        addView(imageView)
    }
    
    fun loadImageFromPath(path: String) {
        currentPath = path
        loadImage()
    }
    
    fun setScale(newScale: Int) {
        scale = newScale
        loadImage()
    }
    
    private fun loadImage() {
        val path = currentPath ?: return
        Log.d(TAG, "Loading image from: $path with scale: $scale")
        
        try {
            val cleanPath = path.replace("file://", "")
            val bitmap = BitmapFactory.decodeFile(cleanPath, BitmapFactory.Options().apply {
                inScaled = false
            })
            
            if (bitmap != null) {
                // Create scaled bitmap if necessary
                val displayBitmap = if (scale != 1) {
                    createScaledBitmap(
                        bitmap,
                        bitmap.width * scale,
                        bitmap.height * scale,
                        false  // nearest neighbor
                    )
                } else {
                    bitmap
                }
                
                // Keep reference to current bitmap (for potential cleanup later)
                currentBitmap = displayBitmap
                
                // Set the image
                imageView.setImageBitmap(displayBitmap)
                
                // Only recycle if we created a new bitmap
                if (displayBitmap != bitmap) {
                    bitmap.recycle()
                }
            } else {
                Log.e(TAG, "Failed to load image")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading image: ${e.message}", e)
        }
    }
    
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        imageView.layout(0, 0, right - left, bottom - top)
    }
    
    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        // Reload image when view is attached
        if (currentPath != null) {
            loadImage()
        }
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        // Don't recycle bitmap here - it might cause issues
        // Let the garbage collector handle it
    }
}