import internal = require("stream");
import { URL } from "url";
import * as vscode from "vscode";

const categories = ["random", "movie", "game", "album", "book", "face", "fashion", "shoes", "watch"];
const defaultApiEndpoint = "https://api.lorem.space/image/";

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

async function newImage(): Promise<string> {
    let category = await vscode.window.showQuickPick(
        categories,
        { canPickMany: false }
    );

    if (!category) {
        category = "";
    }

    let width = await vscode.window.showInputBox({
        prompt:
            "What's the width of the image?",
        placeHolder: "0 for auto width",
        validateInput: validateSize,
    });

    let height = await vscode.window.showInputBox({
        prompt:
            "What's the height of the image?",
        placeHolder: "0 for auto height",
        validateInput: validateSize,
    });

    let widthNum = Number(width);
    let heightNum = Number(height);

    return getImageUrl(category, widthNum, heightNum);
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
    const url = await newImage();

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showTextDocument(await vscode.workspace.openTextDocument({
            content: url,
        }));
    } else {
        editor.edit((editBuilder) => {
            editor.selections.forEach((selection) => {
                editBuilder.delete(selection);
                editBuilder.insert(selection.start, url);
            });
        });
    }
}

function generateRandomString() {
    return Math.random().toString(36).substring(2,10);;
}