package expo.modules.pixelperfect

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Paint
import android.view.View
import android.widget.ImageView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import android.util.Log
import android.graphics.Bitmap.createScaledBitmap
import android.view.ViewGroup.LayoutParams
import android.widget.FrameLayout
import android.util.Base64

class ExpoPixelPerfectView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private val TAG = "PixelPerfect"
    private val imageView: ImageView
    private var scale: Int = 1
    private var currentPath: String? = null
    private var currentBitmap: Bitmap? = null
    private var renderMode: String = "hardware" // Default to hardware for performance
    
    init {
        imageView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
            layoutParams = FrameLayout.LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT
            )
            isDrawingCacheEnabled = true
        }
        addView(imageView)
        
        // Set initial render mode
        applyRenderMode()
    }
    
    fun setRenderMode(mode: String) {
        renderMode = mode
        applyRenderMode()
        
        // Re-apply scaling with new render mode
        currentBitmap?.let { applyScaling(it) }
    }
    
    private fun applyRenderMode() {
        val isSoftware = renderMode == "software"
        imageView.setLayerType(
            if (isSoftware) View.LAYER_TYPE_SOFTWARE else View.LAYER_TYPE_HARDWARE,
            null
        )
    }
    
    fun loadImageFromPath(path: String) {
        currentPath = path
        loadImage()
    }
    
    fun loadImageFromBase64(base64Data: String) {
        Log.d(TAG, "Loading image from base64, length: ${base64Data.length}")
        
        try {
            // Remove data:image/png;base64, prefix if present
            val pureBase64 = if (base64Data.contains(",")) {
                base64Data.split(",")[1]
            } else {
                base64Data
            }
            
            // Decode base64 to byte array
            val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
            
            // Create bitmap from byte array
            val bitmap = BitmapFactory.decodeByteArray(
                decodedBytes, 0, decodedBytes.size,
                BitmapFactory.Options().apply {
                    inScaled = false
                }
            )
            
            if (bitmap != null) {
                // Store the original bitmap for scaling
                currentBitmap = bitmap
                
                // Apply scaling
                applyScaling(bitmap)
            } else {
                Log.e(TAG, "Failed to decode base64 to bitmap")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading image from base64: ${e.message}", e)
        }
    }
    
    fun setScale(newScale: Int) {
        scale = newScale
        // Re-apply scaling if we have a bitmap
        currentBitmap?.let { applyScaling(it) }
    }

    private fun applyScaling(bitmap: Bitmap) {
        // Create scaled bitmap if necessary
        val displayBitmap = if (scale != 1) {
            // Use createScaledBitmap with nearest neighbor
            createScaledBitmap(
                bitmap,
                bitmap.width * scale,
                bitmap.height * scale,
                false  // false = nearest neighbor (no filtering)
            )
        } else {
            bitmap
        }
        
        // Set the image
        imageView.setImageBitmap(displayBitmap)
        
        // Only recycle if we created a new bitmap and it's not our current bitmap
        if (displayBitmap != bitmap && displayBitmap != currentBitmap) {
            bitmap.recycle()
        }
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
                // Store the original bitmap for scaling
                currentBitmap = bitmap
                
                // Apply scaling
                applyScaling(bitmap)
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