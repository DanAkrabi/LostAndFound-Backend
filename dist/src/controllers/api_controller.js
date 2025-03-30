"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImage = generateImage;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function generateImage(movieName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const base = process.env.DOMAIN_BASE + "/";
            const response = yield axios_1.default.post("https://api.openai.com/v1/images/generations", {
                model: "dall-e-2",
                prompt: `A visually striking movie poster for the film ${movieName}, inspired by the iconic classic Hollywood poster design. The composition should be cinematic and dramatic, with the main characters posed heroically, prominently showcasing their iconic costumes and expressions. Use dynamic, high-contrast lighting to emphasize the characters and create a sense of depth. ${movieName} should be boldly displayed in vintage, stylized typography at the center, with a tagline or slogan below. The background should reflect the genre and mood of the film, incorporating elements like scenic landscapes, urban settings, or action-packed sequences, while using a color palette that enhances the emotional tone of the movie (e.g., dark and moody for a thriller, vibrant and colorful for a comedy). Include subtle details to evoke the film's era and atmosphere, such as film grain or retro design elements.`,
                n: 1,
                size: "1024x1024",
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            if (response.data && response.data.data && response.data.data[0].url) {
                const imageUrl = response.data.data[0].url; // קח את ה-URL של התמונה
                const imageResponse = yield axios_1.default.get(imageUrl, {
                    responseType: "arraybuffer", // מבקש את התמונה כ-arraybuffer
                });
                const filename = `${Date.now()}_${movieName.replace(/[^a-z0-9]/gi, "_")}.png`;
                const baseDir = "/home/st111/As1";
                const uploadDir = path.resolve(baseDir, "poststorage");
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filePath = path.join(uploadDir, filename);
                fs.writeFileSync(filePath, imageResponse.data); // שמור את התמונה כקובץ
                console.log("Generated image saved at:", filePath);
                return `${base}poststorage/${filename}`;
            }
            else {
                console.error("No image URL received or invalid content type.");
                return null;
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error("Error generating image:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
            else {
                console.error("Unknown error:", error);
            }
            return null;
        }
    });
}
//# sourceMappingURL=api_controller.js.map