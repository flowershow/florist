import { Octokit } from "octokit";

export function getOctokit(accessToken: string) {
    return new Octokit({
        auth: accessToken,
    });
}

export type Repo = {
    id: number;
    name: string;
    full_name: string;
    owner: {
        login: string;
    };
    private: boolean;
    default_branch: string;
};

export type FileContent = {
    name: string;
    path: string;
    sha: string;
    content?: string; // Decoded content
    download_url: string | null;
    type: "file" | "dir";
};
