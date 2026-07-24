import { useMemo, useState } from "react";
import { downloadJson } from "@rathodparesh/face-verify-core";
export function JsonViewer({ value, filename = "face-result.json" }: { value: unknown; filename?: string }) {
  const [collapsed, setCollapsed] = useState(false); const [showVector, setShowVector] = useState(false);
  const rendered = useMemo(() => JSON.stringify(value, (key, item: unknown) => key === "vector" && !showVector && Array.isArray(item) ? `[hidden ${item.length} values]` : item, 2), [value, showVector]);
  return <section className="fv-json"><div className="fv-json__actions"><button type="button" onClick={() => setCollapsed((current) => !current)}>{collapsed ? "Expand JSON" : "Collapse JSON"}</button><button type="button" onClick={() => setShowVector((current) => !current)}>{showVector ? "Hide embedding vector" : "Show full vector"}</button><button type="button" onClick={() => void navigator.clipboard.writeText(rendered)} aria-label="Copy JSON">Copy JSON</button><button type="button" onClick={() => downloadJson(value, filename)} aria-label="Download JSON">Download JSON</button></div>{!collapsed && <pre>{rendered}</pre>}</section>;
}
