// Types for the DOM Descendant Counter extension

export type NodeInfo = {
    tag: string;
    classList: string[];
    id?: string | undefined;
};

export type DescendantData = {
    currentNode: NodeInfo | null;
    total: number;
    visible: number;
    counts: Record<string, { count: number; visible: number }>;
};
