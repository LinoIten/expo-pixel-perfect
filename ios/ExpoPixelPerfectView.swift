import ExpoModulesCore
import UIKit

class ExpoPixelPerfectView: ExpoView {
    private var imageView: UIImageView
    private var originalImage: UIImage?
   
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
        let targetSize = CGSize(
            width: image.size.width * CGFloat(scale),
            height: image.size.height * CGFloat(scale)
        )
       
        UIGraphicsBeginImageContextWithOptions(targetSize, false, 1.0)
        defer { UIGraphicsEndImageContext() }
       
        if let context = UIGraphicsGetCurrentContext() {
            // Force nearest neighbor interpolation at all levels
            context.interpolationQuality = .none
            context.setShouldAntialias(false)
            context.setAllowsAntialiasing(false)
           
            image.draw(in: CGRect(origin: .zero, size: targetSize))
           
            if let scaledImage = UIGraphicsGetImageFromCurrentImageContext() {
                imageView.image = scaledImage
            } else {
                NSLog("Failed to create scaled image")
            }
        }
    }
}