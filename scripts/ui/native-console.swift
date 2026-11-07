import AppKit
import ApplicationServices
import CoreGraphics

guard let source = String(data: FileHandle.standardInput.readDataToEndOfFile(), encoding: .utf8), !source.isEmpty else { print("{\"error\":\"empty stdin\"}"); exit(2) }
let app = NSWorkspace.shared.runningApplications.first { $0.localizedName == "DeepSeek Harness" }
guard let app else { print("{\"error\":\"DSH desktop not running\"}"); exit(1) }
app.activate(options: [.activateIgnoringOtherApps])
Thread.sleep(forTimeInterval: 1.0)
func attr(_ e: AXUIElement, _ key: String) -> CFTypeRef? { var v: CFTypeRef?; AXUIElementCopyAttributeValue(e, key as CFString, &v); return v }
var queue = [AXUIElementCreateApplication(app.processIdentifier)]
var index = 0
var prompt: AXUIElement?
while index < queue.count && index < 8000 {
  let e=queue[index]; index += 1
  let label=attr(e,kAXDescriptionAttribute) as? String ?? ""
  if attr(e,kAXRoleAttribute) as? String == "AXTextArea", ["控制台提示","Console prompt"].contains(label) { prompt=e; break }
  queue.append(contentsOf: attr(e,kAXChildrenAttribute) as? [AXUIElement] ?? [])
}
guard let prompt, let position=attr(prompt,kAXPositionAttribute) else { print("{\"error\":\"Console prompt not found; open official Developer Tools Console first. No command executed.\"}"); exit(1) }
var point=CGPoint.zero; AXValueGetValue(position as! AXValue,.cgPoint,&point); point.x += 24; point.y += 10
let pasteboard=NSPasteboard.general
let old=pasteboard.pasteboardItems?.map { item in item.types.compactMap { type in item.data(forType:type).map { (type,$0) } } } ?? []
func restoreClipboard() { pasteboard.clearContents(); let items=old.map { saved -> NSPasteboardItem in let item=NSPasteboardItem(); for(type,data) in saved { item.setData(data,forType:type) }; return item }; pasteboard.writeObjects(items) }
func finish(_ code: Int32, _ message: String? = nil) -> Never { restoreClipboard(); if let message { fputs(message, stderr) }; exit(code) }
let marker="bloom-console-"+UUID().uuidString
let js="(function(output){try{output(JSON.stringify({marker:'\(marker)',value:(function(){\(source)})()}))}catch(error){output(JSON.stringify({marker:'\(marker)',error:String(error)}))}})(copy)"
pasteboard.clearContents(); pasteboard.setString(js,forType:.string)
AXUIElementSetAttributeValue(prompt, kAXFocusedAttribute as CFString, kCFBooleanTrue)
func key(_ code: CGKeyCode,_ flags: CGEventFlags = []) { let down=CGEvent(keyboardEventSource:nil,virtualKey:code,keyDown:true); down?.flags=flags; down?.post(tap:.cghidEventTap); let up=CGEvent(keyboardEventSource:nil,virtualKey:code,keyDown:false); up?.flags=flags; up?.post(tap:.cghidEventTap) }
Thread.sleep(forTimeInterval:0.3)
let system=AXUIElementCreateSystemWide()
guard let focused=attr(system,kAXFocusedUIElementAttribute) else { finish(1, "No focused Console; no command executed.\n") }
let focus=focused as! AXUIElement
let focusLabel=attr(focus,kAXDescriptionAttribute) as? String ?? ""
guard ["控制台提示","Console prompt"].contains(focusLabel) else { let role=attr(focus,kAXRoleAttribute) as? String ?? ""; finish(1, "Focused control is not Console (role=\(role), label=\(focusLabel)); no command executed.\n") }
key(0,.maskCommand)
Thread.sleep(forTimeInterval:0.15)
let units=Array(js.utf16)
for start in stride(from:0,to:units.count,by:16) {
  let chunk=Array(units[start..<min(start+16,units.count)])
  for down in [true,false] {
    let typed=CGEvent(keyboardEventSource:nil,virtualKey:0,keyDown:down)!
    chunk.withUnsafeBufferPointer { typed.keyboardSetUnicodeString(stringLength:chunk.count,unicodeString:$0.baseAddress!) }
    typed.post(tap:.cghidEventTap)
  }
  Thread.sleep(forTimeInterval:0.01)
}
Thread.sleep(forTimeInterval:0.2)
key(36)
let deadline=Date().addingTimeInterval(20)
var completed=false
while Date()<deadline {
  RunLoop.current.run(until:Date().addingTimeInterval(0.1))
  let reader=Process();let pipe=Pipe()
  reader.executableURL=URL(fileURLWithPath:"/usr/bin/pbpaste");reader.standardOutput=pipe
  try reader.run()
  let data=pipe.fileHandleForReading.readDataToEndOfFile();reader.waitUntilExit()
  if let text=String(data:data,encoding:.utf8),let object=try? JSONSerialization.jsonObject(with:data) as? [String:Any],object["marker"] as? String==marker {
    print(text); completed=true; break
  }
}
finish(completed ? 0 : 1, completed ? nil : "Console did not return a result; inspect actual DevTools before retrying.\n")
