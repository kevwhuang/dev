import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation

let arguments = CommandLine.arguments
let failure: Int32 = 1
let usage: Int32 = 64

guard arguments.count == 8 else {
    exit(usage)
}

let input = URL(fileURLWithPath: arguments[1])
let output = URL(fileURLWithPath: arguments[2])

guard let cropHeight = Double(arguments[4]),
      let cropWidth = Double(arguments[5]),
      let quality = Double(arguments[3]),
      let targetHeight = Double(arguments[6]),
      let targetWidth = Double(arguments[7])
else {
    exit(usage)
}

func transformed(_ image: CIImage) -> CIImage? {
    var result = image

    if cropHeight > 0 {
        let region = CGRect(
            x: 0,
            y: result.extent.height - cropHeight,
            width: cropWidth,
            height: cropHeight
        )

        let shift = CGAffineTransform(
            translationX: 0,
            y: cropHeight - result.extent.height
        )

        result = result.cropped(to: region).transformed(by: shift)
    }

    if targetHeight > 0 {
        let scaler = CIFilter.lanczosScaleTransform()

        scaler.aspectRatio = 1
        scaler.inputImage = result
        scaler.scale = Float(targetHeight / result.extent.height)

        guard let scaled = scaler.outputImage else {
            return nil
        }

        let frame = CGRect(x: 0, y: 0, width: targetWidth, height: targetHeight)

        result = scaled.cropped(to: frame)

        guard result.extent.width == targetWidth,
              result.extent.height == targetHeight
        else {
            return nil
        }
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
