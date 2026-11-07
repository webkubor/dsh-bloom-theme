import AppKit
import ApplicationServices
import CoreGraphics

let application = NSRunningApplication.runningApplications(withBundleIdentifier: "com.deepseek.dsh").first
let process = application ?? NSWorkspace.shared.runningApplications.first { $0.localizedName == "DeepSeek Harness" }
guard let process else { fatalError("DSH desktop is not running") }
let root = AXUIElementCreateApplication(process.processIdentifier)
var queue: [AXUIElement] = [root]
var index = 0
var result: [[String: Any]] = []
func value(_ element: AXUIElement, _ attribute: String) -> CFTypeRef? {
  var output: CFTypeRef?
  AXUIElementCopyAttributeValue(element, attribute as CFString, &output)
  return output
}
while index < queue.count && index < 8000 {
  let element = queue[index]
  index += 1
  let role = value(element, kAXRoleAttribute) as? String ?? ""
  let description = value(element, kAXDescriptionAttribute) as? String ?? ""
  if role == "AXTextArea" && (description == "控制台提示" || description == "Console prompt") {
    var point = CGPoint.zero
    var size = CGSize.zero
    if let raw = value(element, kAXPositionAttribute) { AXValueGetValue(raw as! AXValue, .cgPoint, &point) }
    if let raw = value(element, kAXSizeAttribute) { AXValueGetValue(raw as! AXValue, .cgSize, &size) }
    result.append(["kind":"console", "x":point.x,"y":point.y,"width":size.width,"height":size.height])
    break
  }
  if let children = value(element, kAXChildrenAttribute) as? [AXUIElement] { queue.append(contentsOf:children) }
}
let windows = CGWindowListCopyWindowInfo([.excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
for window in windows where (window[kCGWindowOwnerPID as String] as? Int) == Int(process.processIdentifier) {
  if let bounds = window[kCGWindowBounds as String] as? [String: Any], (bounds["Width"] as? Double ?? 0) > 700, (bounds["Height"] as? Double ?? 0) > 500 {
    result.append(["kind":"window", "id":window[kCGWindowNumber as String]!, "bounds":bounds,"onscreen":window[kCGWindowIsOnscreen as String] ?? false])
  }
}
let data = try JSONSerialization.data(withJSONObject:result, options: [.sortedKeys])
print(String(data:data,encoding:.utf8)!)
