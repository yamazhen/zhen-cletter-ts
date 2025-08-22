import { GoogleGenAI } from "@google/genai";
import { GEMINI_KEY } from "../config.js";
import { readResumePdf } from "../util/resumeExtractor.js";
import { getSchema } from "./schema.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY! });

export interface Cletter {
	en?: string;
	kr?: string;
}

async function researchCompany(company: string): Promise<string> {
	const res = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: `
Research the company "${company}" and provide
key information about their business, values,
recent news and what they look for in employees.
Keep it concise but comprehensive
`,
	});
	return res.text!;
}

export async function generateCLetter(
	company: string,
	resumePath: string,
	language: string,
) {
	const companyResearch = await researchCompany(company);
	const resume = await readResumePdf(resumePath);
	const today = new Date()

	const prompt = `
Generate a complete, personalized cover letter
in ${language} language for ${company} using
the actual information provided below.

Company Research:
${companyResearch}

My Resume:
${resume}

Today's Date:
${today}

IMPORTANT:
- Use REAL contact information from the
resume (no placeholders like [Current Date],
[Company Address])
- Write actual date, not placeholder
- Use specific company details, not generic
text
- NO brackets, NO placeholders, NO template
markers

Write a complete cover letter that:
1. Uses my actual name and contact information
given in the resume (no placeholders).
2. Highlights relevant experience rom my
resume that matches their needs.
3. Shows genuine knowledge about ${company}
based on the research.
4. Is professional and engaging.
5. Includes proper formatting with my contact
info at the top.
6. Keep it one page and not too long.
7. Add "# " for headers (like "# Dear Hiring Manager," or "# Sincerely,")

Generate the complete letter with no
placeholders or template markers.
`;

	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: prompt,
		config: {
			responseMimeType: "application/json",
			responseSchema: getSchema(language),
		},
	});
	return JSON.parse(response.text!) as Cletter;
}
