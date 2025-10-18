import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Upload, Settings, Edit, Code, Zap } from "lucide-react"

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <div className="milky-way"></div>
      </div>

      <header className="relative z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/images/prompt-royale-logo.png"
                  alt="Prompt Royale Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </Link>
            </div>
            <nav className="flex items-center gap-6 text-white/80 text-sm">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                back to home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Tutorial</h1>
            <p className="text-xl text-white/80">Learn how to use Promptmetheus to build amazing web applications</p>
          </div>

          <div className="grid gap-8">
            {/* Step 1 */}
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-black font-bold">1</Badge>
                  <CardTitle className="text-2xl text-white">Getting Started</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-100">
                  Start by entering your project idea in the main prompt area. Be specific about what you want to build
                  - whether it's a landing page, web app, or interactive component.
                </p>
                <div className="bg-black/50 p-4 rounded-lg border border-gray-600">
                  <p className="text-sm text-gray-300 mb-2">Example prompts:</p>
                  <ul className="text-sm text-gray-100 space-y-1">
                    <li>• "Build a modern portfolio website with dark theme"</li>
                    <li>• "Create a todo app with React and local storage"</li>
                    <li>• "Design a pricing page for a SaaS product"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-black font-bold">2</Badge>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <Upload className="w-6 h-6" />
                    Attach Files
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-100">
                  Use the Attach button to upload reference materials, designs, or existing code files to provide
                  context for your project. Supports 50+ file formats across 4 main categories.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-green-900/50 p-3 rounded-lg border border-green-600">
                      <h4 className="font-semibold text-green-300 mb-2">Images & Media</h4>
                      <p className="text-xs text-gray-200">.jpg, .png, .svg, .gif, .webp, .bmp, .ico</p>
                    </div>
                    <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-600">
                      <h4 className="font-semibold text-blue-300 mb-2">Programming Languages</h4>
                      <p className="text-xs text-gray-200">
                        .py, .go, .rs, .java, .cpp, .c, .cs, .php, .rb, .swift, .kt, .js, .ts
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-purple-900/50 p-3 rounded-lg border border-purple-600">
                      <h4 className="font-semibold text-purple-300 mb-2">Web & Config Files</h4>
                      <p className="text-xs text-gray-200">.html, .css, .jsx, .tsx, .vue, .json, .yaml, .env, .sql</p>
                    </div>
                    <div className="bg-orange-900/50 p-3 rounded-lg border border-orange-600">
                      <h4 className="font-semibold text-orange-300 mb-2">Design & Documents</h4>
                      <p className="text-xs text-gray-200">.fig, .sketch, .xd, .psd, .pdf, .md, .zip, .tar</p>
                    </div>
                  </div>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-red-300 mb-2">File Limits:</h4>
                  <ul className="text-sm text-gray-100 space-y-1">
                    <li>• Maximum 25MB total file size</li>
                    <li>• Maximum 10MB per individual file</li>
                    <li>• Binary files automatically converted to JSON descriptions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-black font-bold">3</Badge>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <Settings className="w-6 h-6" />
                    Configure Settings
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-100">
                  Click Settings to customize your generation preferences including AI model, creativity level, and
                  target framework.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-black/50 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold text-blue-300 mb-2">Model Selection</h4>
                    <p className="text-sm text-gray-100">
                      Choose from available AI models with different capabilities and token limits.
                    </p>
                  </div>
                  <div className="bg-black/50 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold text-purple-300 mb-2">Temperature</h4>
                    <p className="text-sm text-gray-100">Adjust creativity level from 0 (focused) to 1 (creative).</p>
                  </div>
                  <div className="bg-black/50 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold text-yellow-300 mb-2">Tech Stack</h4>
                    <p className="text-sm text-gray-100">
                      Select target framework: React, Next.js, Vue, or static HTML.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-black font-bold">4</Badge>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <Zap className="w-6 h-6" />
                    Generate & Preview
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-100">
                  Submit your prompt to enter the Editor Panel where you can see your generated application in
                  real-time.
                </p>
                <div className="bg-black/50 p-4 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-green-300 mb-2">Editor Panel Features:</h4>
                  <ul className="text-sm text-gray-100 space-y-1">
                    <li>• Live preview of your generated website</li>
                    <li>• Real-time token usage tracking</li>
                    <li>• Interactive chat for refinements</li>
                    <li>• Component-level editing capabilities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Step 5 */}
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-black font-bold">5</Badge>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <Edit className="w-6 h-6" />
                    Refine & Edit
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-100">
                  Use the Edit button to select specific components and make targeted improvements to your application.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/50 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold text-blue-300 mb-2">Component Selection</h4>
                    <p className="text-sm text-gray-100">
                      Click on any element in the preview to select and modify it specifically.
                    </p>
                  </div>
                  <div className="bg-black/50 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold text-purple-300 mb-2">Contextual Editing</h4>
                    <p className="text-sm text-gray-100">
                      The AI understands your component context for precise modifications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 6 */}
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-black font-bold">6</Badge>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <Code className="w-6 h-6" />
                    Export & Deploy
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-100">
                  Once satisfied with your application, export the complete codebase and deploy it to your preferred
                  platform.
                </p>
                <div className="bg-black/50 p-4 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-green-300 mb-2">Export Options:</h4>
                  <ul className="text-sm text-gray-100 space-y-1">
                    <li>• Download as ZIP file with complete project structure</li>
                    <li>• Ready-to-deploy code with all dependencies</li>
                    <li>• Compatible with Vercel, Netlify, and other platforms</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/" className="inline-block">
              {" "}
              {/* Added inline-block class for proper button styling */}
              <Button className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold">
                Start Building Now
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
