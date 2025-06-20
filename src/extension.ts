import * as vscode from 'vscode';
import { parsePromptToMermaid } from './parser';

export function activate(context: vscode.ExtensionContext) {
  console.log('Prompt2Diagram is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand('prompt2diagram.helloWorld', () => {
      const panel = vscode.window.createWebviewPanel(
        'prompt2diagram',
        'Prompt2Diagram',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      panel.webview.html = getWebviewContent(panel.webview);

      panel.webview.onDidReceiveMessage(
        (message) => {
          if (message.type === 'prompt') {
            const userInput = message.value;
            const mermaidSyntax = parsePromptToMermaid(userInput);
            const diagramHtml = `<div class="mermaid">${mermaidSyntax}</div>`;
            panel.webview.postMessage({ type: 'diagram', value: diagramHtml });
          }
        },
        undefined,
        context.subscriptions
      );
    })
  );
}

function getWebviewContent(webview: vscode.Webview): string {
  const nonce = getNonce();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Prompt2Diagram</title>
      <meta http-equiv="Content-Security-Policy"
          content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline';
          script-src 'nonce-${nonce}' https://cdn.jsdelivr.net;
          font-src ${webview.cspSource};">
      <style>
          body { font-family: sans-serif; padding: 16px; }
          textarea { width: 100%; height: 80px; font-size: 14px; }
          button { margin-top: 10px; }
          #diagram { margin-top: 20px; }
      </style>
  </head>
  <body>
      <h2>Prompt2Diagram ✨</h2>
      <form id="promptForm">
          <textarea id="promptInput" placeholder="Describe your system architecture..."></textarea><br>
          <button type="submit">Generate Diagram</button>
      </form>
      <div id="diagram" class="mermaid">graph TD;</div>

      <script nonce="${nonce}" type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          mermaid.initialize({ startOnLoad: true });

          const vscode = acquireVsCodeApi();

          document.getElementById('promptForm').addEventListener('submit', event => {
              event.preventDefault();
              const prompt = document.getElementById('promptInput').value;
              vscode.postMessage({ type: 'prompt', value: prompt });
          });

          window.addEventListener('message', event => {
              const { type, value } = event.data;
              if (type === 'diagram') {
                  const container = document.getElementById('diagram');
                  container.innerHTML = value;
                  mermaid.run();
              }
          });
      </script>
  </body>
  </html>
  `;
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function deactivate() {}
