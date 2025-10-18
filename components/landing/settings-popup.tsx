"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { X, Settings, Zap, Code, Globe } from "lucide-react"

interface SettingsPopupProps {
  onClose: () => void
  settings: {
    model: string
    temperature: number
    techStack: string
  }
  onSettingsChange: (settings: any) => void
}

export function SettingsPopup({ onClose, settings, onSettingsChange }: SettingsPopupProps) {
  const models = [
    { value: "gpt-4", label: "GPT-4", tokens: "8K context" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo", tokens: "128K context" },
    { value: "claude-3-opus", label: "Claude 3 Opus", tokens: "200K context" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet", tokens: "200K context" },
  ]

  const techStacks = [
    { value: "none", label: "None (Framework Agnostic)", description: "Let AI choose the best approach" },
    { value: "static-html", label: "Static HTML", description: "Simple HTML/CSS/JS websites" },
    { value: "hugo", label: "Hugo", description: "Static site generator for blogs" },
    { value: "shinyapps", label: "Shiny Apps", description: "R-based interactive applications" },
    { value: "streamlit", label: "Streamlit", description: "Python data apps" },
    { value: "react-tailwind", label: "React + Tailwind", description: "Modern React components" },
    { value: "nextjs-full", label: "Next.js Full-Stack", description: "Complete web applications" },
    { value: "vue-vite", label: "Vue + Vite", description: "Vue.js applications" },
  ]

  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <Card className="mx-auto bg-white border-0 shadow-2xl mt-4 max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Generation Settings
          </CardTitle>
          <Button variant="ghost" onClick={onClose} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Model
          </Label>
          <Select value={settings.model} onValueChange={(value) => updateSetting("model", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex justify-between items-center w-full">
                    <span>{model.label}</span>
                    <span className="text-xs text-gray-500 ml-2">{model.tokens}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            Choose the AI model for code generation. Higher context models can handle larger projects.
          </p>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Creativity Level: {settings.temperature}</Label>
          <Slider
            value={[settings.temperature]}
            onValueChange={(value) => updateSetting("temperature", value[0])}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Focused (0)</span>
            <span>Balanced (0.5)</span>
            <span>Creative (1)</span>
          </div>
          <p className="text-sm text-gray-500">
            Lower values produce more consistent code, higher values are more creative and varied.
          </p>
        </div>

        {/* Tech Stack Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Code className="w-4 h-4" />
            Target Framework
          </Label>
          <Select value={settings.techStack} onValueChange={(value) => updateSetting("techStack", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {techStacks.map((stack) => (
                <SelectItem key={stack.value} value={stack.value}>
                  <div>
                    <div className="font-medium">{stack.label}</div>
                    <div className="text-xs text-gray-500">{stack.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            Select the framework and technology stack for your generated application.
          </p>
        </div>

        {/* Current Settings Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Current Configuration
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Model:</span>
              <div className="font-medium">{models.find((m) => m.value === settings.model)?.label}</div>
            </div>
            <div>
              <span className="text-gray-600">Framework:</span>
              <div className="font-medium">{techStacks.find((t) => t.value === settings.techStack)?.label}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
