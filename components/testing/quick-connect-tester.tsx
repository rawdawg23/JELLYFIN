"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Monitor,
  Smartphone,
  Tv,
  Tablet,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Play,
  AlertTriangle,
} from "lucide-react"

interface TestDevice {
  id: string
  name: string
  type: "mobile" | "tv" | "desktop" | "tablet"
  os: string
  browser?: string
  status: "idle" | "connecting" | "connected" | "failed" | "timeout"
  connectionTime?: number
  lastSeen?: string
  errors?: string[]
  networkCondition: "good" | "slow" | "offline"
}

interface TestScenario {
  id: string
  name: string
  description: string
  devices: Partial<TestDevice>[]
  networkConditions: ("good" | "slow" | "offline")[]
  expectedResults: string[]
}

export function QuickConnectTester() {
  const [testDevices, setTestDevices] = useState<TestDevice[]>([])
  const [currentCode, setCurrentCode] = useState("")
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string>("")

  const deviceTemplates: Omit<TestDevice, "id" | "status" | "networkCondition">[] = [
    { name: "iPhone 15 Pro", type: "mobile", os: "iOS 17.2", browser: "Safari" },
    { name: "Samsung Galaxy S24", type: "mobile", os: "Android 14", browser: "Chrome" },
    { name: 'iPad Pro 12.9"', type: "tablet", os: "iPadOS 17.2", browser: "Safari" },
    { name: "Samsung Tab S9", type: "tablet", os: "Android 14", browser: "Chrome" },
    { name: "MacBook Pro M3", type: "desktop", os: "macOS Sonoma", browser: "Safari" },
    { name: "Windows 11 PC", type: "desktop", os: "Windows 11", browser: "Edge" },
    { name: "Ubuntu Desktop", type: "desktop", os: "Ubuntu 22.04", browser: "Firefox" },
    { name: "Samsung Smart TV", type: "tv", os: "Tizen 7.0" },
    { name: "LG webOS TV", type: "tv", os: "webOS 23" },
    { name: "Apple TV 4K", type: "tv", os: "tvOS 17" },
    { name: "Android TV", type: "tv", os: "Android TV 13" },
    { name: "Roku Ultra", type: "tv", os: "Roku OS 12" },
  ]

  const testScenarios: TestScenario[] = [
    {
      id: "basic",
      name: "Basic Device Test",
      description: "Test connection with common devices under good network conditions",
      devices: [
        { name: "iPhone 15 Pro", type: "mobile" },
        { name: "Windows 11 PC", type: "desktop" },
        { name: "Samsung Smart TV", type: "tv" },
      ],
      networkConditions: ["good"],
      expectedResults: ["All devices should connect within 5 seconds"],
    },
    {
      id: "network-stress",
      name: "Network Stress Test",
      description: "Test connection under various network conditions",
      devices: [
        { name: "iPhone 15 Pro", type: "mobile" },
        { name: "MacBook Pro M3", type: "desktop" },
      ],
      networkConditions: ["good", "slow", "offline"],
      expectedResults: [
        "Good network: fast connection",
        "Slow network: delayed connection",
        "Offline: connection failure",
      ],
    },
    {
      id: "multi-device",
      name: "Multi-Device Simultaneous",
      description: "Test multiple devices connecting simultaneously",
      devices: [
        { name: "iPhone 15 Pro", type: "mobile" },
        { name: 'iPad Pro 12.9"', type: "tablet" },
        { name: "MacBook Pro M3", type: "desktop" },
        { name: "Samsung Smart TV", type: "tv" },
        { name: "Android TV", type: "tv" },
      ],
      networkConditions: ["good"],
      expectedResults: ["All devices should connect", "No conflicts between simultaneous connections"],
    },
    {
      id: "edge-cases",
      name: "Edge Cases",
      description: "Test timeout, retry, and error scenarios",
      devices: [
        { name: "Old Android Phone", type: "mobile" },
        { name: "Legacy Smart TV", type: "tv" },
      ],
      networkConditions: ["slow"],
      expectedResults: ["Some devices may timeout", "Retry mechanism should work", "Error messages should be clear"],
    },
  ]

  const generateTestCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setCurrentCode(code)
    return code
  }

  const addTestDevice = (template: Omit<TestDevice, "id" | "status" | "networkCondition">) => {
    const newDevice: TestDevice = {
      ...template,
      id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "idle",
      networkCondition: "good",
      lastSeen: new Date().toISOString(),
      errors: [],
    }
    setTestDevices((prev) => [...prev, newDevice])
  }

  const removeTestDevice = (deviceId: string) => {
    setTestDevices((prev) => prev.filter((device) => device.id !== deviceId))
  }

  const updateDeviceStatus = (deviceId: string, updates: Partial<TestDevice>) => {
    setTestDevices((prev) => prev.map((device) => (device.id === deviceId ? { ...device, ...updates } : device)))
  }

  const simulateDeviceConnection = async (device: TestDevice) => {
    if (!currentCode) {
      updateDeviceStatus(device.id, {
        status: "failed",
        errors: ["No Quick Connect code available"],
      })
      return
    }

    updateDeviceStatus(device.id, { status: "connecting", connectionTime: Date.now() })

    // Simulate network conditions
    let delay = 1000 // Base delay
    let successRate = 0.9 // 90% success rate

    switch (device.networkCondition) {
      case "slow":
        delay = 3000 + Math.random() * 2000 // 3-5 seconds
        successRate = 0.7 // 70% success rate
        break
      case "offline":
        delay = 8000 // 8 seconds timeout
        successRate = 0.1 // 10% success rate
        break
      case "good":
      default:
        delay = 500 + Math.random() * 1500 // 0.5-2 seconds
        break
    }

    // Simulate device-specific issues
    if (device.type === "tv" && device.os.includes("Legacy")) {
      successRate *= 0.6 // TVs might have more issues
      delay += 2000
    }

    setTimeout(() => {
      const success = Math.random() < successRate
      const connectionTime = Date.now() - (device.connectionTime || Date.now())

      if (success) {
        updateDeviceStatus(device.id, {
          status: "connected",
          connectionTime,
          lastSeen: new Date().toISOString(),
        })
      } else {
        const errorMessages = [
          "Connection timeout",
          "Invalid Quick Connect code",
          "Network error",
          "Device not compatible",
          "Server unavailable",
        ]
        updateDeviceStatus(device.id, {
          status: device.networkCondition === "offline" ? "timeout" : "failed",
          errors: [errorMessages[Math.floor(Math.random() * errorMessages.length)]],
        })
      }
    }, delay)
  }

  const runScenarioTest = async (scenario: TestScenario) => {
    setIsRunningTest(true)
    setSelectedScenario(scenario.id)

    // Clear existing devices
    setTestDevices([])

    // Generate new code
    const code = generateTestCode()

    // Add scenario devices
    const scenarioDevices: TestDevice[] = scenario.devices.map((deviceTemplate, index) => {
      const fullTemplate = deviceTemplates.find((t) => t.name === deviceTemplate.name) || deviceTemplates[0]
      return {
        ...fullTemplate,
        ...deviceTemplate,
        id: `scenario-${scenario.id}-${index}`,
        status: "idle" as const,
        networkCondition: scenario.networkConditions[index % scenario.networkConditions.length],
        lastSeen: new Date().toISOString(),
        errors: [],
      }
    })

    setTestDevices(scenarioDevices)

    // Start connections with staggered timing
    scenarioDevices.forEach((device, index) => {
      setTimeout(() => {
        simulateDeviceConnection(device)
      }, index * 500) // 500ms between each device
    })

    // Record test results after completion
    setTimeout(() => {
      const results = {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        timestamp: new Date().toISOString(),
        devices: scenarioDevices.map((device) => ({
          name: device.name,
          type: device.type,
          status: testDevices.find((d) => d.id === device.id)?.status || "unknown",
          connectionTime: testDevices.find((d) => d.id === device.id)?.connectionTime,
          errors: testDevices.find((d) => d.id === device.id)?.errors,
        })),
      }
      setTestResults((prev) => [results, ...prev])
      setIsRunningTest(false)
    }, 10000) // Wait 10 seconds for all connections to complete
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      case "desktop":
        return <Monitor className="h-4 w-4" />
      case "tv":
        return <Tv className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "connecting":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "timeout":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getNetworkIcon = (condition: string) => {
    switch (condition) {
      case "good":
        return <Wifi className="h-3 w-3 text-green-500" />
      case "slow":
        return <Wifi className="h-3 w-3 text-yellow-500" />
      case "offline":
        return <WifiOff className="h-3 w-3 text-red-500" />
      default:
        return <Wifi className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="ios-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-purple-500" />
            Quick Connect Testing Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing for Jellyfin Quick Connect across multiple devices and scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="space-y-4">
            <TabsList className="ios-tabs grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Testing</TabsTrigger>
              <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Quick Connect Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentCode}
                      onChange={(e) => setCurrentCode(e.target.value)}
                      placeholder="Enter or generate code"
                      className="ios-search border-0"
                    />
                    <Button onClick={generateTestCode} variant="outline" className="ios-button bg-transparent">
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Test Devices</Label>
                  <Button
                    onClick={() => setTestDevices([])}
                    variant="outline"
                    size="sm"
                    className="ios-button bg-transparent text-red-600 border-red-200"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {deviceTemplates.slice(0, 8).map((template) => (
                    <Button
                      key={template.name}
                      onClick={() => addTestDevice(template)}
                      variant="outline"
                      size="sm"
                      className="ios-button bg-transparent text-left justify-start"
                    >
                      {getDeviceIcon(template.type)}
                      <span className="ml-2 truncate">{template.name}</span>
                    </Button>
                  ))}
                </div>

                {testDevices.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Active Test Devices ({testDevices.length})</Label>
                      <Button
                        onClick={() => testDevices.forEach((device) => simulateDeviceConnection(device))}
                        disabled={!currentCode || isRunningTest}
                        className="ios-button text-white border-0"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Test All Devices
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {testDevices.map((device) => (
                        <Card key={device.id} className="ios-card border-0 bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getDeviceIcon(device.type)}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm truncate">{device.name}</p>
                                    {getNetworkIcon(device.networkCondition)}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {device.os} {device.browser && `• ${device.browser}`}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(device.status)}
                                  <Badge
                                    className={`text-xs ${
                                      device.status === "connected"
                                        ? "bg-green-100 text-green-800"
                                        : device.status === "connecting"
                                          ? "bg-blue-100 text-blue-800"
                                          : device.status === "failed"
                                            ? "bg-red-100 text-red-800"
                                            : device.status === "timeout"
                                              ? "bg-orange-100 text-orange-800"
                                              : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {device.status}
                                  </Badge>
                                </div>

                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => simulateDeviceConnection(device)}
                                    disabled={!currentCode || device.status === "connecting"}
                                    size="sm"
                                    variant="outline"
                                    className="ios-button bg-transparent h-8 w-8 p-0"
                                  >
                                    <Play className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => removeTestDevice(device.id)}
                                    size="sm"
                                    variant="outline"
                                    className="ios-button bg-transparent h-8 w-8 p-0 text-red-600 border-red-200"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {device.connectionTime && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Connection time: {device.connectionTime}ms
                              </div>
                            )}

                            {device.errors && device.errors.length > 0 && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                <AlertTriangle className="h-3 w-3" />
                                {device.errors[0]}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-4">
              <div className="grid gap-4">
                {testScenarios.map((scenario) => (
                  <Card key={scenario.id} className="ios-card border-0">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{scenario.name}</CardTitle>
                          <CardDescription>{scenario.description}</CardDescription>
                        </div>
                        <Button
                          onClick={() => runScenarioTest(scenario)}
                          disabled={isRunningTest}
                          className="ios-button text-white border-0"
                        >
                          {isRunningTest && selectedScenario === scenario.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Run Test
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Test Devices:</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {scenario.devices.map((device, index) => (
                              <Badge key={index} className="ios-badge bg-purple-100 text-purple-800 border-0">
                                {getDeviceIcon(device.type || "desktop")}
                                <span className="ml-1">{device.name}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Network Conditions:</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {scenario.networkConditions.map((condition, index) => (
                              <Badge
                                key={index}
                                className={`text-xs ${
                                  condition === "good"
                                    ? "bg-green-100 text-green-800"
                                    : condition === "slow"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {getNetworkIcon(condition)}
                                <span className="ml-1 capitalize">{condition}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Expected Results:</Label>
                          <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                            {scenario.expectedResults.map((result, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-purple-600">•</span>
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No test results yet. Run some tests to see results here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <Card key={index} className="ios-card border-0">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{result.scenarioName}</CardTitle>
                          <Badge className="ios-badge bg-gray-100 text-gray-800 border-0">
                            {new Date(result.timestamp).toLocaleString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {result.devices.map((device: any, deviceIndex: number) => (
                            <div
                              key={deviceIndex}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                {getDeviceIcon(device.type)}
                                <span className="text-sm font-medium">{device.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(device.status)}
                                {device.connectionTime && (
                                  <span className="text-xs text-muted-foreground">{device.connectionTime}ms</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
