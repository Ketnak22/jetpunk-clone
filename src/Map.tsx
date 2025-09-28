import { useEffect, useRef, useState } from "react";

interface MapProps {
    url: string;
}

function removePolishChars(text: string): string {
    const polishChars: { [key: string]: string } = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    };

    return text.split('').map(char => polishChars[char as keyof typeof polishChars] || char).join('');
}

export function Map({ url }: MapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [paths, setPaths] = useState<SVGPathElement[]>([]);
    const [svgLoaded, setSvgLoaded] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Fetch and inject SVG
    useEffect(() => {
        fetch(url)
            .then(res => res.text())
            .then(svg => {
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                    const foundPaths = Array.from(containerRef.current.querySelectorAll("path"));
                    setPaths(foundPaths);
                    setSvgLoaded(true);
                }
            });
    }, [url]);

    // Add click listeners once SVG is loaded
    useEffect(() => {
        if (svgLoaded) {
            paths.forEach((path, index) => {
                console.log(`Path ${index}:`, path.getAttribute("d"));
                path.addEventListener("click", () => {
                    path.style.fill = "red";
                });
            });
        }
    }, [svgLoaded, paths]);

    // React to input changes
    useEffect(() => {
        paths.forEach(path => {
            if (removePolishChars(path.id.toLocaleLowerCase()) === removePolishChars(inputValue.toLocaleLowerCase())) {
                path.style.fill = "green";
            }
        });
    }, [inputValue, paths]);

    return (
        <>
            <div ref={containerRef} />
            <input
                type="text"
                ref={inputRef}
                onChange={() => setInputValue(inputRef.current?.value || "")}
                placeholder="Wpisz..."
            />
        </>
    );
}
