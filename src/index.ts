#!/usr/bin/env node
import { Command } from "commander";
import PDFDocument from "pdfkit";
import inquirer from "inquirer";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { Cletter, generateCLetter } from "./ai/index.js";

const CONFIG = {
	RESUME_PATH: `${os.homedir()}/personal/resume/current/zhen_resume.pdf`,
	FONT_PATH_REGULAR: "/Users/zhen/Library/Fonts/NotoSansCJKkr-Regular.otf",
	FONT_PATH_BOLD: "/Users/zhen/Library/Fonts/NotoSansCJKkr-Bold.otf",
	OUTPUT_BASE: path.join(os.homedir(), "personal", "resume", "cover_letter"),
};

const program = new Command();

program
	.name("pdf-gen")
	.option("-c, --company <name>", "company name")
	.option("-l, --lang <language>", "language (en/kr)")
	.parse();

const options = program.opts();

let company = options["company"];
let language = options["lang"];
if (!company) {
	const companyAnswer = await inquirer.prompt([
		{ name: "company", message: "Enter Company Name:", type: "input" },
	]);
	company = companyAnswer.company as string;
}
if (!language) {
	const languageAnswer = await inquirer.prompt([
		{
			name: "language",
			message: "Select Language:",
			type: "list",
			choices: [
				{ name: "English", value: "english" },
				{ name: "Korean", value: "korean" },
				{ name: "Both", value: "english and korean" },
			],
		},
	]);
	language = languageAnswer.language as string;
}

try {
	const letterContent: Cletter = await generateCLetter(
		company,
		CONFIG.RESUME_PATH,
		language,
	);
	const outputFileName = company.replace(
		/[^a-zA-Z0-9_-\u3131-\u3163\uAC00-\uD7A3]/g,
		"",
	);

	function generatePDF(content: string, lang: "en" | "kr") {
		const outputDir = path.join(CONFIG.OUTPUT_BASE, lang);
		const outputPath = path.join(outputDir, `${outputFileName}.pdf`);

		fs.mkdirSync(outputDir, { recursive: true });
		const doc = new PDFDocument({ margin: 50 });
		doc.pipe(fs.createWriteStream(outputPath));

		doc.registerFont("NotoSansCJKkr-Regular", CONFIG.FONT_PATH_REGULAR);
		doc.registerFont("NotoSansCJKkr-Bold", CONFIG.FONT_PATH_BOLD);

		const lines = content.replace(/\\n/g, "\n").split("\n");
		const regularFont = "NotoSansCJKkr-Regular";
		const boldFont = "NotoSansCJKkr-Bold";
		lines.forEach((line, index) => {
			if (line.trim() === "") {
				doc.moveDown();
			} else if (line.startsWith("# ")) {
				const headerText = line.substring(2);
				doc.font(boldFont)
					.fontSize(12)
					.fillColor("black")
					.text(headerText);
				if (index < lines.length - 1) doc.moveDown(0.3);
			} else if (line.startsWith("@ ")) {
				const contactText = line.substring(2);
				doc.font(boldFont)
					.fontSize(9)
					.fillColor("#444444")
					.text(contactText);
				if (index < lines.length - 1) doc.moveDown(0.2);
			} else {
				doc.font(regularFont)
					.fontSize(10)
					.fillColor("black")
					.text(line);
				if (index < lines.length - 1) doc.moveDown(0.5);
			}
		});
		doc.end();

		const langName = lang === "en" ? "English" : "Korean";
		console.log(`${langName} Cover Letter Generated`);
		console.log(outputPath);
	}

	if (letterContent.en) generatePDF(letterContent.en, "en");
	if (letterContent.kr) generatePDF(letterContent.kr, "kr");
} catch (error) {
	console.error("Failed to generate cover letter: ", error);
	process.exit(1);
}
