// Native Accessibility helper for the real DSH desktop window (no DevTools, no clipboard).
// Usage:
//   swift scripts/ui/native-ui.swift list [filter]      -> JSON of actionable controls (role, title/desc, checked/expanded, frame)
//   swift scripts/ui/native-ui.swift press <exact-label|prefix*> [role] -> AXPress the first match, then JSON readback of it
//   swift scripts/ui/native-ui.swift window             -> JSON {id,bounds,onscreen} of the main window (for screencapture -l)
// Exits non-zero with a JSON {error} instead of crashing. Never types text, so it cannot alter drafts or send messages.
import AppKit
import ApplicationServices
import CoreGraphics
import Foundation

func emit(_ obj: Any, code: Int32 = 0) -> Never {
  let data = (try? JSONSerialization.data(withJSONObject: obj, options: [.sortedKeys])) ?? Data("{}".utf8)
  print(String(data: data, encoding: .utf8)!)
  exit(code)
}
func fail(_ msg: String) -> Never { emit(["error": msg], code: 1) }

guard AXIsProcessTrusted() else { fail("Accessibility permission not granted to this process") }
let app = NSRunningApplication.runningApplications(withBundleIdentifier: "com.deepseek.dsh").first
  ?? NSWorkspace.shared.runningApplications.first { $0.localizedName == "DeepSeek Harness" }
guard let app else { fail("DSH desktop is not running") }
let pid = app.processIdentifier
let root = AXUIElementCreateApplication(pid)
AXUIElementSetAttributeValue(root, "AXEnhancedUserInterface" as CFString, kCFBooleanTrue)
AXUIElementSetAttributeValue(root, "AXManualAccessibility" as CFString, kCFBooleanTrue)

func attr(_ e: AXUIElement, _ a: String) -> CFTypeRef? {
  var out: CFTypeRef?
  return AXUIElementCopyAttributeValue(e, a as CFString, &out) == .success ? out : nil
}
func str(_ e: AXUIElement, _ a: String) -> String { (attr(e, a) as? String) ?? "" }
func frame(_ e: AXUIElement) -> [String: Double] {
  var p = CGPoint.zero, s = CGSize.zero
  if let r = attr(e, kAXPositionAttribute) { AXValueGetValue(r as! AXValue, .cgPoint, &p) }
  if let r = attr(e, kAXSizeAttribute) { AXValueGetValue(r as! AXValue, .cgSize, &s) }
  return ["x": p.x, "y": p.y, "w": s.width, "h": s.height]
}
func label(_ e: AXUIElement) -> String {
  for a in [kAXTitleAttribute, kAXDescriptionAttribute, kAXHelpAttribute, kAXValueAttribute] {
    let v = str(e, a).trimmingCharacters(in: .whitespacesAndNewlines)
    if !v.isEmpty { return v }
  }
  return ""
}
func describe(_ e: AXUIElement) -> [String: Any] {
  var d: [String: Any] = ["role": str(e, kAXRoleAttribute), "label": label(e), "frame": frame(e)]
  let help = str(e, kAXHelpAttribute); if !help.isEmpty { d["help"] = help }
  if let v = attr(e, kAXValueAttribute) as? NSNumber { d["value"] = v }
  if let x = attr(e, kAXExpandedAttribute) as? Bool { d["expanded"] = x }
  if let x = attr(e, kAXSelectedAttribute) as? Bool { d["selected"] = x }
  return d
}
func matches(_ e: AXUIElement, _ want: String) -> Bool {
  for v in [label(e), str(e, kAXHelpAttribute)] where !v.isEmpty {
    if v == want || (want.hasSuffix("*") && v.hasPrefix(String(want.dropLast()))) { return true }
  }
  return false
}
let actionable: Set<String> = ["AXButton", "AXRadioButton", "AXCheckBox", "AXMenuItem", "AXPopUpButton", "AXTab"]
func activeWindow() -> AXUIElement {
  guard let value = attr(root, kAXFocusedWindowAttribute) ?? attr(root, kAXMainWindowAttribute) else { fail("No active DSH window; activate the intended window first") }
  return value as! AXUIElement
}
func walk(_ visit: (AXUIElement) -> Bool) {
  var queue = [activeWindow()], i = 0
  while i < queue.count && i < 20000 {
    let e = queue[i]; i += 1
    if visit(e) { return }
    if let kids = attr(e, kAXChildrenAttribute) as? [AXUIElement] { queue.append(contentsOf: kids) }
  }
}

let args = Array(CommandLine.arguments.dropFirst())
switch args.first ?? "" {
case "list":
  let filter = args.count > 1 ? args[1].lowercased() : ""
  var out: [[String: Any]] = []
  walk { e in
    if actionable.contains(str(e, kAXRoleAttribute)) {
      let l = label(e)
      if !l.isEmpty && (filter.isEmpty || (l + " " + str(e, kAXHelpAttribute)).lowercased().contains(filter)) { out.append(describe(e)) }
    }
    return false
  }
  emit(out)
case "press":
  guard NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else { fail("DSH is not frontmost; no control pressed") }
  guard args.count > 1 else { fail("press needs an exact label") }
  let want = args[1], role = args.count > 2 ? args[2] : nil
  var hit: AXUIElement?
  walk { e in
    let r = str(e, kAXRoleAttribute)
    if (actionable.contains(r) || (r == "AXStaticText" && !str(e, kAXHelpAttribute).isEmpty)) && matches(e, want) && (role == nil || r == role) { hit = e; return true }
    return false
  }
  guard let hit else { fail("no control labelled \(want)") }
  let err = AXUIElementPerformAction(hit, kAXPressAction as CFString)
  guard err == .success else { fail("AXPress failed: \(err.rawValue)") }
  Thread.sleep(forTimeInterval: 0.4)
  var after: [String: Any] = describe(hit)
  walk { e in
    let r = str(e, kAXRoleAttribute)
    if (actionable.contains(r) || r == "AXStaticText") && matches(e, want) && (role == nil || r == role) { after = describe(e); return true }
    return false
  }
  if (after["role"] as? String ?? "").isEmpty {
    walk { e in if str(e, kAXRoleAttribute) == "AXPopUpButton" && str(e, kAXHelpAttribute).hasPrefix("Bloom ") { after = ["closedMenu": true, "trigger": describe(e)]; return true }; return false }
  }
  emit(["pressed": after])
case "window":
  let active = frame(activeWindow())
  let wins = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
  let mine = wins.filter { ($0[kCGWindowOwnerPID as String] as? Int32) == pid && ($0[kCGWindowLayer as String] as? Int) == 0 }
    .compactMap { w -> [String: Any]? in
      guard let b = w[kCGWindowBounds as String] as? [String: Double], (b["Width"] ?? 0) > 700, (b["Height"] ?? 0) > 500 else { return nil }
      guard abs((b["X"] ?? 0) - (active["x"] ?? 0)) < 2, abs((b["Y"] ?? 0) - (active["y"] ?? 0)) < 2, abs((b["Width"] ?? 0) - (active["w"] ?? 0)) < 2 else { return nil }
      return ["id": w[kCGWindowNumber as String] ?? 0, "bounds": b, "onscreen": w[kCGWindowIsOnscreen as String] ?? false]
    }
  guard let first = mine.first else { fail("no main DSH window") }
  emit(first)
default:
  fail("usage: native-ui.swift list [filter] | press <label> [role] | window")
}
