'use client';

import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Card } from "@/components/reusable/ui/card";
import { Badge } from "@/components/reusable/ui/badge";
import { Alert, AlertDescription } from "@/components/reusable/ui/alert";
import { Progress } from "@/components/reusable/ui/progress";
import { Upload, CheckCircle, XCircle, Clock, AlertCircle, FileText, X } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { doctorServiceApi } from "@/services/doctorApiService";
import { toast } from "sonner";

type CertificateStatus = "pending" | "approved" | "rejected" | undefined;

interface Certificate {
  name: string;
  status: CertificateStatus;
  uploadedDate: string;
  verifiedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  documentType: string;
}

export default function CertificatesLicenses() {
  const { user } = useAuth();
  const { setApi } = useAuth();

  const userCertificate = {
    name: 'Medical License Certificate',
    status: user?.status,
    uploadedDate: "2025-11-07",
    documentType: "image"
  }

  const [certificate, setCertificate] = useState<Certificate | null>(userCertificate);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; 
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Only PDF, JPG, and PNG files are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit.';
    }
    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; 
    const error = validateFile(file);

    if (error) {
      toast.error(error);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
     
      const doctorReupload = await doctorServiceApi.fileReUpload({ certificates: [selectedFile] })
      setApi(((value) => value + 1))

      setUploadProgress(100);
      
      if (!doctorReupload?.data?.fileReUpload) {
        toast.error('upload failed')
      }
      toast.success('uplaoded succefully');

      setCertificate({
        name: selectedFile.name,
        status: "pending",
        uploadedDate: new Date().toISOString().split('T')[0],
        documentType: selectedFile.type.includes('pdf') ? 'PDF' : 'JPG'
      });

      setTimeout(() => {
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      toast.error('upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }

    clearInterval(interval);
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Medical Certificate</h1>
        <p className="text-muted-foreground mb-8">
          Upload and manage your medical license verification.
        </p>

        <div className="space-y-6">
          {/* Current Certificate Status */}
          {certificate && (
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{certificate.name}</h3>
                      {certificate.status === "approved" && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      {certificate.status === "pending" && (
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                      )}
                      {certificate.status === "rejected" && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Uploaded: {new Date(certificate.uploadedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      {certificate.verifiedDate && (
                        <p className="text-green-600">Verified: {new Date(certificate.verifiedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      )}
                      {certificate.rejectedDate && (
                        <p className="text-red-600">Rejected: {new Date(certificate.rejectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      )}
                      <p>Format: {certificate.documentType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {certificate.status === "approved" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your certificate has been verified and approved. You're all set!
                  </AlertDescription>
                </Alert>
              )}

              {certificate.status === "pending" && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Your certificate is under review. This typically takes 2-3 business days.
                  </AlertDescription>
                </Alert>
              )}

              {certificate.status === "rejected" && (
                <>
                  <Alert className="border-red-200 bg-red-50 mb-4">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Your application was rejected.</strong><br />
                      { user?.profile?.personal?.rejectionReason }
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-primary bg-primary/5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-foreground">
                      Please upload a new certificate below to continue your verification process.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </Card>
          )}

          {/* Upload Section - Show only if no certificate or rejected */}
          {(!certificate || certificate.status === "rejected") && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {certificate?.status === "rejected" ? "Re-upload Certificate" : "Upload Certificate"}
              </h3>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">
                    PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleInputChange}
                  multiple
                />
              </div>
            </div>

              {/* Selected File Preview */}
              {selectedFile && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="h-8 w-8 p-0"
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <Button 
                    className="w-full"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {certificate?.status === "rejected" ? "Re-upload Certificate" : "Upload Certificate"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
