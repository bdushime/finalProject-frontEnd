import { useState, useCallback, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Upload,
    Download,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle,
    XCircle,
    Loader2,
    Info,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "@/utils/api";

import {
    BulkUploadConfig,
    UserRoles,
} from "@/config/roleConfig";

function BulkUploadDialog({
    isOpen,
    onOpenChange,
    onUploadComplete,
    userRole = UserRoles.SECURITY,
}) {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [validationResults, setValidationResults] = useState([]);
    const [uploadStatus, setUploadStatus] = useState("idle"); 
    const [uploadResults, setUploadResults] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const uploadConfig = useMemo(() => {
        return BulkUploadConfig[userRole] || BulkUploadConfig[UserRoles.SECURITY];
    }, [userRole]);

    const templateColumns = useMemo(() => {
        return [...uploadConfig.requiredColumns, ...uploadConfig.optionalColumns];
    }, [uploadConfig]);

    const handleDownloadTemplate = () => {
        const headers = templateColumns;
        const exampleRow = {
            name: "Epson Projector X5",
            category: "Projector",
            serialNumber: "SN-PROJ-001",
            location: "Main Storage",
            condition: "Good",
            description: "High brightness projector",
            iotTag: "TAG-001"
        };

        const templateData = [
            headers.reduce((acc, col) => {
                acc[col] = exampleRow[col] || "";
                return acc;
            }, {}),
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Devices");

        const roleLabel = userRole === UserRoles.SECURITY ? "Security_Officer" : userRole;
        XLSX.writeFile(wb, `Device_Bulk_Upload_Template_${roleLabel}.xlsx`);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = async (selectedFile) => {
        setFile(selectedFile);
        setUploadStatus("validating");
        setValidationResults([]);
        setUploadResults(null);

        try {
            const data = await readFileData(selectedFile);
            const validated = validateData(data);

            setPreviewData(data.slice(0, 10)); 
            setValidationResults(validated);

            const hasErrors = validated.some(v => v.errors.length > 0);
            setUploadStatus(hasErrors ? "invalid" : "valid");
        } catch (error) {
            console.error("File processing error:", error);
            setUploadStatus("error");
            setValidationResults([{ row: 0, errors: ["Failed to read file: " + error.message] }]);
        }
    };

    const readFileData = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                    const normalizedData = jsonData.map(row => {
                        const normalized = {};
                        Object.keys(row).forEach(key => {
                            const normalizedKey = key.toLowerCase().trim()
                                .replace(/\s+/g, '')
                                .replace('serialno', 'serialNumber')
                                .replace('serialnumber', 'serialNumber')
                                .replace('iottag', 'iotTag');
                            normalized[normalizedKey] = row[key];
                        });
                        return normalized;
                    });

                    resolve(normalizedData);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsArrayBuffer(file);
        });
    };

    const validateData = (data) => {
        const results = [];

        data.forEach((row, index) => {
            const errors = [];
            const warnings = [];

            uploadConfig.requiredColumns.forEach(col => {
                const value = row[col] || row[col.toLowerCase()];
                if (!value || (typeof value === "string" && value.trim() === "")) {
                    errors.push(`Missing required field: ${col}`);
                }
            });

            uploadConfig.excludedColumns.forEach(col => {
                if (row[col] !== undefined && row[col] !== "") {
                    warnings.push(`Field "${col}" is ignored for ${userRole} uploads`);
                }
            });

            results.push({
                row: index + 2, 
                data: row,
                errors,
                warnings,
                isValid: errors.length === 0,
            });
        });

        return results;
    };

    const handleUpload = async () => {
        if (uploadStatus !== "valid") return;

        setUploadStatus("uploading");

        try {
            const devices = validationResults
                .filter(v => v.isValid)
                .map(v => {
                    const device = { ...v.data };

                    Object.entries(uploadConfig.defaultValues).forEach(([key, value]) => {
                        if (!device[key]) {
                            device[key] = value;
                        }
                    });

                    uploadConfig.excludedColumns.forEach(col => {
                        delete device[col];
                    });

                    return device;
                });

            const response = await api.post("/equipment/bulk", { devices });

            setUploadResults(response.data);
            setUploadStatus("complete");

            if (onUploadComplete) {
                onUploadComplete(response.data);
            }
        } catch (error) {
            console.error("Upload error:", error);
            setUploadStatus("error");
            setUploadResults({
                message: error.response?.data?.message || "Upload failed",
                errors: error.response?.data?.errors || ["An unexpected error occurred"],
            });
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreviewData([]);
        setValidationResults([]);
        setUploadStatus("idle");
        setUploadResults(null);
    };

    const handleClose = () => {
        handleReset();
        onOpenChange(false);
    };

    const validationSummary = useMemo(() => {
        const validCount = validationResults.filter(v => v.isValid).length;
        const invalidCount = validationResults.filter(v => !v.isValid).length;
        return { validCount, invalidCount, total: validationResults.length };
    }, [validationResults]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Bulk Device Upload
                    </DialogTitle>
                    <DialogDescription>
                        Upload multiple devices at once using a CSV or Excel file.
                    </DialogDescription>
                </DialogHeader>

                <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        {userRole === UserRoles.SECURITY ? (
                            <>
                                <strong>Security Officer Upload Rules:</strong>
                                <ul className="list-disc ml-5 mt-1 text-sm">
                                    <li>All devices will be set to "Available" automatically</li>
                                    <li>You may attach IoT Tags inside the spreadsheet</li>
                                </ul>
                            </>
                        ) : (
                            <>
                                Required columns: {uploadConfig.requiredColumns.join(", ")}
                            </>
                        )}
                    </AlertDescription>
                </Alert>

                {uploadStatus === "idle" && (
                    <div className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                    ? "border-[#BEBEE0] bg-[#BEBEE0]/10"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-gray-600 mb-2">
                                Drag and drop your CSV/Excel file here, or
                            </p>
                            <label className="cursor-pointer">
                                <span className="text-[#343264] hover:underline font-medium">
                                    browse to select a file
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileSelect}
                                />
                            </label>
                            <p className="text-xs text-gray-400 mt-2">
                                Supported formats: CSV, XLSX, XLS
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={handleDownloadTemplate}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download Template
                            </Button>
                        </div>
                    </div>
                )}

                {uploadStatus === "validating" && (
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#343264]" />
                        <p className="text-gray-600">Validating file...</p>
                    </div>
                )}

                {(uploadStatus === "valid" || uploadStatus === "invalid") && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-gray-500" />
                                <span className="font-medium">{file?.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleReset}>
                                Change File
                            </Button>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>{validationSummary.validCount} valid rows</span>
                            </div>
                            {validationSummary.invalidCount > 0 && (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    <span>{validationSummary.invalidCount} invalid rows</span>
                                </div>
                            )}
                        </div>

                        {validationResults.filter(v => !v.isValid).length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Please fix the following errors:</strong>
                                    <ul className="list-disc ml-5 mt-2 max-h-32 overflow-y-auto">
                                        {validationResults
                                            .filter(v => !v.isValid)
                                            .slice(0, 5)
                                            .map((v, i) => (
                                                <li key={i}>
                                                    Row {v.row}: {v.errors.join(", ")}
                                                </li>
                                            ))}
                                        {validationResults.filter(v => !v.isValid).length > 5 && (
                                            <li className="text-sm italic">
                                                ... and {validationResults.filter(v => !v.isValid).length - 5} more errors
                                            </li>
                                        )}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b">
                                <span className="text-sm font-medium">Preview (first 10 rows)</span>
                            </div>
                            <div className="overflow-x-auto max-h-64">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">Row</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Serial No.</TableHead>
                                            <TableHead>IoT Tag</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.map((row, idx) => {
                                            const validation = validationResults[idx];
                                            return (
                                                <TableRow key={idx}>
                                                    <TableCell>{idx + 2}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={validation?.isValid ? "default" : "destructive"}
                                                            className={validation?.isValid ? "bg-green-100 text-green-800" : ""}
                                                        >
                                                            {validation?.isValid ? "Valid" : "Error"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{row.name}</TableCell>
                                                    <TableCell>{row.category}</TableCell>
                                                    <TableCell>{row.serialNumber || row.serialnumber}</TableCell>
                                                    <TableCell>{row.iotTag || row.iottag || "-"}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}

                {uploadStatus === "uploading" && (
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#343264]" />
                        <p className="text-gray-600">Uploading devices...</p>
                    </div>
                )}

                {uploadStatus === "complete" && uploadResults && (
                    <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <strong>Upload Complete!</strong>
                                <p className="mt-1">
                                    Successfully added {uploadResults.successCount} devices.
                                    {uploadResults.failedCount > 0 && (
                                        <span className="text-red-600">
                                            {" "}{uploadResults.failedCount} failed.
                                        </span>
                                    )}
                                </p>
                            </AlertDescription>
                        </Alert>

                        {uploadResults.failedCount > 0 && (
                            <div className="border rounded-lg p-4 bg-red-50">
                                <h4 className="font-medium text-red-800 mb-2">Failed Uploads:</h4>
                                <ul className="list-disc ml-5 text-sm text-red-700 max-h-32 overflow-y-auto">
                                    {uploadResults.results.failed.map((fail, i) => (
                                        <li key={i}>
                                            Row {fail.row} ({fail.name}): {fail.errors.join(", ")}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {uploadStatus === "error" && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {uploadResults?.message || "An error occurred during upload."}
                        </AlertDescription>
                    </Alert>
                )}

                <DialogFooter className="gap-2">
                    {uploadStatus === "complete" || uploadStatus === "error" ? (
                        <>
                            <Button variant="outline" onClick={handleReset}>
                                Upload Another File
                            </Button>
                            <Button onClick={handleClose} className="bg-[#343264]">
                                Close
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={uploadStatus !== "valid"}
                                className="bg-[#343264] hover:bg-[#2a2751]"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload {validationSummary.validCount} Devices
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default BulkUploadDialog;