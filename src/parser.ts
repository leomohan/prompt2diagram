// parser.ts
type Node = string;
type Edge = [Node, Node, string?];

const keywordMap: Record<string, string> = {
  "router": "Router",
  "firewall": "Firewall",
  "vpn": "VPN",
  "internet": "Internet",
  "cloud": "Internet",
  "laptop": "Laptop",
  "server": "Server",
  "client": "Client",
  "mfa": "MFA",
  "app gateway": "App Gateway",
  "wireless access point": "WAP",
  "wap": "WAP"
};

const connectorPatterns = [
  "connected to",
  "connects to",
  "linked to",
  "joins",
  "talks to",
  "communicates with",
  "connects with",
  "and then to",
  "then to"
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[.,]/g, "").trim();
}

function findKeyword(fragment: string): string | null {
  const clean = normalize(fragment);
  for (const key in keywordMap) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(clean)) return key;
  }
  return null;
}

function extractEdges(prompt: string): Edge[] {
  const lower = normalize(prompt);
  let input = lower;

  // Replace connectors with placeholder for split
  for (const conn of connectorPatterns) {
    const safe = conn.replace(/ /g, "_");
    input = input.replaceAll(conn, safe);
  }

  const parts = input.split(/(?:connected_to|connects_to|linked_to|joins|talks_to|communicates_with|connects_with|then_to|and_then_to)/);

  const edges: Edge[] = [];

  for (let i = 0; i < parts.length - 1; i++) {
    const fromRaw = findKeyword(parts[i]);
    const toRaw = findKeyword(parts[i + 1]);

    if (fromRaw && toRaw) {
      const from = keywordMap[fromRaw];
      const to = keywordMap[toRaw];
      edges.push([from, to]);
      console.log(`✅ Edge parsed: ${from} --> ${to}`);
    } else {
      console.warn("⚠️ Incomplete edge:", { part1: parts[i], part2: parts[i + 1] });
    }
  }

  return edges;
}

function extractNodes(prompt: string): Node[] {
  const text = normalize(prompt);
  const nodes = new Set<string>();

  for (const key in keywordMap) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(text)) {
      nodes.add(keywordMap[key]);
    }
  }

  return [...nodes];
}

export function parsePromptToMermaid(prompt: string): string {
  const nodes = extractNodes(prompt);
  const edges = extractEdges(prompt);

  if (edges.length === 0 && nodes.length > 1) {
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push([nodes[i], nodes[i + 1]]);
    }
    console.warn("⚠️ No edge patterns found; fallback linear chaining applied.");
  }

  const edgeLines = edges.map(([from, to, label]) => {
    if (from === to) return `${from} -- loop --> ${to}`;
    return label ? `${from} -- ${label} --> ${to}` : `${from} --> ${to}`;
  });

  const nodeLines = nodes.map(n => `${n}`);
  const allLines = [...nodeLines, ...edgeLines];

  console.log("🧠 Nodes:", nodes);
  console.log("🔗 Edges:", edges);
  console.log("📄 Mermaid Output:\n", `graph TD;\n${allLines.join(";\n")};`);

  return `graph TD;\n${allLines.join(";\n")};`;
}
