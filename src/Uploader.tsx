import Dropzone from 'react-dropzone';
import './Uploader.css';

import { useState, useRef, useEffect } from 'react';

import { v4 as uuidv4 } from 'uuid';

interface PathStyle {
    fill?: string;
}

type IdPathMapping = {
    [key: string]: string;
}

type TableList = Array<string>;

interface SentJson {
    name: string;
    data: IdPathMapping | TableList;
}

export function Uploader() {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
                                <div className='uploader-input' key={i}>
                                    <input
                                        type="text"
                                        placeholder={path.id || ''}
                                        ref={el => { inputRefs.current[i] = el; }}
                                        onFocus={() => setHoveredIndex(i)}
                                        onMouseEnter={() => setHoveredIndex(i)}
                                    />
                                    <button 
                                        className='uploader-input-btn'
                                        ref={el => { buttonRefs.current[i] = el } } 
                                        onClick={() => {
                                        if (inputRefs.current[i]) {
                                            if (inputRefs.current[i]!.disabled) {
                                                inputRefs.current[i]!.disabled = false;      

                                                buttonRefs.current[i]!.textContent = 'X';
                                                buttonRefs.current[i]!.style.backgroundColor = '#ff4d4f'; // light red
                                            } else {
                                                inputRefs.current[i]!.disabled = true;

                                                inputRefs.current[i]!.value = '';
                                                inputRefs.current[i]!.placeholder = path.id || '';
                                            
                                                buttonRefs.current[i]!.textContent = '↺';
                                                buttonRefs.current[i]!.style.backgroundColor = '#f0ad4e'; // light orange
                                            }
                                        }
                                        const updatedPaths = [...paths];
                                        updatedPaths[i].id = '';
                                        setPaths(updatedPaths);
                                    }}>X</button>
                                </div>
                            ))}
                        </div>

                        <div className='uploader-btn-div'>
                            <button className='uploader-btn' onClick={() => {
                                if (!originalSvgContent) return;

                                // Parse original SVG
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(originalSvgContent, 'image/svg+xml');
                                const pathNodes = doc.querySelectorAll('path');

                                // Serialize SVG
                                const serializer = new XMLSerializer();
                                const newSvg = serializer.serializeToString(doc.documentElement);
                                const svgBlob = new Blob([newSvg], { type: 'image/svg+xml' });
                                const svgUrl = URL.createObjectURL(svgBlob);

                                // Create mapping of original ids to new ids
                                const pathIdMapping: IdPathMapping = {};

                                // Replace ids with input values or empty string when disabled
                                pathNodes.forEach((path, i) => {
                                    if (inputRefs.current[i]?.disabled) return;
                                    if (path.id) {
                                        pathIdMapping[path.id] = inputRefs.current[i]?.value || path.id;
                                    }
                                });

                                const formData = new FormData();
                                formData.append('svg', svgBlob, 'map.svg');
                                const jsonData = pathIdMapping ? JSON.stringify({
                                    name: 'toBeChanged',
                                    data: pathIdMapping,
                                }) : '{}';
                                const jsonBlob = new Blob([jsonData], { type: 'application/json' });
                                formData.append('json', jsonBlob, 'data.json');


                                fetch('http://localhost:3000/api/uploadMap', {
                                    mode: 'no-cors',
                                    method: 'POST',
                                    body: formData,
                                }).then(response => {
                                    if (response.status === 200) {
                                        console.log('Map uploaded successfully');
                                    } else {
                                        console.error('Error uploading map');
                                    }
                                }).catch(error => {
                                    console.error('Error uploading map:', error);
                                })

                                /* TODO
                                - handle response properly
                                - exit to main page after upload
                                */

                            }}>Wyślij</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}