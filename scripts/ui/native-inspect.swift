import AppKit
import ApplicationServices
import CoreGraphics
import Foundation

func output(_ value: Any, code: Int32 = 0) -> Never {
  let data = try! JSONSerialization.data(withJSONObject: value, options: [.sortedKeys])
  print(String(data: data, encoding: .utf8)!)
  exit(code)
}
func attr(_ e: AXUIElement, _ name: String) -> CFTypeRef? {
  var value: CFTypeRef?
  return AXUIElementCopyAttributeValue(e,name as CFString,&value) == .success ? value : nil
}
func text(_ e: AXUIElement, _ name: String) -> String { attr(e,name) as? String ?? "" }
func actions(_ e: AXUIElement) -> [String] {
  var value: CFArray?
  AXUIElementCopyActionNames(e,&value)
  return value as? [String] ?? []
}
func describe(_ e: AXUIElement) -> [String: Any] {
  var point = CGPoint.zero, size = CGSize.zero
  if let raw = attr(e,kAXPositionAttribute) { AXValueGetValue(raw as! AXValue,.cgPoint,&point) }
  if let raw = attr(e,kAXSizeAttribute) { AXValueGetValue(raw as! AXValue,.cgSize,&size) }
  var data: [String: Any] = ["role":text(e,kAXRoleAttribute),"description":text(e,kAXDescriptionAttribute),"frame":["x":point.x,"y":point.y,"w":size.width,"h":size.height],"actions":actions(e)]
  if text(e,kAXRoleAttribute) == "AXTextArea" {
    data["reportedTextLength"] = text(e,kAXValueAttribute).count
    data["reportedFocused"] = attr(e,kAXFocusedAttribute) as? Bool ?? false
    data["requiresVisualConfirmation"] = true
  }
  if let value = attr(e,kAXValueAttribute) as? NSNumber { data["value"] = value }
  return data
}
guard AXIsProcessTrusted(),let app = NSWorkspace.shared.runningApplications.first(where:{$0.localizedName == "DeepSeek Harness"}) else { output(["error":"Native accessibility unavailable"],code:1) }
let arguments = Array(CommandLine.arguments.dropFirst())
guard arguments.count <= 2, arguments.dropFirst().allSatisfy({$0 == "--reveal"}) else { output(["error":"Usage: native-inspect <text|composer> [--reveal]"],code:2) }
let search = arguments.first ?? "BLOOM-WIDE-START"
let root = AXUIElementCreateApplication(app.processIdentifier)
AXUIElementSetAttributeValue(root,"AXEnhancedUserInterface" as CFString,kCFBooleanTrue)
AXUIElementSetAttributeValue(root,"AXManualAccessibility" as CFString,kCFBooleanTrue)
guard let active = attr(root,kAXFocusedWindowAttribute) ?? attr(root,kAXMainWindowAttribute) else { output(["error":"No active DSH window"],code:1) }
var nodes: [(AXUIElement,Int)] = [(active as! AXUIElement,-1)]
var found: [Int] = []
var index = 0
while index < nodes.count && index < 30000 {
  let element = nodes[index].0
  let role = text(element,kAXRoleAttribute)
  if search == "composer" {
    if role == "AXTextArea" { found.append(index) }
  } else if ["AXStaticText","AXCell","AXTable"].contains(role), [kAXValueAttribute,kAXTitleAttribute,kAXDescriptionAttribute].contains(where:{text(element,$0).contains(search)}) { found.append(index) }
  for child in attr(element,kAXChildrenAttribute) as? [AXUIElement] ?? [] { nodes.append((child,index)) }
  index += 1
}
if arguments.contains("--reveal"),let first = found.first {
  let element = nodes[first].0
  guard actions(element).contains("AXScrollToVisible"),AXUIElementPerformAction(element,"AXScrollToVisible" as CFString) == .success else { output(["error":"Native reveal unavailable"],code:1) }
  Thread.sleep(forTimeInterval:0.5)
}
let matches = found.prefix(12).map { hit -> [String: Any] in
  var chain: [[String: Any]] = []
  var current = hit
  while current >= 0 && chain.count < 10 {
    chain.append(describe(nodes[current].0))
    current = nodes[current].1
  }
  return ["ancestors":chain]
}
output(["visited":index,"truncated":index<nodes.count,"matches":matches])
