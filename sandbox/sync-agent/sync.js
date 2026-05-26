import "dotenv/config";
import chokidar from "chokidar";
import { MongoClient, GridFSBucket } from "mongodb";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

const MONGO_URI = process.env.MongoDB_URI;
const projectId = process.env.PROJECT_ID;
const localDirectory = "/workspace";
const BUCKET_NAME = "project_files";

let db;
let bucket;

async function connectMongo() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db();
    bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
    console.log("Connected to MongoDB");
}

// ─── equivalent to checkS3ForFiles ───────────────────────────────────────────
async function checkMongoForFiles() {
    console.log(`Checking MongoDB for existing files in project: ${projectId}`);
    const files = await bucket
        .find({ "metadata.projectId": projectId })
        .toArray();
    return files; // [] when project is brand-new
}

// ─── equivalent to downloadFilesFromS3 ───────────────────────────────────────
async function downloadFilesFromMongo(mongoFiles) {
    console.log("Found existing files in MongoDB. Syncing to local directory...");
    for (const file of mongoFiles) {
        const relativePath = file.metadata.relativePath;
        const localFilePath = path.join(localDirectory, relativePath);

        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });

        await new Promise((resolve, reject) => {
            const downloadStream = bucket.openDownloadStream(file._id);
            const writeStream = fs.createWriteStream(localFilePath);
            downloadStream.pipe(writeStream);
            writeStream.on("finish", resolve);
            writeStream.on("error", reject);
            downloadStream.on("error", reject);
        });

        console.log(`Downloaded ${relativePath} to ${localFilePath}`);
    }
}

// ─── equivalent to uploadFileToS3 ────────────────────────────────────────────
async function uploadFileToMongo(filePath) {
    try {
        if (filePath.includes("node_modules") || filePath.includes(".env")) return;

        const relativePath = path.relative(localDirectory, filePath);
        console.log(`Uploading: ${filePath}`);

        // Delete the old version first (GridFS keeps multiple revisions otherwise)
        const existing = await bucket
            .find({ "metadata.projectId": projectId, "metadata.relativePath": relativePath })
            .toArray();
        for (const old of existing) {
            await bucket.delete(old._id);
        }

        const readStream = fs.createReadStream(filePath);
        const uploadStream = bucket.openUploadStream(relativePath, {
            metadata: { projectId, relativePath },
        });

        await new Promise((resolve, reject) => {
            readStream.pipe(uploadStream);
            uploadStream.on("finish", resolve);
            uploadStream.on("error", reject);
            readStream.on("error", reject);
        });

        console.log(`Successfully synced ${relativePath} to MongoDB`);
    } catch (err) {
        console.error(`Error syncing ${filePath} to MongoDB:`, err);
    }
}

// ─── watcher (unchanged logic) ────────────────────────────────────────────────
function startWatcher(hasFiles) {
    console.log("Starting chokidar watch...");
    chokidar
        .watch(localDirectory, {
            ignored: [
                /(^|[\/\\])\../,  // dotfiles
                /node_modules/,
                /\.env/,
            ],
            persistent: true,
            ignoreInitial: hasFiles,
        })
        .on("all", async (event, filePath) => {
            if (event === "add" || event === "change") {
                if (filePath.includes("node_modules") || filePath.includes(".env")) return;
                await uploadFileToMongo(filePath);
            }
        });
}

// ─── init ─────────────────────────────────────────────────────────────────────
async function init() {
    try {
        await connectMongo();

        const mongoFiles = await checkMongoForFiles();
        const hasFiles = mongoFiles.length > 0;

        if (hasFiles) {
            await downloadFilesFromMongo(mongoFiles);
        } else {
            console.log("No files found in MongoDB. Local files will be synced automatically.");
        }

        startWatcher(hasFiles);
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

init();