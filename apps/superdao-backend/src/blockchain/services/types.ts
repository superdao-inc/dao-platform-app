type Path = string;

type Hash = string;

type DagLink = {
	Hash: Record<Path, Hash>;
	Name: string;
	Tsize: number;
};

export type GetDagResponse = {
	Data: Record<string, { bytes: string }>;
	Links: DagLink[];
};

export type SaveFileToIpfsResponse = {
	Name: string;
	Hash: string;
	Size: string;
};
