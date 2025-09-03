import {BinaryLike, createHash} from "crypto";

export function generateId(): string {
    return Math.random().toString(36).substring(2, 10);
}

function sha256File(fileBuffer:BinaryLike): string {
    const hashSum = createHash("sha256");
    hashSum.update(fileBuffer);
    return hashSum.digest("hex");
}