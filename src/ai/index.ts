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
7. Add "# " for headers (like "# Dear Hiring Manager,"
or "# Sincerely,")
8. Add "@ " prefix to each line of contact information
at the top for better formatting
9. Only include contact information at the very top
of the letter - do NOT repeat it after "Sincerely,"
or anywhere else in the letter
10. IMPORTANT: Add actual line breaks between sections:
   - Line break after each contact info line
   - Line break after the date
   - Line break between paragraphs
   - Line break before and after headers
11. Format exactly like this example:
@ FULL NAME
@ PHONE NUMBER
@ EMAIL
@ WEBSITE

DATE

# Dear Hiring Manager,

First paragraph here.

Second paragraph here.

# Sincerely,

NAME
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
