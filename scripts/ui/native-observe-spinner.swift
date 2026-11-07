// Read-only, bounded AX observer. No UI interaction, draft reads or clipboard access.
// Usage (lead only): swift native-observe-spinner.swift --window-id ID --button X,Y,W,H --output NEW.png
// --self-test is purely offline. Window capture is not evidence of system composition.
import AppKit
import ApplicationServices
import CoreGraphics
import ImageIO
import Foundation

func emit(_ status: String, _ reason: String, _ code: Int32) -> Never {
    let data = try! JSONSerialization.data(withJSONObject: ["status": status, "reason": reason], options: [.sortedKeys])
    print(String(decoding: data, as: UTF8.self)); exit(code)
}
func validRect(_ r: CGRect) -> Bool {
    [r.origin.x, r.origin.y, r.width, r.height].allSatisfy { $0.isFinite } && r.width >= 12 && r.height >= 12 && r.width <= 120 && r.height <= 120
}
func identical(_ a: CGRect, _ b: CGRect) -> Bool {
    abs(a.minX-b.minX) < 0.5 && abs(a.minY-b.minY) < 0.5 && abs(a.width-b.width) < 0.5 && abs(a.height-b.height) < 0.5
}
let sending: Set<String> = ["正在发送消息", "Sending message"]
let idle: Set<String> = ["发送消息", "Send message"]
func accepts(role: String, label: String) -> Bool { role == "AXButton" && sending.contains(label) }
let args = Array(CommandLine.arguments.dropFirst())
if args == ["--self-test"] {
    let r = CGRect(x: 100, y: 100, width: 32, height: 32)
    guard validRect(r), !validRect(CGRect(x: 0, y: 0, width: 400, height: 400)),
          identical(r, r), !identical(r, r.offsetBy(dx: 1, dy: 0)),
          accepts(role: "AXButton", label: "正在发送消息"), accepts(role: "AXButton", label: "Sending message"),
          !accepts(role: "AXTextArea", label: "Sending message"), !accepts(role: "AXButton", label: "Send message")
    else { emit("aborted", "offline-self-test-failed", 1) }
    emit("result", "offline-self-test-passed", 0)
}
// Production execution is intentionally disabled until event delivery and safe window-only
// button cropping are implemented and verified. Self-test above never touches the GUI.
if ProcessInfo.processInfo.environment["BLOOM_OBSERVER_UNSAFE_DEVELOPMENT"] != nil {
    emit("aborted", "development-override-not-supported", 1)
}
emit("aborted", "observer-not-ready-no-live-observation", 1)
guard args.count == 6, args[0] == "--window-id", let windowID = UInt32(args[1]), windowID > 0,
      args[2] == "--button", args[4] == "--output" else {
    emit("aborted", "usage: --window-id ID --button X,Y,W,H --output NEW.png", 2)
}
let components = args[3].split(separator: ",").compactMap { Double($0) }
guard components.count == 4 else { emit("aborted", "invalid-button-frame", 2) }
let expected = CGRect(x: components[0], y: components[1], width: components[2], height: components[3])
guard validRect(expected), args[5].hasPrefix("/"), args[5].lowercased().hasSuffix(".png"),
      !FileManager.default.fileExists(atPath: args[5]) else { emit("aborted", "invalid-frame-or-output", 2) }
