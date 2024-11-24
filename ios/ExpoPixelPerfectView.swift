// ios/ExpoPixelPerfectView.swift
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
        NSLog("Loading image from: \(path)")
        let cleanPath = path.replacingOccurrences(of: "file://", with: "")
        if let image = UIImage(contentsOfFile: cleanPath) {
            NSLog("Image loaded, size: \(image.size)")
            originalImage = image
            scaleImage(image)
        } else {
            NSLog("Failed to load image")
        }
    }
    
    private func scaleImage(_ image: UIImage) {
        NSLog("Scaling image by factor: \(scale)")
        
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
                NSLog("Successfully scaled image to: \(targetSize)")
                imageView.image = scaledImage
            } else {
                NSLog("Failed to create scaled image")
            }
        }
    }
}
