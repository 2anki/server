import { Request, Response } from 'express';
import Workspace from '../../lib/parser/WorkSpace';
import CardOption from '../../lib/parser/Settings/CardOption';
import GeneratePackagesUseCase from '../../usecases/uploads/GeneratePackagesUseCase';
import { UploadedFile } from '../../lib/storage/types';
import fs from 'fs';
// path is not strictly needed for fs.promises.rm with recursive, but good to keep in mind for other fs ops.

export class ApiDeckController {
    public async createDeck(req: Request, res: Response): Promise<void> {
        const { title, content, options } = req.body;

        if (!title || typeof title !== 'string' || !title.trim()) {
            res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
            return;
        }

        if (!content || typeof content !== 'string' || !content.trim()) {
            res.status(400).json({ error: 'Content is required and must be a non-empty string.' });
            return;
        }

        let workspace: Workspace | undefined;

        try {
            workspace = new Workspace(true, 'fs');

            const originalFilename = title ? `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md` : 'deck.md';
            const contentBuffer = Buffer.from(content as string);

            // Constructing a mock UploadedFile.
            // Express.Multer.File fields that might not be used by the core logic can be dummied.
            // 'key' is from our UploadedFile extension.
            const mockFile: UploadedFile = {
                originalname: originalFilename,
                buffer: contentBuffer,
                mimetype: 'text/markdown',
                size: contentBuffer.byteLength,
                key: originalFilename,
                fieldname: 'file', // Dummy
                encoding: 'utf-8', // Dummy
                destination: '', // Dummy
                filename: originalFilename, // Dummy
                path: '', // Dummy. GeneratePackagesUseCase reads from buffer if path is not set.
                stream: null as any, // Dummy
            };

            let cardOptionsData = CardOption.LoadDefaultOptions();
            cardOptionsData['deckName'] = title as string;

            if (options && typeof options === 'object') {
                // Filter out any non-string options to satisfy CardOption constructor
                const stringOptions: { [key: string]: string } = {};
                for (const [key, value] of Object.entries(options)) {
                    if (typeof value === 'string') {
                        stringOptions[key] = value;
                    }
                }
                cardOptionsData = { ...cardOptionsData, ...stringOptions };
            }
            const cardOptions = new CardOption(cardOptionsData);

            const paying = true; // Hardcoded for now

            const useCase = new GeneratePackagesUseCase();
            // The 'files' argument to useCase.execute expects UploadedFile[]
            // The worker inside GeneratePackagesUseCase checks for file.path OR file.buffer
            await useCase.execute(paying, [mockFile], cardOptions, workspace);

            const apkgBuffer = await workspace.getFirstAPKG();
            if (!apkgBuffer) {
                // This case might indicate an issue with deck generation not producing an APKG
                // or getFirstAPKG() not finding it.
                throw new Error('APKG file not generated or found in workspace.');
            }

            const downloadFilename = title ? `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.apkg` : 'deck.apkg';
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
            res.status(200).send(apkgBuffer);

        } catch (error: any) {
            console.error('Error creating deck:', error);
            // Check if headers have already been sent before trying to send a JSON response
            if (!res.headersSent) {
                 res.status(500).json({ error: 'Failed to create deck', details: error.message });
            }
        } finally {
            if (workspace && workspace.location) {
                try {
                    // Using fs.promises.rm for modern async cleanup
                    await fs.promises.rm(workspace.location, { recursive: true, force: true });
                    console.log('Workspace cleaned up:', workspace.location);
                } catch (cleanupError) {
                    console.error('Error cleaning up workspace:', workspace.location, cleanupError);
                }
            }
        }
    }
}
