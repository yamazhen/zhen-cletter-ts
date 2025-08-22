import { Type } from "@google/genai";

export function getSchema(language: string) {
	switch (language) {
		case "english and korean": {
			return {
				type: Type.OBJECT,
				properties: {
					en: { type: Type.STRING },
					kr: { type: Type.STRING },
				},
			};
		}
		case "english": {
			return {
				type: Type.OBJECT,
				properties: {
					en: { type: Type.STRING },
				},
			};
		}
		case "korean": {
			return {
				type: Type.OBJECT,
				properties: {
					kr: { type: Type.STRING },
				},
			};
		}
		default: {
			return {
				type: Type.OBJECT,
				properties: {
					en: { type: Type.STRING },
				},
			};
		}
	}
}
