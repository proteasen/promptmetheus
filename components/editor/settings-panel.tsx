'use client'

import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings as SettingsIcon, X } from "lucide-react"
import { useState, useEffect } from "react"

const TECH_STACKS = [
  { id: 'nextjs', name: 'Next.js' },
  { id: 'hugo', name: 'Hugo' },
  { id: 'streamlit', name: 'Streamlit' },
  { id: 'react', name: 'React' },
  { id: 'vue', name: 'Vue.js' },
]

const LLM_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
]

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    techStack: string
    model: string
    temperature: number
  }
  onSettingsChange: (settings: {
    techStack: string
    model: string
    temperature: number
  }) => void
}

export function SettingsPanel({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tech-stack">Tech Stack</Label>
            <Select
              value={localSettings.techStack}
              onValueChange={(value) => setLocalSettings(prev => ({ ...prev, techStack: value }))}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select tech stack" />
              </SelectTrigger>
              <SelectContent>
                {TECH_STACKS.map((stack) => (
                  <SelectItem key={stack.id} value={stack.id}>
                    {stack.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model">AI Model</Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) => setLocalSettings(prev => ({ ...prev, model: value }))}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {LLM_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="temperature">Temperature: {localSettings.temperature.toFixed(1)}</Label>
              <span className="text-sm text-muted-foreground">
                {localSettings.temperature < 0.3 ? 'Precise' : localSettings.temperature < 0.7 ? 'Balanced' : 'Creative'}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[localSettings.temperature]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, temperature: value }))}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onSettingsChange(localSettings)
              onClose()
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