guard AXIsProcessTrusted(), CGPreflightScreenCaptureAccess(),
      let app = NSRunningApplication.runningApplications(withBundleIdentifier: "com.deepseek.dsh").first,
      NSWorkspace.shared.frontmostApplication?.processIdentifier == app.processIdentifier else {
    emit("aborted", "permissions-or-foreground-unavailable", 1)
}
func attr(_ e: AXUIElement, _ key: String) -> CFTypeRef? {
    var v: CFTypeRef?; return AXUIElementCopyAttributeValue(e, key as CFString, &v) == .success ? v : nil
}
func string(_ e: AXUIElement, _ key: String) -> String { attr(e, key) as? String ?? "" }
func frame(_ e: AXUIElement) -> CGRect? {
    guard let p = attr(e, kAXPositionAttribute), let s = attr(e, kAXSizeAttribute),
          CFGetTypeID(p) == AXValueGetTypeID(), CFGetTypeID(s) == AXValueGetTypeID() else { return nil }
    var pt = CGPoint.zero; var sz = CGSize.zero
    guard AXValueGetValue(p as! AXValue, .cgPoint, &pt), AXValueGetValue(s as! AXValue, .cgSize, &sz) else { return nil }
    return CGRect(origin: pt, size: sz)
}
func windowInfo() -> CGRect? {
    guard let list = CGWindowListCopyWindowInfo([.optionIncludingWindow], windowID) as? [[String: Any]],
          list.count == 1, let w = list.first,
          (w[kCGWindowOwnerPID as String] as? Int) == Int(app.processIdentifier),
          (w[kCGWindowNumber as String] as? UInt32) == windowID,
          (w[kCGWindowIsOnscreen as String] as? Bool) == true,
          let dict = w[kCGWindowBounds as String] as? [String: CGFloat],
          let x = dict["X"], let y = dict["Y"], let width = dict["Width"], let height = dict["Height"] else { return nil }
    let rect = CGRect(x: x, y: y, width: width, height: height)
    return rect
}
let root = AXUIElementCreateApplication(app.processIdentifier)
guard let wv = attr(root, kAXFocusedWindowAttribute), CFGetTypeID(wv) == AXUIElementGetTypeID() else { emit("aborted", "focused-window-unavailable", 1) }
let window = wv as! AXUIElement
guard let axWindowFrame = frame(window), let windowFrame = windowInfo(), identical(axWindowFrame, windowFrame),
      windowFrame.contains(expected) else { emit("aborted", "window-or-button-frame-mismatch", 1) }
// Traverse children to locate one button by its provided geometry and a known exact label.
// Read labels only for AXButton elements; never read values or text inputs.
var queue: [AXUIElement] = [window]; var index = 0; var candidates: [AXUIElement] = []
while index < queue.count && index < 30000 {
    let element = queue[index]; index += 1
    if string(element, kAXRoleAttribute) == "AXButton", let r = frame(element), identical(r, expected) {
        let label = string(element, kAXDescriptionAttribute)
        let title = string(element, kAXTitleAttribute)
        if idle.contains(label) || idle.contains(title) || sending.contains(label) || sending.contains(title) { candidates.append(element) }
    }
    if let children = attr(element, kAXChildrenAttribute) as? [AXUIElement] { queue.append(contentsOf: children) }
}
guard index == queue.count, candidates.count == 1 else { emit("aborted", "button-not-uniquely-identified", 1) }
let button = candidates[0]
// Refuse pre-existing transient state: only the next observed transition may count.
guard !sending.contains(string(button, kAXDescriptionAttribute)), !sending.contains(string(button, kAXTitleAttribute)) else {
    emit("missed", "already-sending-before-observer-armed", 1)
}
var observer: AXObserver?
let callback: AXObserverCallback = { _, _, _, _ in
    // No validated window-only button capture exists in this SDK. Any event stops
    // the experimental observer rather than claiming to detect or record a spinner.
    emit("aborted", "observer-callback-and-window-only-capture-not-implemented", 1)
}
guard AXObserverCreate(app.processIdentifier, callback, &observer) == .success, let obs = observer else { emit("aborted", "ax-observer-unavailable", 1) }
// AX notifications vary by host/OS; require BOTH notifications rather than pretending unsupported changes are observed.
for notification in [kAXTitleChangedNotification, kAXValueChangedNotification] {
    guard AXObserverAddNotification(obs, button, notification as CFString, nil) == .success else {
        emit("aborted", "ax-button-change-notification-unsupported", 1)
    }
}
for notification in [kAXFocusedWindowChangedNotification, kAXWindowMovedNotification, kAXWindowResizedNotification] {
    let target = notification == kAXFocusedWindowChangedNotification ? root : window
    guard AXObserverAddNotification(obs, target, notification as CFString, nil) == .success else {
        emit("aborted", "ax-window-notification-unsupported", 1)
    }
}
CFRunLoopAddSource(CFRunLoopGetCurrent(), AXObserverGetRunLoopSource(obs), .defaultMode)
let token = NSWorkspace.shared.notificationCenter.addObserver(forName: NSWorkspace.didActivateApplicationNotification, object: nil, queue: .main) { note in
    if let activated = note.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication,
       activated.processIdentifier != app.processIdentifier { emit("aborted", "foreground-changed", 1) }
}
_ = token
// Check for the subscribe race; do not fabricate a transition.
if sending.contains(string(button, kAXDescriptionAttribute)) || sending.contains(string(button, kAXTitleAttribute)) {
    emit("missed", "sending-during-observer-setup", 1)
}
CFRunLoopRunInMode(.defaultMode, 120, false)
emit("missed", "no-sending-notification-within-120-seconds", 0)
