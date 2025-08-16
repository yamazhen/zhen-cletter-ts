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
	.option("-l, --lang <language>", "language (en/kr)", "en")
	.parse();

const options = program.opts();

let company = options["company"];
if (!company) {
	const answers = await inquirer.prompt([
		{ name: "company", message: "Enter Company Name:", type: "input" }
	])
	company = answers.company as string;
}

const templateContent = templates[options["lang"] as keyof typeof templates](company);

const homeDir = os.homedir();
const outputDir = path.join(homeDir, "personal", "resume", "cover_letter", options["lang"]);
const outputPath = path.join(outputDir, `${company}.pdf`)

fs.mkdirSync(outputDir, { recursive: true })

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream(outputPath));

doc.fontSize(16)
	.text(templateContent);

doc.end();
console.log(`Cover Letter Generator: ${outputPath}`)
