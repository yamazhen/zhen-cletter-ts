#!/usr/bin/env node
import { Command } from "commander";
import PDFDocument from "pdfkit"
import inquirer from "inquirer";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import templates from "./templates/index.js";

const program = new Command();

program
	.name("pdf-gen")
	.option("-c, --company <name>", "company name")
	.option("-l, --lang <language>", "language (en/kr)",)
	.parse();

const options = program.opts();

let company = options["company"];
let language = options["lang"];
if (!company) {
	const companyAnswer = await inquirer.prompt([{ name: "company", message: "Enter Company Name:", type: "input" }]);
	company = companyAnswer.company as string;
}
if (!language) {
	const languageAnswer = await inquirer.prompt([
		{
			name: "language",
			message: "Select Language:",
			type: "list",
			choices: [
				{ name: "English", value: "en" },
				{ name: "Korean", value: "kr" }
			]
		}
	]);
	language = languageAnswer.language as string;
}

const templateContent = templates[language as
	keyof typeof templates](company);

const homeDir = os.homedir();
const outputDir = path.join(homeDir, "personal", "resume", "cover_letter", language);
const outputPath = path.join(outputDir, `${company}.pdf`)

fs.mkdirSync(outputDir, { recursive: true })

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream(outputPath));

doc.registerFont("NotoSansCJKkr-Regular", "/Users/zhen/Library/Fonts/NotoSansCJKkr-Regular.otf");
doc.registerFont("NotoSansCJKkr-Bold", "/Users/zhen/Library/Fonts/NotoSansCJKkr-Bold.otf");

const lines = templateContent.split("\n");
const boldFont = language === "kr" ? "NotoSansCJKkr-Bold" : "Helvetica-Bold"
const regularFont = language === "kr" ? "NotoSansCJKkr-Regular" : "Helvetica"
lines.forEach(line => {
	if (line.startsWith("# ")) {
		doc.font(boldFont).fontSize(14).fillColor("blue").text(line.slice(2), { align: "justify" })
	} else if (line.trim()) {
		doc.font(regularFont).fontSize(10).fillColor("black").text(line)
	}
	doc.moveDown(0.5)
})

doc.end();
console.log(`Cover Letter Generator: ${outputPath}`)
