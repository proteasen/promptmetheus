"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Code, Eye, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CodePreviewProps {
  code: string
  isGenerating: boolean
  onComponentSelect: (component: string) => void
  framework?: string
  buildErrors?: string[]
  onBuildError?: (errors: string[]) => void
}

export function CodePreview({
  code,
  isGenerating,
  onComponentSelect,
  framework = "react",
  buildErrors = [],
  onBuildError,
}: CodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [internalBuildErrors, setInternalBuildErrors] = useState<string[]>([])
  const [showSourceCode, setShowSourceCode] = useState(false)
  const [componentCount, setComponentCount] = useState(0)
  const [mockApis, setMockApis] = useState<string[]>([])

  const getFrameworkTemplate = (framework: string): string => {
    switch (framework) {
      case "vue":
        return `
          <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
          <script>
            const { createApp, ref, reactive, onMounted } = Vue;
          </script>
        `
      case "angular":
        return `
          <script src="https://unpkg.com/@angular/core@15/bundles/core.umd.js"></script>
          <script src="https://unpkg.com/@angular/common@15/bundles/common.umd.js"></script>
        `
      case "vanilla":
        return `
          <script>
            // Vanilla JavaScript environment
            console.log('Vanilla JS mode');
          </script>
        `
      default: // react
        return `
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        `
    }
  }

  const generateMockApiHandlers = (code: string): string => {
    const apiEndpoints: string[] = []

    // Extract API calls
    const patterns = [/fetch$$['"`]([^'"`]+)['"`]$$/g, /axios\.get$$['"`]([^'"`]+)['"`]$$/g, /api\/([a-zA-Z0-9/\-_]+)/g]

    patterns.forEach((pattern) => {
      let match
      while ((match = pattern.exec(code)) !== null) {
        apiEndpoints.push(match[1] || match[0])
      }
    })

    setMockApis(apiEndpoints)

    return `
      <script>
        // Mock API handlers for ${framework} application
        const mockData = {
          users: [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
          ],
          products: [
            { id: 1, name: 'Wireless Headphones', price: 199.99, stock: 45 },
            { id: 2, name: 'Smart Watch', price: 299.99, stock: 23 }
          ],
          analytics: {
            totalUsers: 1234,
            totalSales: 12450,
            conversionRate: 3.2,
            activeUsers: 89
          }
        };

        // Override fetch for API mocking
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
          console.log('[Mock API]', url);
          
          if (typeof url === 'string') {
            if (url.includes('/api/users')) {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockData.users)
              });
            }
            if (url.includes('/api/products')) {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockData.products)
              });
            }
            if (url.includes('/api/analytics')) {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockData.analytics)
              });
            }
          }
          
          // Fallback to original fetch for external APIs
          return originalFetch.apply(this, arguments);
        };

        // Mock axios if detected
        if (typeof axios !== 'undefined') {
          axios.defaults.adapter = function(config) {
            console.log('[Mock Axios]', config.url);
            return Promise.resolve({
              data: mockData.users,
              status: 200,
              statusText: 'OK'
            });
          };
        }
      </script>
    `
  }

  useEffect(() => {
    if (code && iframeRef.current) {
      const iframe = iframeRef.current
      setInternalBuildErrors([])
      setError(null)

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document

        if (doc) {
          const frameworkTemplate = getFrameworkTemplate(framework)
          const mockApiHandlers = generateMockApiHandlers(code)

          const fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Generated App Preview - ${framework.toUpperCase()}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              ${frameworkTemplate}
              <style>
                body { 
                  margin: 0; 
                  padding: 16px; 
                  font-family: system-ui, -apple-system, sans-serif;
                  background: #f8fafc;
                }
                .component-selectable { 
                  cursor: pointer; 
                  transition: all 0.2s;
                  position: relative;
                }
                .component-selectable:hover { 
                  outline: 2px solid #3b82f6; 
                  outline-offset: 2px;
                  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                .component-selectable:hover::after {
                  content: attr(data-component);
                  position: absolute;
                  top: -24px;
                  left: 0;
                  background: #3b82f6;
                  color: white;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-weight: 500;
                  z-index: 1000;
                  white-space: nowrap;
                }
                .build-error {
                  background: #fef2f2;
                  border: 1px solid #fecaca;
                  color: #dc2626;
                  padding: 12px;
                  border-radius: 6px;
                  margin: 8px 0;
                  font-family: monospace;
                  font-size: 12px;
                }
                .mock-api-indicator {
                  position: fixed;
                  top: 10px;
                  right: 10px;
                  background: #10b981;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 10px;
                  z-index: 1000;
                }
              </style>
            </head>
            <body>
              ${mockApis.length > 0 ? `<div class="mock-api-indicator">🔗 ${mockApis.length} Mock APIs</div>` : ""}
              <div id="app-container">
                ${processCodeForFramework(code, framework)}
              </div>
              ${mockApiHandlers}
              <script>
                window.addEventListener('error', (e) => {
                  console.error('[Build Error]', e.message);
                  window.parent.postMessage({
                    type: 'build-error',
                    error: e.message,
                    filename: e.filename,
                    lineno: e.lineno,
                    framework: '${framework}'
                  }, '*');
                });

                window.addEventListener('unhandledrejection', (e) => {
                  console.error('[Promise Rejection]', e.reason);
                  window.parent.postMessage({
                    type: 'build-error',
                    error: 'Promise rejection: ' + e.reason,
                    framework: '${framework}'
                  }, '*');
                });

                // Auto-mark components as selectable
                document.addEventListener('DOMContentLoaded', () => {
                  const components = document.querySelectorAll('div, section, header, main, footer, nav, article, aside, .component, [class*="component"]');
                  let count = 0;
                  
                  components.forEach((el, index) => {
                    if (el.children.length > 0 || el.textContent.trim().length > 20) {
                      el.classList.add('component-selectable');
                      const componentName = el.className.split(' ').find(c => c.includes('component')) || \`Component-\${index + 1}\`;
                      el.setAttribute('data-component', componentName);
                      count++;
                    }
                  });
                  
                  window.parent.postMessage({
                    type: 'component-count',
                    count: count,
                    framework: '${framework}'
                  }, '*');
                });

                document.addEventListener('click', (e) => {
                  const target = e.target.closest('.component-selectable');
                  if (target) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Highlight selected component
                    document.querySelectorAll('.component-selectable').forEach(el => {
                      el.style.outline = '';
                      el.style.boxShadow = '';
                    });
                    
                    target.style.outline = '2px solid #10b981';
                    target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                    
                    window.parent.postMessage({
                      type: 'component-selected',
                      component: target.getAttribute('data-component'),
                      html: target.outerHTML.substring(0, 200) + '...',
                      framework: '${framework}'
                    }, '*');
                  }
                });
                
                window.parent.postMessage({ 
                  type: 'iframe-ready', 
                  framework: '${framework}',
                  mockApis: ${JSON.stringify(mockApis)}
                }, '*');
              </script>
            </body>
            </html>
          `

          doc.open()
          doc.write(fullHtml)
          doc.close()
          setError(null)
        }
      } catch (err) {
        console.error("[v0] Iframe document access error:", err)
        setError(`Failed to load ${framework} preview - ` + (err as Error).message)
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === "component-selected") {
          onComponentSelect(event.data.component)
        } else if (event.data.type === "iframe-ready") {
          setIsLoading(false)
        } else if (event.data.type === "build-error") {
          const newError = `[${event.data.framework}] ${event.data.error} ${event.data.lineno ? `(Line: ${event.data.lineno})` : ""}`
          setInternalBuildErrors((prev) => [...prev, newError])
          onBuildError?.([...internalBuildErrors, newError])
        } else if (event.data.type === "component-count") {
          setComponentCount(event.data.count)
        }
      }

      const handleLoad = () => {
        setTimeout(() => setIsLoading(false), 1000)
      }

      window.addEventListener("message", handleMessage)
      iframe.addEventListener("load", handleLoad)

      return () => {
        window.removeEventListener("message", handleMessage)
        iframe.removeEventListener("load", handleLoad)
      }
    }
  }, [code, onComponentSelect, framework, onBuildError])

  const processCodeForFramework = (rawCode: string, framework: string): string => {
    let processedCode = rawCode

    switch (framework) {
      case "react":
        // Handle JSX/React code
        if (processedCode.includes("jsx") || processedCode.includes("tsx") || processedCode.includes("React")) {
          const htmlMatch = processedCode.match(/<div[^>]*>[\s\S]*<\/div>/i)
          if (htmlMatch) {
            processedCode = htmlMatch[0]
          }
        }
        break

      case "vue":
        // Handle Vue template syntax
        if (processedCode.includes("<template>")) {
          const templateMatch = processedCode.match(/<template>([\s\S]*)<\/template>/i)
          if (templateMatch) {
            processedCode = templateMatch[1]
          }
        }
        break

      case "angular":
        // Handle Angular component templates
        if (processedCode.includes("@Component")) {
          const templateMatch = processedCode.match(/template:\s*`([\s\S]*?)`/i)
          if (templateMatch) {
            processedCode = templateMatch[1]
          }
        }
        break

      case "vanilla":
        // Handle vanilla HTML/CSS/JS
        if (processedCode.includes("<!DOCTYPE html>")) {
          const bodyMatch = processedCode.match(/<body[^>]*>([\s\S]*)<\/body>/i)
          if (bodyMatch) {
            processedCode = bodyMatch[1]
          }
        }
        break
    }

    return `
      <div class="app-wrapper" data-framework="${framework}">
        ${processedCode}
      </div>
    `
  }

  const allBuildErrors = [...buildErrors, ...internalBuildErrors]

  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Generating your application...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (!code) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <Code className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No code generated yet</p>
          <p className="text-sm">Submit a prompt to start generating your application</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-red-700 mb-2">Preview Error</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button
            onClick={() => setError(null)}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Preview
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative flex flex-col">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {framework.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {componentCount} components
          </Badge>
          {mockApis.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {mockApis.length} mock APIs
            </Badge>
          )}
          {allBuildErrors.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {allBuildErrors.length} errors
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSourceCode(!showSourceCode)}
            className="h-6 px-2 text-xs"
          >
            {showSourceCode ? <Eye className="w-3 h-3" /> : <Code className="w-3 h-3" />}
            {showSourceCode ? "Preview" : "Source"}
          </Button>
        </div>
      </div>

      {allBuildErrors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 p-2 max-h-24 overflow-y-auto">
          {allBuildErrors.map((error, index) => (
            <div key={index} className="text-xs text-red-700 font-mono mb-1">
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}

      {showSourceCode ? (
        <div className="flex-1 overflow-auto">
          <pre className="p-4 text-xs font-mono bg-gray-900 text-green-400 h-full overflow-auto">
            <code>{code}</code>
          </pre>
        </div>
      ) : (
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Loading {framework} preview...</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title={`Generated ${framework} Application Preview`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            onError={() => setError(`Failed to load ${framework} iframe`)}
          />
        </div>
      )}
    </div>
  )
}
