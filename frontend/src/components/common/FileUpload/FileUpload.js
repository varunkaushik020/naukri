import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import ICONS from '../../../constants/icons';
import { getIconLabel } from '../../../utils/iconHelper';
import './FileUpload.css';

const FileUpload = ({
    label,
    accept = '.pdf,.doc,.docx',
    maxSizeMB = 2,
    onFileSelect,
    existingFileUrl,
    helpText
}) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const validateFile = (file) => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a PDF or Word document');
            return false;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            toast.error(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }

        return true;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!validateFile(file)) {
            e.target.value = '';
            return;
        }

        setSelectedFile(file);

        const simplifyFileName = (name, maxLength = 40) => {
            if (!name || name.length <= maxLength) return name;

            const extension = name.slice(name.lastIndexOf('.'));
            const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));

            if (nameWithoutExt.length > maxLength - extension.length) {
                const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length);
                return truncatedName + extension;
            }

            return name;
        };

        const simplifiedName = simplifyFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            const fullBase64String = event.target.result;

            const base64Content = fullBase64String.split(',')[1] || fullBase64String;

            onFileSelect({
                file: file,
                name: simplifiedName,
                size: file.size,
                type: file.type,
                base64: base64Content,
                dataUri: fullBase64String
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileSelect(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="file-upload-container">
            <label className="file-upload-label">
                {label}
            </label>

            {!selectedFile && !existingFileUrl ? (
                <div className="file-upload-area">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        className="file-input"
                        disabled={uploading}
                    />
                    <div className="file-upload-content">
                        <div className="upload-icon" role="img" aria-label={getIconLabel('UPLOAD')}>{ICONS.UPLOAD}</div>
                        <p>Click to upload or drag and drop</p>
                        <p className="file-types">PDF, DOC, DOCX (Max {maxSizeMB}MB)</p>
                    </div>
                </div>
            ) : (
                <div className="file-preview">
                    <div className="file-info">
                        <div className="file-icon" role="img" aria-label={getIconLabel('FILE')}>{ICONS.FILE}</div>
                        <div className="file-details">
                            <span className="file-name">
                                {selectedFile?.name ||
                                    (existingFileUrl && existingFileUrl.startsWith('data:')
                                        ? 'Uploaded File'
                                        : existingFileUrl?.split('/').pop() || 'File')}
                            </span>
                            {selectedFile && (
                                <span className="file-size">
                                    {formatFileSize(selectedFile.size)}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="remove-file-btn"
                            title="Remove file"
                            aria-label="Remove file"
                        >
                            {ICONS.CLOSE}
                        </button>
                    </div>
                </div>
            )}

            {helpText && (
                <small className="file-help">{helpText}</small>
            )}
        </div>
    );
};

export default FileUpload;
