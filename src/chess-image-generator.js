import { createCanvas, loadImage, Frame, fs, path } from "../deps.ts";
import { ChessGame } from "https://deno.land/x/chess@0.6.0/mod.ts"; // Import ChessGame from deno-chess
import {
    cols,
    white,
    black,
    defaultSize,
    defaultPadding,
    defaultLight,
    defaultDark,
    defaultHighlight,
    defaultStyle,
    filePaths,
} from "./config/index.js";

/**
 * Object constructor, initializes options.
 * @param {Options} [options] Optional options
 */
function ChessImageGenerator(options = {}) {
    this.chess = new ChessGame(); // Use deno-chess ChessGame instead of chess.js
    this.highlightedSquares = [];

    this.size = options.size || defaultSize;
    this.padding = options.padding || defaultPadding;
    this.light = options.light || defaultLight;
    this.dark = options.dark || defaultDark;
    this.highlight = options.highlight || defaultHighlight;
    this.style = options.style || defaultStyle;
    this.flipped = options.flipped || false;

    this.ready = false;
}

ChessImageGenerator.prototype = {
    /**
     * Loads PGN into chess game
     * @param {string} pgn Chess game PGN
     */
    async loadPGN(pgn) {
        if (!this.chess.loadPGN(pgn)) { // Use deno-chess loadPGN method
            throw new Error("PGN could not be read successfully");
        } else {
            this.ready = true;
        }
    },

    /**
     * Loads FEN into chess game
     * @param {string} fen Chess position FEN
     */
    async loadFEN(fen) {
        try {
            this.chess = ChessGame.NewFromFEN(fen); // Create a new game from FEN
            this.ready = true;
        } catch (error) {
            throw new Error("FEN could not be read successfully: " + error.message);
        }
    },

    /**
     * Loads position array into chess game
     * @param {string[][]} array Chess position array
     */
    loadArray(array) {
        this.chess.clear(); // Clear the board

        // Load positions
        for (let i = 0; i < array.length; i += 1) {
            for (let j = 0; j < array[i].length; j += 1) {
                if (array[i][j] !== "" && black.includes(array[i][j].toLowerCase())) {
                    this.chess.put(
                        {
                            type: array[i][j].toLowerCase(),
                            color: white.includes(array[i][j]) ? "w" : "b",
                        },
                        cols[j] + (8 - i)
                    );
                }
            }
        }
        this.ready = true;
    },

    /**
     * Set which squares should be highlighted
     * @param {string[]} array chess square coordinate array
     */
    highlightSquares(array) {
        this.highlightedSquares = array;
    },

    /**
     * Generates buffer image based on position
     * @returns {Promise<Buffer>} Image buffer
     */
    async generateBuffer() {
        if (!this.ready) {
            throw new Error("Load a position first");
        }

        const canvas = createCanvas(this.size + this.padding[1] + this.padding[3], this.size + this.padding[0] + this.padding[2]);
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.rect(0, 0, this.size + this.padding[1] + this.padding[3], this.size + this.padding[0] + this.padding[2]);
        ctx.fillStyle = this.light;
        ctx.fill();

        const row = this.flipped ? r => r + 1 : r => 7 - r + 1;
        const col = this.flipped ? c => c : c => 7 - c;

        for (let i = 0; i < 8; i += 1) {
            for (let j = 0; j < 8; j += 1) {
                const coords = cols[col(j)] + row(i);

                if ((i + j) % 2 === 0) {
                    ctx.beginPath();
                    ctx.rect(
                        ((this.size / 8) * (7 - j + 1) - this.size / 8) + this.padding[3],
                        ((this.size / 8) * i) + this.padding[0],
                        this.size / 8,
                        this.size / 8
                    );
                    ctx.fillStyle = this.dark;
                    ctx.fill();
                }

                if (this.highlightedSquares.includes(coords)) {
                    ctx.beginPath();
                    ctx.rect(
                        ((this.size / 8) * (7 - j + 1) - this.size / 8) + this.padding[3],
                        ((this.size / 8) * i) + this.padding[0],
                        this.size / 8,
                        this.size / 8
                    );
                    ctx.fillStyle = this.highlight;
                    ctx.fill();
                }

                const space = this.chess.getSpace(coords); // Get the space details at the coordinates

                if (space && space.piece) {
                    const { pieceType, color } = space.piece; // Destructure the type and color of the piece
                    if (black.includes(pieceType.toLowerCase())) {
                        const image = `resources/${this.style}/${filePaths[`${color}${pieceType}`]}.png`;
                        const imageFile = await loadImage(
                            `https://raw.githubusercontent.com/Awesome-Tofu/deno-chess-image-generator/refs/heads/master/src/${image}`
                        );
                        await ctx.drawImage(
                            imageFile,
                            ((this.size / 8) * (7 - j + 1) - this.size / 8) + this.padding[3],
                            ((this.size / 8) * i) + this.padding[0],
                            this.size / 8,
                            this.size / 8
                        );
                    }
                }
            }
        }

        const frame = new Frame(canvas, {
            image: {
                types: ["png"],
            },
        });
        return frame.toBuffer();
    },

    /**
     * Generates PNG image based on position
     * @param {string} pngPath File name
     */
    async generatePNG(pngPath) {
        if (!this.ready) {
            throw new Error("Load a position first");
        }

        const buffer = await this.generateBuffer();

        fs.open(pngPath, "w", (err, fd) => {
            if (err) {
                throw new Error(`could not open file: ${err}`);
            }

            fs.write(fd, buffer, 0, buffer.length, null, (writeError) => {
                if (writeError) {
                    throw new Error(`error writing file: ${writeError}`);
                }
                fs.close(fd, () => pngPath);
            });
        });
    },
};

export default ChessImageGenerator;
