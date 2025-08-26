"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ColorShade {
  hex: string
  name: string
  lightness: number
}

export default function ColorShadeGenerator() {
  const [selectedColor, setSelectedColor] = useState("#0891b2")
  const [inputColor, setInputColor] = useState("#0891b2")
  const [shades, setShades] = useState<ColorShade[]>([])
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const { toast } = useToast()

  // Convert hex to HSL
  const hexToHsl = useCallback((hex: string): [number, number, number] => {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return [h * 360, s * 100, l * 100]
  }, [])

  // Convert HSL to hex
  const hslToHex = useCallback((h: number, s: number, l: number): string => {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }, [])

  // Generate shades
  const generateShades = useCallback(
    (baseColor: string) => {
      const [h, s, l] = hexToHsl(baseColor)
      const darkerShades: ColorShade[] = []
      const lighterShades: ColorShade[] = []

      const baseShade = {
        hex: baseColor,
        name: "Base Color",
        lightness: l,
      }

      darkerShades.push(baseShade)
      for (let i = 1; i <= 10; i++) {
        const newL = Math.max(0, l - i * (l / 10))
        const hex = hslToHex(h, s, newL)
        darkerShades.push({
          hex,
          name: `${i * 10}% Darker`,
          lightness: newL,
        })
      }

      lighterShades.push(baseShade)
      for (let i = 1; i <= 10; i++) {
        const newL = Math.min(100, l + i * ((100 - l) / 10))
        const hex = hslToHex(h, s, newL)
        lighterShades.push({
          hex,
          name: `${i * 10}% Lighter`,
          lightness: newL,
        })
      }

      setShades([...darkerShades, ...lighterShades])
    },
    [hexToHsl, hslToHex],
  )

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setSelectedColor(color)
    setInputColor(color)
    generateShades(color)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputColor(e.target.value)
  }

  const handleInputSubmit = () => {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (colorRegex.test(inputColor)) {
      setSelectedColor(inputColor)
      generateShades(inputColor)
    } else {
      toast({
        title: "Invalid Color",
        description: "Please enter a valid hex color code (e.g., #ff0000)",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)
      toast({
        title: "Copied!",
        description: `${color} copied to clipboard`,
      })
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy color to clipboard",
        variant: "destructive",
      })
    }
  }

  useState(() => {
    generateShades(selectedColor)
  })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Palette className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Color Shade Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate beautiful lighter and darker shades from any color. Pick a color or enter a hex code to get
            started.
          </p>
        </div>

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center">Select Your Color</CardTitle>
            <CardDescription className="text-center">Use the color picker or enter a hex code manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={handleColorPickerChange}
                  className="w-24 h-24 rounded-full cursor-pointer shadow-lg"
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                    border: "none",
                    borderRadius: "50%",
                    width: "96px",
                    height: "96px",
                    cursor: "pointer",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                    backgroundColor: selectedColor,
                    outline: "none",
                  }}
                />
              </div>
              <Badge variant="secondary" className="text-sm font-mono">
                {selectedColor.toUpperCase()}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="#0891b2"
                value={inputColor}
                onChange={handleInputChange}
                className="font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
              />
              <Button onClick={handleInputSubmit} className="px-6">
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {shades.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-foreground">Generated Shades</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">Darker Shades</h3>
                <div className="grid grid-cols-11 gap-2">
                  {shades.slice(0, 11).map((shade, index) => (
                    <Card
                      key={`darker-${index}`}
                      className="group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      onClick={() => copyToClipboard(shade.hex)}
                    >
                      <CardContent className="p-0">
                        <div className="h-16 w-full rounded-t-lg" style={{ backgroundColor: shade.hex }} />
                        <div className="p-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-semibold truncate">{shade.hex.toUpperCase()}</span>
                            {copiedColor === shade.hex ? (
                              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{shade.name}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">Lighter Shades</h3>
                <div className="grid grid-cols-11 gap-2">
                  {shades.slice(11, 22).map((shade, index) => (
                    <Card
                      key={`lighter-${index}`}
                      className="group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      onClick={() => copyToClipboard(shade.hex)}
                    >
                      <CardContent className="p-0">
                        <div className="h-16 w-full rounded-t-lg" style={{ backgroundColor: shade.hex }} />
                        <div className="p-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-semibold truncate">{shade.hex.toUpperCase()}</span>
                            {copiedColor === shade.hex ? (
                              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{shade.name}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Click any shade to copy its hex code to clipboard
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
