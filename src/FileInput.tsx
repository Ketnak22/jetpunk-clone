import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import "./FileInput.css";

export type FileInputProps = {
  size?: number | string; // width in px or CSS unit (e.g. "320px" or "100%")
  onFiles?: (files: File[]) => void;
};

export function FileInput({ size = "320px", onFiles }: FileInputProps) {
    const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("accepted files:", acceptedFiles);
      onFiles?.(acceptedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept: {
        "image/svg": [".svg"]
    }
  });

  const styleVars = useMemo(
    () => ({
      width: typeof size === "number" ? `${size}px` : size,
    }),
    [size]
  );

  return (
    <div
      className={`uploader ${isDragActive ? "uploader--active" : ""} ${
        isFocused ? "uploader--focus" : ""
      }`}
      style={styleVars}
      {...getRootProps()}
      role="button"
      tabIndex={0}
      aria-label="File dropzone, click or drop file here"
    >
      <input {...getInputProps()} />

      <div className="uploader__content">
        <svg className="uploader__icon" viewBox="0 0 24 24" aria-hidden>
          <path d="M5 20h14v-2H5v2zm7-18L5.33 9h3.67v6h6V9h3.67L12 2z" />
        </svg>
        <p className="uploader__text">
          {isDragActive
            ? "Drop files to upload"
            : "Drag & drop file, or click to select"}
        </p>
        <p className="uploader__hint">Supported: svg</p>
      </div>
    </div>
  );
}