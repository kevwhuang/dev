import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation

let arguments = CommandLine.arguments
let failure: Int32 = 1
let usage: Int32 = 64

guard arguments.count == 7 else {
    exit(usage)
}

let input = URL(fileURLWithPath: arguments[1])
let output = URL(fileURLWithPath: arguments[2])

guard let offsetTop = Double(arguments[6]),
      let quality = Double(arguments[3]),
      let targetHeight = Double(arguments[5]),
      let targetWidth = Double(arguments[4])
else {
    exit(usage)
}

func transformed(_ image: CIImage) -> CIImage? {
    let scaler = CIFilter.lanczosScaleTransform()

    scaler.aspectRatio = 1
    scaler.inputImage = image
    scaler.scale = Float(targetWidth / image.extent.width)

    guard let scaled = scaler.outputImage else {
        return nil
    }

    let available = scaled.extent.height - targetHeight

    guard available >= 0 else {
        return nil
    }

    let offset = min(max(offsetTop, 0), available)

    let region = CGRect(
        x: scaled.extent.minX,
        y: scaled.extent.minY + available - offset,
        width: targetWidth,
        height: targetHeight
    )

    let frame = CGRect(x: 0, y: 0, width: targetWidth, height: targetHeight)

    let result = scaled
        .cropped(to: region)
        .transformed(by: CGAffineTransform(translationX: -region.minX, y: -region.minY))
        .cropped(to: frame)

    guard result.extent.width == targetWidth,
          result.extent.height == targetHeight
    else {
        return nil
    }

    return result.settingProperties([:])
}

guard let data = try? Data(contentsOf: input),
      let hdr = CIImage(data: data, options: [.applyOrientationProperty: true, .expandToHDR: true]),
      let sdr = CIImage(data: data, options: [.applyOrientationProperty: true])
else {
    exit(failure)
}

guard let base = transformed(sdr) else {
    exit(failure)
}

guard let colorSpace = sdr.colorSpace ?? CGColorSpace(name: CGColorSpace.sRGB) else {
    exit(failure)
}

var options: [CIImageRepresentationOption: Any] = [
    kCGImageDestinationLossyCompressionQuality as CIImageRepresentationOption: quality,
]

if hdr.contentHeadroom > 1 {
    guard let boosted = transformed(hdr) else {
        exit(failure)
    }

    options[.hdrImage] = boosted
}

do {
    try CIContext().writeJPEGRepresentation(
        of: base,
        to: output,
        colorSpace: colorSpace,
        options: options
    )
} catch {
    exit(failure)
}
