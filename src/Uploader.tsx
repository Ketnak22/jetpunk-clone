import Dropzone from 'react-dropzone';
import './Uploader.css';

import { useState, useRef, useEffect } from 'react';

interface PathStyle {
    fill?: string;
}

export function Uploader() {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [originalSvgContent, setOriginalSvgContent] = useState<string | null>(null);
    const [initialPathStyle, setInitialPathStyle] = useState<PathStyle[]>([]);
    const [paths, setPaths] = useState<SVGPathElement[]>([]);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const handleDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file && file.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setSvgContent(text);
                setOriginalSvgContent(text); // Save original SVG for later use

                // Parse SVG and extract path elements
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'image/svg+xml');
                    const pathNodes = doc.querySelectorAll('path');
                    setPaths(Array.from(pathNodes) as SVGPathElement[]);

                    setInitialPathStyle(Array.from(pathNodes).map(path => ({
                        fill: path.style.fill || '',
                    })));
                } catch (err) {
                    setPaths([]);
                    setInitialPathStyle([]);
                }
            };
            reader.readAsText(file);
        } else {
            setSvgContent(null);
            setPaths([]);
            setInitialPathStyle([]);
            setOriginalSvgContent(null);
        }
    };

    // Highlight path on hover and handle click-to-focus
    useEffect(() => {
        if (!containerRef.current) return;
        const svgPaths = Array.from(containerRef.current.querySelectorAll('path'));
        svgPaths.forEach((path, idx) => {
            path.style.transition = 'fill 0.2s, stroke 0.2s';
            if (hoveredIndex === idx) {
                path.style.fill = '#ffe5b4';
            } else {
                path.style.fill = initialPathStyle[idx]?.fill || '';
            }
            path.onclick = null;
            path.onclick = () => {
                inputRefs.current[idx]?.focus();
                svgPaths.forEach((p, j) => {
                    p.style.fill = initialPathStyle[j]?.fill || '';
                });
                path.style.fill = '#ffe5b4';
            };
        });
    }, [hoveredIndex, svgContent, paths, initialPathStyle]);

    return (
        <div className="uploader-container">
            {!svgContent && paths.length === 0 &&
                <Dropzone accept={{ 'image/svg+xml': ['.svg'] }} onDrop={handleDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                            <div {...getRootProps()} className="uploader-dropzone">
                                <input {...getInputProps()} />
                                <p>Przeciągnij i upuść plik SVG tutaj lub kliknij, aby wybrać plik</p>
                            </div>
                        </section>
                    )}
                </Dropzone>
            }
            {svgContent && paths.length > 0 && (
                <>
                    <div className="uploader-svg-preview">
                        <div
                            ref={containerRef}
                            dangerouslySetInnerHTML={{ __html: svgContent }} // Load SVG into HTML
                        />
                    </div>

                    <div className='uploader-interaction'>
                        <div className='uploader-input-list'>
                            {paths.map((path: SVGPathElement, i: number) => (
                                <input
                                    type="text"
                                    key={i}
                                    placeholder={path.id || ''}
                                    ref={el => { inputRefs.current[i] = el; }}
                                    onFocus={() => setHoveredIndex(i)}
                                />
                            ))}
                        </div>

                        <div className='uploader-btn-div'>
                            <button className='uploader-btn' onClick={() => {
                                if (!originalSvgContent) return;

                                // Parse original SVG
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(originalSvgContent, 'image/svg+xml');
                                const pathNodes = doc.querySelectorAll('path');

                                // Replace ids with input values
                                pathNodes.forEach((path, i) => {
                                    path.setAttribute('id', inputRefs.current[i]?.value || path.id || '');
                                });

                                // Serialize SVG
                                const serializer = new XMLSerializer();
                                const newSvg = serializer.serializeToString(doc.documentElement);
                                const svgBlob = new Blob([newSvg], { type: 'image/svg+xml' });
                                const svgUrl = URL.createObjectURL(svgBlob);

                                const newTab = window.open();
                                if (newTab) {
                                    newTab.document.write(`<iframe src="${svgUrl}" frameborder="0" style="width:100%;height:100%;" />`);
                                    newTab.document.close();
                                }

                                /* TODO:
                                 - Write empty id if input corresponding to path is empty
                                 - Add ignore button for each input (write empty id for corresponding path)
                                */
                            }}>Wyślij</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}