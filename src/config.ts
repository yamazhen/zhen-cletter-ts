const GEMINI_KEY = process.env["GEMINI_API"];
if (!GEMINI_KEY) {
	throw Error("GEMINI_API env var unavailable");
}

export { GEMINI_KEY };
