import internal = require("stream");
import { URL } from "url";
import * as vscode from "vscode";

const categories = [
    "random",
    "movie",
    "game",
    "album",
    "book",
    "face",
    "fashion",
    "shoes",
    "watch",
    "furniture",
    "burger",
    "pizza",
    "drink",
    "car",
    "house"
];
const defaultApiEndpoint = "https://api.lorem.space/image/";

type ImageType = {
    category: string,
    width: number,
    height: number,
};

export function getImageUrl(category: string, width: number, height: number): string {
    let endpoint: string = vscode.workspace.getConfiguration("loremSpace").get("apiEndpoint", "");
    if (endpoint === "") {
        endpoint = defaultApiEndpoint;
    }

    if (endpoint[endpoint.length-1] !== "/") {
        endpoint += "/";
    }

    let url = new URL(endpoint);
    
    if (category !== "random") {
        url.pathname += category;
    }

    if (width > 0) {
        url.searchParams.append("w", width.toString());
    }

    if (height > 0) {
        url.searchParams.append("h", height.toString());
    }

    url.searchParams.append("hash", generateRandomString());

    return url.toString();
}

async function newImage(): Promise<ImageType> {
    let category = await vscode.window.showQuickPick(
        categories,
        { canPickMany: false }
    );

    if (!category) {
        category = "";
    }

    let width = await vscode.window.showInputBox({
        prompt:
            "Enter image width (in pixels)",
        placeHolder: "Or press enter to use auto width",
        validateInput: validateSize,
    });

    let height = await vscode.window.showInputBox({
        prompt:
            "Enter image height (in pixels)",
        placeHolder: "Or press enter to use auto height",
        validateInput: validateSize,
    });

    let widthNum = Number(width);
    let heightNum = Number(height);

    return {
        category: category,
        width: widthNum,
        height: heightNum,
    };
}

function validateSize(size: string) {
    const sizeNum = Number(size);
    if (isNaN(sizeNum)) {
        return "Enter a valid number.";
    } else if (sizeNum < 0 || sizeNum > 2000) {
        return "Enter a number between 0 and 2000.";
    } else {
        return;
    }
}

export async function vscodeLoremImage() {
    const imageType = await newImage();

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showTextDocument(await vscode.workspace.openTextDocument({
            content: getImageUrl(imageType.category, imageType.width, imageType.height),
        }));
    } else {
        editor.edit((editBuilder) => {
            editor.selections.forEach((selection) => {
                editBuilder.delete(selection);
                editBuilder.insert(selection.start, getImageUrl(imageType.category, imageType.width, imageType.height));
            });
        });
    }
}

function generateRandomString() {
    return Math.random().toString(36).substring(2,10);;
}