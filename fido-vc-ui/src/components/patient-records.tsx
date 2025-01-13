'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { LogOut, Download, Upload, Lock } from 'lucide-react'

// Mock patient data
const patientData = {
  username: "john.doe",
  did: "did:example:123456789abcdefghi",
  records: [
    { id: 1, name: "Blood Type", value: "A+" },
    { id: 2, name: "Allergies", value: "Peanuts, Penicillin" },
    { id: 3, name: "Last Check-up", value: "2023-05-15" },
    { id: 4, name: "Medications", value: "Lisinopril, Metformin" },
    { id: 5, name: "Height", value: "180 cm" },
    { id: 6, name: "Weight", value: "75 kg" },
  ]
}

export default function PatientRecords() {
  const [encryptedCredential, setEncryptedCredential] = useState<string | null>(null)
  const [uploadedCredential, setUploadedCredential] = useState<Record<string, any> | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...")
  }

  const generateVerifiableCredential = () => {
    // Mock VC generation
    const vc = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential", "PatientRecord"],
      "issuer": "did:example:hospital",
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        "id": patientData.did,
        ...patientData.records.reduce((acc, record) => ({ ...acc, [record.name]: record.value }), {})
      }
    }
    return JSON.stringify(vc, null, 2)
  }

  const downloadVerifiableCredential = () => {
    const vc = generateVerifiableCredential()
    const blob = new Blob([vc], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'patient_record_vc.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const encryptCredential = () => {
    // Mock encryption (in a real scenario, use proper encryption methods)
    const vc = generateVerifiableCredential()
    setEncryptedCredential(btoa(vc))
  }

  const downloadEncryptedCredential = () => {
    if (encryptedCredential) {
      const blob = new Blob([encryptedCredential], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'encrypted_patient_record_vc.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const uploadToCloud = () => {
    if (encryptedCredential) {
      // Implement cloud upload logic here
      console.log("Uploading encrypted credential to cloud...")
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleUploadCredential = () => {
    if (uploadedFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const vc = JSON.parse(content)
          // Extract credential subject data
          setUploadedCredential(vc.credentialSubject || {})
          setSelectedAttributes([])
          console.log("Loaded VC:", vc)
        } catch (error) {
          console.error("Error parsing VC:", error)
        }
      }
      reader.readAsText(uploadedFile)
    }
  }

  const generateVerifiablePresentation = () => {
    if (uploadedCredential) {
      const vp = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiablePresentation"],
        "verifiableCredential": [{
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          "type": ["VerifiableCredential", "PatientRecord"],
          "credentialSubject": {
            "id": uploadedCredential.id,
            ...selectedAttributes.reduce((acc, attr) => ({ ...acc, [attr]: uploadedCredential[attr] }), {})
          }
        }]
      }
      const vpString = JSON.stringify(vp, null, 2)
      const blob = new Blob([vpString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'verifiable_presentation.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>
            <div className="flex justify-between items-center">
              <div>
                <p><strong>Username:</strong> {patientData.username}</p>
                <p><strong>DID:</strong> {patientData.did}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="local" className="w-full">
            <TabsList>
              <TabsTrigger value="local">Local Patient Information</TabsTrigger>
              {uploadedCredential && (
                <TabsTrigger value="uploaded">Patient Information from Credential</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="local">
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {patientData.records.map(record => (
                  <div key={record.id} className="mb-2 text-sm">
                    <strong>{record.name}:</strong> {record.value}
                  </div>
                ))}
              </ScrollArea>
              <div className="space-y-4 mt-4">
                <div className="flex space-x-2">
                  <Button onClick={downloadVerifiableCredential}>
                    <Download className="mr-2 h-4 w-4" /> Download Verifiable Credential
                  </Button>
                  <Button onClick={encryptCredential}>
                    <Lock className="mr-2 h-4 w-4" /> Encrypt Credential
                  </Button>
                </div>
                {encryptedCredential && (
                  <div className="flex space-x-2">
                    <Button onClick={downloadEncryptedCredential}>
                      <Download className="mr-2 h-4 w-4" /> Download Encrypted Credential
                    </Button>
                    <Button onClick={uploadToCloud}>
                      <Upload className="mr-2 h-4 w-4" /> Upload to Cloud
                    </Button>
                  </div>
                )}
                <div>
                  <Label htmlFor="upload-vc">Upload Verifiable Credential</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input id="upload-vc" type="file" onChange={handleFileSelect} />
                    <Button onClick={handleUploadCredential} disabled={!uploadedFile}>
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            {uploadedCredential && (
              <TabsContent value="uploaded">
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {Object.entries(uploadedCredential).map(([key, value]) => (
                    key !== 'id' && (
                      <div key={key} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`attr-${key}`}
                          checked={selectedAttributes.includes(key)}
                          onCheckedChange={(checked) => {
                            setSelectedAttributes(prev => 
                              checked 
                                ? [...prev, key] 
                                : prev.filter(attr => attr !== key)
                            )
                          }}
                        />
                        <Label htmlFor={`attr-${key}`} className="text-sm">
                          <strong>{key}:</strong> {value as string}
                        </Label>
                      </div>
                    )
                  ))}
                </ScrollArea>
                <Button 
                  onClick={generateVerifiablePresentation} 
                  disabled={selectedAttributes.length === 0}
                  className="mt-4"
                >
                  <Download className="mr-2 h-4 w-4" /> Generate and Download Verifiable Presentation
                </Button>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

