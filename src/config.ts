import dotenv from "dotenv";
dotenv.config();

const GEMINI_KEY = process.env["GEMINI_API"];
if (!GEMINI_KEY) {
	throw Error("Gemini key not set");
}

export { GEMINI_KEY };
