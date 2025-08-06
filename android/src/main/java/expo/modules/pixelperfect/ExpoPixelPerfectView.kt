package expo.modules.pixelperfect

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.widget.ImageView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import android.util.Log
import android.graphics.Bitmap.createScaledBitmap
import android.view.View
import android.view.ViewGroup.LayoutParams
import android.widget.FrameLayout
import android.util.Base64
import kotlin.math.roundToInt

class ExpoPixelPerfectView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private val TAG = "PixelPerfect"
    private val imageView: ImageView
    private var scale: Float = 1f // Changed to Float to support fractional values
    private var currentPath: String? = null
    private var currentBitmap: Bitmap? = null
    private var renderMode: String = "hardware"
    private var scaleMode: String = "nearest"
    
    init {
        imageView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.FIT_XY
            layoutParams = FrameLayout.LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT
            )
        }
        addView(imageView)
        applyRenderMode()
    }
    
    fun setScaleMode(mode: String) {
        scaleMode = mode
        currentBitmap?.let { applyScaling(it) }
    }
    
    fun setRenderMode(mode: String) {
        renderMode = mode
        applyRenderMode()
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
        try {
            val pureBase64 = if (base64Data.contains(",")) {
                base64Data.split(",")[1]
            } else {
                base64Data
            }
            
            val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
            val bitmap = BitmapFactory.decodeByteArray(
                decodedBytes, 0, decodedBytes.size,
                BitmapFactory.Options().apply { inScaled = false }
            )
            
            if (bitmap != null) {
                currentBitmap = bitmap
                applyScaling(bitmap)
            } else {
                Log.e(TAG, "Failed to decode base64 to bitmap")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading image from base64: ${e.message}", e)
        }
    }
    
    // Updated to accept Float values
    fun setScale(newScale: Float) {
        scale = newScale
        currentBitmap?.let { applyScaling(it) }
    }
    
    // Backward compatibility for Int values
    fun setScale(newScale: Int) {
        scale = newScale.toFloat()
        currentBitmap?.let { applyScaling(it) }
    }

    private fun applyScaling(bitmap: Bitmap) {
        if (bitmap.isRecycled) {
            return
        }
        
        val targetWidth = (bitmap.width * scale).roundToInt()
        val targetHeight = (bitmap.height * scale).roundToInt()
        
        val displayBitmap = when {
            scale == 1f -> bitmap // No scaling needed
            scaleMode == "fractional" -> scaleWithFractionalOptimized(bitmap, scale)
            else -> createScaledBitmap(bitmap, targetWidth, targetHeight, false)
        }
        
        // Simple null check and set - let GC handle cleanup
        displayBitmap?.let { 
            if (!it.isRecycled) {
                imageView.setImageBitmap(it)
            } else {
                Log.w(TAG, "Display bitmap is recycled, not setting")
            }
        } ?: Log.w(TAG, "Display bitmap is null")
    }
    
    private fun scaleWithFractionalOptimized(bitmap: Bitmap, scaleValue: Float): Bitmap? {
        if (bitmap.isRecycled) return null
        
        return try {
            val targetWidth = (bitmap.width * scaleValue).roundToInt()
            val targetHeight = (bitmap.height * scaleValue).roundToInt()
            val config = bitmap.config ?: Bitmap.Config.ARGB_8888
            
            // Create the final bitmap with exact target dimensions
            val finalBitmap = Bitmap.createBitmap(targetWidth, targetHeight, config)
            val canvas = Canvas(finalBitmap)
            
            // Use nearest neighbor scaling for pixel-perfect results
            val paint = Paint().apply {
                isFilterBitmap = false  // Critical: disables bilinear filtering
                isAntiAlias = false     // No antialiasing for sharp pixels
                isDither = false        // No dithering
            }
            
            // Scale the canvas to the exact fractional scale
            canvas.scale(scaleValue, scaleValue)
            canvas.drawBitmap(bitmap, 0f, 0f, paint)
            
            finalBitmap
        } catch (e: Exception) {
            Log.e(TAG, "Error in fractional scaling: ${e.message}", e)
            // Fallback to standard scaling without filtering
            val targetWidth = (bitmap.width * scaleValue).roundToInt()
            val targetHeight = (bitmap.height * scaleValue).roundToInt()
            createScaledBitmap(bitmap, targetWidth, targetHeight, false)
        }
    }

    private fun loadImage() {
        val path = currentPath ?: return
        try {
            val cleanPath = path.replace("file://", "")
            val bitmap = BitmapFactory.decodeFile(
                cleanPath, 
                BitmapFactory.Options().apply { 
                    inScaled = false 
                    inDither = false  // Prevent dithering during load
                    inPreferredConfig = Bitmap.Config.ARGB_8888
                }
            )
            
            if (bitmap != null) {
                currentBitmap = bitmap
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
        
        // Force reload the image when reattaching
        if (currentPath != null) {
            loadImage()
        } else if (currentBitmap != null) {
            // If we have a bitmap but no path (base64 case), reapply scaling
            applyScaling(currentBitmap!!)
        }
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        // Don't clear currentBitmap - we want to keep it for when we reattach
        // Only clear the ImageView to free up immediate display memory
        imageView.setImageBitmap(null)
    }
}