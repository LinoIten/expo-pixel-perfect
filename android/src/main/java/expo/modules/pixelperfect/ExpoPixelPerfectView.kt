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
    
    fun setScale(newScale: Int) {
        scale = newScale
        currentBitmap?.let { applyScaling(it) }
    }

    private fun applyScaling(bitmap: Bitmap) {
        if (bitmap.isRecycled) {
            Log.w(TAG, "Source bitmap is recycled, skipping scaling")
            return
        }
        
        Log.d(TAG, "Scaling image by factor: $scale, renderMode: $renderMode, scaleMode: $scaleMode")
        
        val targetWidth = (bitmap.width * scale).toInt()
        val targetHeight = (bitmap.height * scale).toInt()
        
        val displayBitmap = when {
            scale == 1 -> bitmap // No scaling needed
            scaleMode == "fractional" -> scaleWithFractionalOptimized(bitmap, scale)
            else -> createScaledBitmap(bitmap, targetWidth, targetHeight, false)
        }
        
        // Simple null check and set - let GC handle cleanup
        displayBitmap?.let { 
            if (!it.isRecycled) {
                imageView.setImageBitmap(it)
            }
        }
    }
    
    private fun scaleWithFractionalOptimized(bitmap: Bitmap, scale: Int): Bitmap? {
        if (bitmap.isRecycled) return null
        
        return try {
            val targetWidth = bitmap.width * scale
            val targetHeight = bitmap.height * scale
            val tempWidth = targetWidth * 6
            val tempHeight = targetHeight * 6
            val config = bitmap.config ?: Bitmap.Config.ARGB_8888
            
            val largeBitmap = createScaledBitmap(
                bitmap, tempWidth.toInt(), tempHeight.toInt(), false
            )
            
            val finalBitmap = Bitmap.createBitmap(
                targetWidth.toInt(), targetHeight.toInt(), config
            )
            
            val canvas = Canvas(finalBitmap)
            val paint = Paint().apply {
                isFilterBitmap = true
                isDither = false
                isAntiAlias = false
            }
            
            canvas.drawBitmap(
                largeBitmap, null, 
                android.graphics.Rect(0, 0, finalBitmap.width, finalBitmap.height), 
                paint
            )
            
            // Let GC handle largeBitmap cleanup naturally
            finalBitmap
        } catch (e: Exception) {
            Log.e(TAG, "Error in fractional scaling: ${e.message}", e)
            // Fallback to standard scaling
            createScaledBitmap(bitmap, (bitmap.width * scale).toInt(), (bitmap.height * scale).toInt(), false)
        }
    }

    private fun loadImage() {
        val path = currentPath ?: return
        try {
            val cleanPath = path.replace("file://", "")
            val bitmap = BitmapFactory.decodeFile(
                cleanPath, 
                BitmapFactory.Options().apply { inScaled = false }
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
        currentPath?.let { loadImage() }
    }
    
    // No manual cleanup needed - let GC handle it
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        // Just clear references, let GC do the work
        currentBitmap = null
        imageView.setImageBitmap(null)
    }
}