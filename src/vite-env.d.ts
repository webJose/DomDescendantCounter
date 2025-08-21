// Type declarations for Vite raw imports
declare module '*.html?raw' {
    const content: string;
    export default content;
}

declare module '*.css?raw' {
    const content: string;
    export default content;
}

declare module '*.txt?raw' {
    const content: string;
    export default content;
}

declare module '*.css';
