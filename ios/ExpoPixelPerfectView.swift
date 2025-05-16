import ExpoModulesCore
import UIKit
import CoreImage

class ExpoPixelPerfectView: ExpoView {
    private var imageView: UIImageView
    private var originalImage: UIImage?
    private var renderMode: String = "hardware"
    private var scaleMode: String = "nearest"  
   
    var scale: Int = 1 {
        didSet {
            NSLog("Scale changed to: \(scale)")
            if let image = originalImage {
                scaleImage(image)
            }
        }
    }
   
    required init(appContext: AppContext? = nil) {
        imageView = UIImageView()
        super.init(appContext: appContext)
        addSubview(imageView)
       
        // Make sure image view doesn't do any of its own scaling
        imageView.contentMode = .scaleToFill
        
        // Apply initial render mode settings
        applyRenderMode()
    }
    
    func setRenderMode(_ mode: String) {
        renderMode = mode
        applyRenderMode()
        
        // Re-scale the image if we have one
        if let image = originalImage {
            scaleImage(image)
        }
    }

    func setScaleMode(_ mode: String) {
        scaleMode = mode
        
        // Re-scale the image if we have one
        if let image = originalImage {
            scaleImage(image)
        }
    }
    
    
    private func applyRenderMode() {
        // Always use nearest neighbor at the layer level for sharp scaling
        imageView.layer.magnificationFilter = .nearest
        imageView.layer.minificationFilter = .nearest
    }
   
    override func layoutSubviews() {
        super.layoutSubviews()
        imageView.frame = bounds
    }
   
    func loadImageFromPath(_ path: String) {
        let cleanPath = path.replacingOccurrences(of: "file://", with: "")
        if let image = UIImage(contentsOfFile: cleanPath) {
            originalImage = image
            scaleImage(image)
        } else {
            NSLog("Failed to load image")
        }
    }
   
    func loadImageFromBase64(_ base64Data: String) {
        NSLog("Loading image from base64, length: \(base64Data.count)")
       
        // Extract base64 data (remove prefix if present)
        let pureBase64: String
        if base64Data.contains(",") {
            pureBase64 = base64Data.components(separatedBy: ",")[1]
        } else {
            pureBase64 = base64Data
        }
       
        // Convert base64 to Data
        guard let imageData = Data(base64Encoded: pureBase64) else {
            NSLog("Failed to decode base64 data")
            return
        }
       
        // Create UIImage from data
        guard let image = UIImage(data: imageData) else {
            NSLog("Failed to create image from data")
            return
        }
       
        // Store and scale the image
        originalImage = image
        scaleImage(image)
    }

    private func scaleImage(_ image: UIImage) {
        NSLog("Scaling image by factor: \(scale), renderMode: \(renderMode), scaleMode: \(scaleMode)")
        
        let targetSize = CGSize(
            width: image.size.width * CGFloat(scale),
            height: image.size.height * CGFloat(scale)
        )
        
        // Choose the appropriate scaling method based on render mode and scale mode
        if scaleMode == "fractional" {
            // Use software-based rendering (CPU)
            scaleWithFractionalOptimized(image, to: targetSize)
        } else if renderMode == "software" {
            // For fractional scaling (non-integer values), use the optimized approach
            scaleWithCoreGraphics(image, to: targetSize)
        } else {
            // For nearest-neighbor with hardware acceleration, use Core Image
            scaleWithCoreImage(image, to: targetSize)
        }
    }
    
    private func scaleWithCoreGraphics(_ image: UIImage, to size: CGSize) {
        // Software rendering implementation (CPU-based)
        UIGraphicsBeginImageContextWithOptions(size, false, 1.0)
        defer { UIGraphicsEndImageContext() }
       
        if let context = UIGraphicsGetCurrentContext() {
            // Force nearest neighbor interpolation at all levels
            context.interpolationQuality = .none
            context.setShouldAntialias(false)
            context.setAllowsAntialiasing(false)
           
            image.draw(in: CGRect(origin: .zero, size: size))
           
            if let scaledImage = UIGraphicsGetImageFromCurrentImageContext() {
                imageView.image = scaledImage
            } else {
                NSLog("Failed to create scaled image")
            }
        }
    }


