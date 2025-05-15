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
    private var renderMode: String = "hardware"
    private var scaleMode: String = "nearest"
    
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
    
    fun setScaleMode(mode: String) {
        scaleMode = mode
        // Re-apply scaling if we have a bitmap
        currentBitmap?.let { applyScaling(it) }
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
        // Determine if we have an integer scale
        val intScale = scale.toInt()
        val isIntegerScale = intScale.toFloat() == scale.toFloat()
        
        // Choose scaling method based on scaleMode and whether we have an integer scale
        val displayBitmap = if (scale != 1) {
            when {
                // For integer scales or when using nearest neighbor mode, use simple scaling
                isIntegerScale || scaleMode == "nearest" -> {
                    createScaledBitmap(
                        bitmap,
                        bitmap.width * scale,
                        bitmap.height * scale,
                        false // nearest neighbor
                    )
                }
                // For fractional scales with optimized mode
                scaleMode == "fractional-optimized" -> {
                    // Multi-step scaling for fractional scales
                    scaleWithFractionalOptimized(bitmap, scale)
                }
                // Fallback to simple scaling
                else -> {
                    createScaledBitmap(
                        bitmap,
                        bitmap.width * scale,
                        bitmap.height * scale,
                        false // nearest neighbor
                    )
                }
            }
        } else {
            bitmap
        }
        
        // Set the image
        imageView.setImageBitmap(displayBitmap)
        
        // Clean up if needed
        if (displayBitmap != bitmap && displayBitmap != currentBitmap) {
            bitmap.recycle()
        }
    }

    private fun scaleWithFractionalOptimized(bitmap: Bitmap, scale: Int): Bitmap {
        // For fractional scaling, use a multi-step process
        try {
            // 1. Scale to a much larger size first (6x the target)
            val tempWidth = (bitmap.width * scale * 6).toInt()
            val tempHeight = (bitmap.height * scale * 6).toInt()
            
            val config = bitmap.config ?: Bitmap.Config.ARGB_8888
            
            val largeBitmap = createScaledBitmap(
                bitmap,
                tempWidth,
                tempHeight,
                false // nearest neighbor
            )
            
            // 2. Then scale back down to the exact target size
            val finalBitmap = Bitmap.createBitmap(
                (bitmap.width * scale).toInt(),
                (bitmap.height * scale).toInt(),
                config
            )
            
            val canvas = Canvas(finalBitmap)
            val paint = Paint().apply {
                isFilterBitmap = true // Enable filtering for downscaling
                isDither = false      // Disable dithering
                isAntiAlias = false   // Disable anti-aliasing
            }
            
            canvas.drawBitmap(largeBitmap, null, 
                Rect(0, 0, finalBitmap.width, finalBitmap.height), paint)
            
            // Clean up the large temporary bitmap
            largeBitmap.recycle()
            
            return finalBitmap
        } catch (e: Exception) {
            Log.e(TAG, "Error in fractional scaling: ${e.message}", e)
            // Fallback to standard scaling
            return createScaledBitmap(
                bitmap,
                (bitmap.width * scale).toInt(),
                (bitmap.height * scale).toInt(),
                false
            )
        }
    }

    private fun loadImage() {
        val path = currentPath ?: return
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