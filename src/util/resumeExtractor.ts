import fs from "node:fs";
import pdf from "pdf-parse";

export async function readResumePdf(filePath: string): Promise<string> {
	const dataBuffer = fs.readFileSync(filePath);

	const data = await pdf(dataBuffer);
	return data.text;
}
