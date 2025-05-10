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
    private var pendingPath: String? = null
    private var originalBitmap: Bitmap? = null
    private var scaledBitmap: Bitmap? = null
    
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
        pendingPath = path
        loadPendingImage()
    }
    
    fun setScale(newScale: Int) {
        scale = newScale
        loadPendingImage()
    }
    
    private fun loadPendingImage() {
        val path = pendingPath ?: return
        Log.d(TAG, "Loading image from: $path with scale: $scale")
        
        try {
            // Clean up previous bitmaps
            cleanupBitmaps()
            
            val cleanPath = path.replace("file://", "")
            val bitmap = BitmapFactory.decodeFile(cleanPath, BitmapFactory.Options().apply {
                inScaled = false
            })
            
            if (bitmap != null) {
                originalBitmap = bitmap
                
                // Create scaled bitmap if necessary
                scaledBitmap = if (scale != 1) {
                    createScaledBitmap(
                        bitmap,
                        bitmap.width * scale,
                        bitmap.height * scale,
                        false  // nearest neighbor
                    )
                } else {
                    bitmap
                }
                
                // Set the image
                imageView.setImageBitmap(scaledBitmap)
            } else {
                Log.e(TAG, "Failed to load image")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading image: ${e.message}", e)
        }
    }
    
    private fun cleanupBitmaps() {
        // Clear the ImageView first
        imageView.setImageBitmap(null)
        
        // Now recycle bitmaps
        if (scaledBitmap != null && scaledBitmap != originalBitmap && !scaledBitmap!!.isRecycled) {
            scaledBitmap!!.recycle()
        }
        scaledBitmap = null
        
        if (originalBitmap != null && !originalBitmap!!.isRecycled) {
            originalBitmap!!.recycle()
        }
        originalBitmap = null
    }
    
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        imageView.layout(0, 0, right - left, bottom - top)
    }
    
    // Clean up when view is destroyed
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        cleanupBitmaps()
    }
}