    private func scaleWithFractionalOptimized(_ image: UIImage, to targetSize: CGSize) {
        // For fractional scaling, use a multi-step process
        
        // 1. Scale to a much larger size first using nearest neighbor
        let largeSize = CGSize(
            width: targetSize.width * 3,
            height: targetSize.height * 3
        )
        
        // Create the large upscaled image with nearest neighbor
        UIGraphicsBeginImageContextWithOptions(largeSize, false, 0)
        defer { UIGraphicsEndImageContext() }
        
        if let context = UIGraphicsGetCurrentContext() {
            context.interpolationQuality = .none
            context.setShouldAntialias(false)
            
            image.draw(in: CGRect(origin: .zero, size: largeSize))
            
            if let largeImage = UIGraphicsGetImageFromCurrentImageContext() {
                // Now scale back down to the target size with high quality
                UIGraphicsBeginImageContextWithOptions(targetSize, false, 0)
                defer { UIGraphicsEndImageContext() }
                
                if let downscaleContext = UIGraphicsGetCurrentContext() {
                    // Use high quality downsampling
                    downscaleContext.interpolationQuality = .high
                    
                    largeImage.draw(in: CGRect(origin: .zero, size: targetSize))
                    
                    if let finalImage = UIGraphicsGetImageFromCurrentImageContext() {
                        imageView.image = finalImage
                        return
                    }
                }
            }
        }
        
        // Fallback to standard scaling if the multi-step process fails
        if renderMode == "software" {
            scaleWithCoreGraphics(image, to: targetSize)
        } else {
            scaleWithCoreImage(image, to: targetSize)
        }
    }
    private func scaleWithCoreImage(_ image: UIImage, to size: CGSize) {
        // Hardware rendering implementation (GPU-based)
        guard let cgImage = image.cgImage else {
            NSLog("Failed to get CGImage")
            // Fall back to CoreGraphics
            scaleWithCoreGraphics(image, to: size)
            return
        }
        
        let ciImage = CIImage(cgImage: cgImage)
        
        // For nearest-neighbor in Core Image, we'll use the CIAffineClamp filter
        // which respects the CIContext's sampling mode
        guard let affineFilter = CIFilter(name: "CIAffineClamp") else {
            NSLog("Failed to create affine clamp filter")
            scaleWithCoreGraphics(image, to: size)
            return
        }
        
        // Create the transform
        let transform = CGAffineTransform(
            scaleX: size.width / image.size.width,
            y: size.height / image.size.height
        )
        
        // Apply the filter
        affineFilter.setValue(ciImage, forKey: kCIInputImageKey)
        affineFilter.setValue(NSValue(cgAffineTransform: transform), forKey: "inputTransform")
        
        // Get output image
        guard let outputCIImage = affineFilter.outputImage else {
            NSLog("Failed to get output from affine filter")
            scaleWithCoreGraphics(image, to: size)
            return
        }
        
        // Create a CIContext with the appropriate sampling mode
        let options: [CIContextOption: Any]
        if scaleMode == "nearest" {
            options = [
                .useSoftwareRenderer: false,          // Force hardware GPU rendering
                .cacheIntermediates: true,            // Cache for better performance
                .priorityRequestLow: false,           // Use high priority for rendering
                .outputColorSpace: NSNull(),          // Use default color space
                .workingColorSpace: NSNull(),         // Use default working color space
                .outputPremultiplied: true,           // Premultiply alpha
                .highQualityDownsample: false         // Disable high-quality downsampling
            ]
        } else {
            options = [
                .useSoftwareRenderer: false,          // Force hardware GPU rendering
                .cacheIntermediates: true,            // Cache for better performance
                .priorityRequestLow: false,           // Use high priority for rendering
                .highQualityDownsample: true          // Enable high-quality downsampling
            ]
        }
        
        let context = CIContext(options: options)
        
        // Render the image with correct sampling mode
        if let outputCGImage = context.createCGImage(outputCIImage, from: outputCIImage.extent) {
            imageView.image = UIImage(cgImage: outputCGImage)
        } else {
            NSLog("Failed to create scaled image with Core Image")
            // Fall back to CoreGraphics if Core Image fails
            scaleWithCoreGraphics(image, to: size)
        }
    }
}