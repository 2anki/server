import express, { Response } from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs/promises';
import oldFs from 'fs';
import { isEmptyPayload } from '../../lib/misc/isEmptyPayload';
import { getUploadLimits } from '../../lib/misc/getUploadLimits';
import { isPaying } from '../../lib/isPaying';
import { UploadedFile } from '../../lib/storage/types';
import Workspace from '../../lib/parser/WorkSpace';
import CustomExporter from '../../lib/parser/exporters/CustomExporter';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import get16DigitRandomId from '../../shared/helpers/get16DigitRandomId';
import { ZipHandler } from '../../lib/zip/zip';
import {
  isZIPFile,
  isPotentialZipFile,
  isImageFileEmbedable,
  isPlainText,
  isPDFFile,
  isHTMLFile,
  isPPTFile,
  isCSVFile,
  isMarkdownFile,
  isPotentiallyHTMLFile,
} from '../../lib/storage/checks';
import CardOption from '../../lib/parser/Settings/CardOption';
import cheerio from 'cheerio';
import { embedFile } from '../../lib/parser/exporters/embedFile';
import mammoth from 'mammoth';
import { getDatabase } from '../../data_layer';
import { cleanLine } from './cleanLine';
import { parseCard } from './parseCard';
import { handlePartialJson } from './handlePartialJson';
import SessionRepository from '../../data_layer/SessionRepository';
import AuthenticationService from '../../services/AuthenticationService';
import TokenRepository from '../../data_layer/TokenRepository';
import UsersRepository from '../../data_layer/UsersRepository';

// Define the transformToDecks function before it is used
function transformToDecks(cards: any[]): any[] {
  const decks = new Map<string, any>();

  // First pass - collect deck names
  for (const card of cards) {
    if (card.name && !card.front && !card.back) {
      // This is a deck definition
      decks.set(card.name, {
        settings: {
          useInput: false,
          maxOne: true,
          noUnderline: false,
          isCherry: false,
          isAvocado: false,
          isAll: true,
          isTextOnlyBack: false,
          toggleMode: 'close_toggle',
          isCloze: true,
          useTags: false,
          basicReversed: false,
          reversed: false,
          removeMP3Links: true,
          perserveNewLines: true,
          clozeModelName: 'n2a-cloze',
          basicModelName: 'n2a-basic',
          inputModelName: 'n2a-input',
          useNotionId: true,
          pageEmoji: 'first_emoji',
        },
        name: card.name,
        cards: [],
        image: '',
        style: '',
        id: get16DigitRandomId(),
      });
    }
  }

  // If no decks were defined, create a default deck
  if (decks.size === 0) {
    decks.set('Default', {
      settings: {
        useInput: false,
        maxOne: true,
        noUnderline: false,
        isCherry: false,
        isAvocado: false,
        isAll: true,
        isTextOnlyBack: false,
        toggleMode: 'close_toggle',
        isCloze: true,
        useTags: false,
        basicReversed: false,
        reversed: false,
        removeMP3Links: true,
        perserveNewLines: true,
        clozeModelName: 'n2a-cloze',
        basicModelName: 'n2a-basic',
        inputModelName: 'n2a-input',
        useNotionId: true,
        pageEmoji: 'first_emoji',
      },
      name: 'Default',
      cards: [],
      image: '',
      style: '',
      id: get16DigitRandomId(),
    });
  }

  // Second pass - add cards to decks
  for (const card of cards) {
    if (card.front || card.back) {
      const deckName = card.deck || 'Default';
      const deck = decks.get(deckName);
      if (deck) {
        deck.cards.push({
          name: card.front || '',
          back: card.back || '',
          tags: card.tags || [],
          cloze: false,
          number: deck.cards.length,
          enableInput: false,
          answer: '',
          media: card.media || [],
        });
      }
    }
  }

  return Array.from(decks.values());
}

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    data?: {
      workspace?: Workspace;
      uploadedFiles?: Array<{ id: string; name: string; path: string }>;
      deckInfo?: Array<any>;
    };
  }
}

const KiRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const sessionRepository = new SessionRepository(database);
  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );

  const canContinue = async (req: express.Request, res: express.Response) => {
    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    console.log('[KI] User:', user.id);
    if (!user.patreon) {
      res.redirect('/pricing?redirect=/ki');
      return false;
    }

    return true;
  };

  // Define types we need
  type MammothOptions = {
    path?: string;
    buffer?: Buffer;
  };

  type MammothResult = {
    value: string;
    messages: any[];
  };

  // Cast mammoth to have the type we need
  const mammothWithTypes = mammoth as {
    extractRawText(options: MammothOptions): Promise<MammothResult>;
  };

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY is required');
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  // Create multer instance with dynamic limits
  const uploadMiddleware = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const paying = isPaying(res.locals);
    const limits = getUploadLimits(paying);

    const upload = multer({
      storage: multer.diskStorage({
        destination: (_, __, cb) => {
          cb(null, process.env.WORKSPACE_BASE!);
        },
        filename: (_, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
      limits: {
        fileSize: limits.fileSize,
        fieldSize: limits.fieldSize,
      },
    }).array('files');

    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'File too large. Please upgrade for larger file uploads.',
          });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };

  router.get('/ki', async (req, res) => {
    const canViewKiPage = await canContinue(req, res);
    if (!canViewKiPage) {
      return; // Exit if the user cannot continue
    }
    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    // Create new session if requested or get existing one
    const isNewSession = req.query.new === 'true';
    let s;

    if (isNewSession) {
      const w = new Workspace(true, 'fs');
      await sessionRepository.createSession(user.owner, {
        uploadedFiles: [],
        deckInfo: [],
        workspace: w,
      });
      s = await sessionRepository.getSession(user.owner);
    } else {
      s = await sessionRepository.getSession(user.owner);
      if (!s) {
        const w = new Workspace(true, 'fs');
        await sessionRepository.createSession(user.owner, {
          uploadedFiles: [],
          deckInfo: [],
          workspace: w,
        });
        s = await sessionRepository.getSession(user.owner);
      }
    }

    if (!s.data?.workspace?.location) {
      s.data.workspace = new Workspace(true, 'fs');
      await sessionRepository.updateSession(
        user.owner,
        {
          workspace: s.data.workspace,
        },
        s.id
      );
    }

    const exists = oldFs.existsSync(s.data.workspace.location);
    if (!exists) {
      await fs.mkdir(s.data.workspace.location, { recursive: true });
    }
    res.sendFile(path.join(__dirname, '../../templates/ki.html'));
  });

  router.post('/ki/process', async (req, res) => {
    const canProcessText = await canContinue(req, res);
    if (!canProcessText) {
      return; // Exit if the user cannot continue
    }
    const text = req.body.text;

    res.send(`
      <details>
        <summary>Processed Text</summary>
        <p>${text ? 'Using text input' : 'No text provided'}</p>
      </details>
    `);
  });

  router.post('/ki/upload', uploadMiddleware, async (req, res) => {
    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    const userId = user.owner; // Assuming token contains userId
    const userSession = await sessionRepository.getSession(userId); // Ensure session is typed
    if (!userSession || !userSession.data) {
      // Check if userSession.data is defined
      return res.status(403).json({ error: 'Session expired' });
    }

    const files = req.files as UploadedFile[]; // Ensure files are typed
    console.log('[UPLOAD] Request received:', req.body);
    console.log('[UPLOAD] Starting file upload process');
    try {
      console.log('[UPLOAD] Files received:', files);

      if (isEmptyPayload(files)) {
        console.log('[UPLOAD] Empty payload detected');
        return res.status(400).json({
          error: 'No files uploaded or files are empty',
        });
      }

      const existingFiles = new Map(
        userSession.data.uploadedFiles?.map((f: { name: string }) => [
          f.name,
          f,
        ]) || []
      );
      console.log(
        '[UPLOAD] Existing files in session:',
        Array.from(existingFiles.entries())
      );

      for (const file of files) {
        const existing = existingFiles.get(file.originalname) as UploadedFile;
        if (existing) {
          console.log(`[UPLOAD] Removing existing file: ${existing.path}`);
          await fs
            .unlink(existing.path)
            .catch((err) =>
              console.error('[UPLOAD] Error deleting file:', err)
            );
          existingFiles.delete(file.originalname);
        }
      }

      const allowedTypes = [
        'text/plain',
        'text/html',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/zip',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      console.log('[UPLOAD] Processing files...');
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          console.log(`[UPLOAD] Processing file: ${file.originalname}`);
          if (
            !allowedTypes.includes(file.mimetype) ||
            file.mimetype ===
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) {
            console.log(
              `[UPLOAD] Converting file to HTML: ${file.originalname}`
            );
            const htmlFilePath = file.path.replace(/\.[^.]+$/, '.html');

            let fileContent = '';
            if (
              file.mimetype ===
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) {
              console.log('[UPLOAD] Processing DOCX file');
              const result = await mammothWithTypes.extractRawText({
                path: file.path,
              });
              fileContent = result.value;
              console.log(
                `[UPLOAD] Extracted DOCX content, length: ${fileContent.length}`
              );
            } else {
              // Check if file exists
              await fs.access(file.path);
              fileContent = await fs.readFile(file.path, 'utf-8');
              console.log(
                `[UPLOAD] Read file content, length: ${fileContent.length}`
              );
            }

            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head><title>${file.originalname}</title></head>
              <body>
                <h1>${file.originalname}</h1>
                <div>${fileContent}</div>
              </body>
              </html>
            `;

            console.log(`[UPLOAD] Writing HTML file: ${htmlFilePath}`);
            await fs.writeFile(htmlFilePath, htmlContent);
            console.log(`[UPLOAD] Removing original file: ${file.path}`);
            await fs.unlink(file.path);

            const convertedFile = {
              ...file,
              path: htmlFilePath,
              originalname: file.originalname.replace(/\.[^.]+$/, '.html'),
              mimetype: 'text/html',
            };
            console.log(`[UPLOAD] File converted:`, convertedFile);
            return convertedFile;
          }
          console.log(
            `[UPLOAD] File already in supported format: ${file.originalname}`
          );
          return file;
        })
      );

      const fileIds = processedFiles.map((file) => ({
        id: path.basename(file.path),
        name: file.originalname,
        path: file.path,
      }));
      console.log('[UPLOAD] Generated file IDs:', fileIds);

      userSession.data.uploadedFiles = [
        ...Array.from(existingFiles.values()),
        ...fileIds,
      ];
      console.log(
        '[UPLOAD] Updated session files:',
        userSession.data.uploadedFiles
      );

      const fileListHtml = fileIds
        .map(
          (file) => `
        <div class="file-chip" id="file-${file.id}">
          ${file.name}
          <button onclick="this.parentElement.remove()" hx-delete="/ki/upload/${file.id}" hx-swap="none" style="font-size: 20px">×</button>
        </div>
      `
        )
        .join('');

      console.log('[UPLOAD] Sending response with file list HTML');
      res.send(fileListHtml);

      // Check if flashcards were generated
      if (
        !userSession.data.deckInfo ||
        userSession.data.deckInfo.length === 0
      ) {
        console.log('[UPLOAD] No flashcards generated');
      } else {
        console.log('[CURRENT DECK INFO]', userSession.data.deckInfo);
      }

      // Update session with uploaded files (ONLY update files here)
      await sessionRepository.updateSession(
        userId,
        {
          uploadedFiles: userSession.data.uploadedFiles,
        },
        userSession.id
      );
    } catch (error) {
      console.error('[UPLOAD] Error during upload process:', error);
      res.status(500).json({
        error: 'Failed to process upload',
      });
    }
  });

  router.delete('/ki/upload/:fileId', async (req, res) => {
    const canDeleteFile = await canContinue(req, res);
    if (!canDeleteFile) {
      return; // Exit if the user cannot continue
    }

    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    const userSession = await sessionRepository.getSession(user.owner); // Ensure session is typed
    if (!userSession || !userSession.data) {
      console.error('[DELETE] User session not found');
      return res.status(403).json({ error: 'Session expired' });
    }

    const fileId = req.params.fileId;
    try {
      // Remove file from session
      if (userSession.data.uploadedFiles) {
        const fileToDelete = userSession.data.uploadedFiles.find(
          (f: { id: string }) => f.id === fileId
        );
        if (fileToDelete) {
          // Delete the actual file
          await fs.unlink(fileToDelete.path);
        }
        userSession.data.uploadedFiles = userSession.data.uploadedFiles.filter(
          (f: { id: string }) => f.id !== fileId
        );
        await sessionRepository.updateSession(
          user.owner,
          {
            uploadedFiles: userSession.data.uploadedFiles,
          },
          userSession.id
        );
      }
      res.send('');
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        error: 'Failed to delete file',
      });
    }
  });

  interface ProcessedFile {
    content: string;
    name: string;
    media?: string[];
  }

  // Handle valid card
  const handleValidCard = (card: any, res: Response, userSession: any) => {
    if (card) {
      userSession.data.deckInfo.push(card);
      res.write(`event: card\ndata: ${JSON.stringify(card)}\n\n`);
      console.log('[CARD DATA]', JSON.stringify(card, null, 2));
    }
  };

  // Helper function to process each line
  const processLine = (line: string, res: Response, userSession: any) => {
    const trimmed = cleanLine(line);
    if (!trimmed) return;

    try {
      const card = parseCard(trimmed);
      handleValidCard(card, res, userSession);
    } catch {
      handlePartialJson(trimmed, userSession.data.deckInfo, res);
    }
  };

  // Main processChunk function
  function processChunk(text: string, res: Response, userSession: any) {
    const lines = text.split('\n');

    // Process each line
    lines.forEach((line) => processLine(line, res, userSession));
  }

  const isKiPermittedFile = (name: string) => {
    return (
      isPlainText(name) ||
      isPDFFile(name) ||
      isPotentialZipFile(name) ||
      isZIPFile(name) ||
      isHTMLFile(name) ||
      isCSVFile(name) ||
      isPPTFile(name) ||
      isMarkdownFile(name) ||
      isPotentiallyHTMLFile(name)
    );
  };

  async function processFileContent(
    chatSession: ReturnType<GenerativeModel['startChat']>,
    content: string,
    name: string,
    res: Response,
    userSession: any
  ): Promise<void> {
    const timeLabel = `process-file-${name}`;
    console.time(timeLabel);
    const sendStatus = (message: string) => {
      console.log(message);
      const data = JSON.stringify({ message });
      res.write(`event: status\ndata: ${data}\n\n`);
    };

    try {
      const contentSize = content.length;
      sendStatus(`[DEBUG] Content size: ${contentSize / (1024 * 1024)}MB`);

      const chunkSize = 2 * 1024 * 1024; // Reduced to 2MB chunks
      const chunks = [];
      let offset = 0;

      while (offset < content.length) {
        let end = Math.min(offset + chunkSize, content.length);
        if (end < content.length) {
          const nextParagraph = content.indexOf('\n\n', end - 1000);
          if (nextParagraph !== -1 && nextParagraph < end + 1000) {
            end = nextParagraph;
          } else {
            const nextSentence = content.indexOf('. ', end - 200);
            if (nextSentence !== -1 && nextSentence < end + 200) {
              end = nextSentence + 1;
            }
          }
        }

        const chunk = content.slice(offset, end);
        chunks.push(chunk);
        offset = end;
      }

      sendStatus(`[DEBUG] Split content into ${chunks.length} chunks`);

      // Process chunks with rate limiting and retries
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkContent = `File: ${name} (Part ${i + 1}/${chunks.length})\n\n${chunk}`;

        let retries = 3;
        while (retries > 0) {
          try {
            sendStatus(
              `[KI Request] Processing chunk ${i + 1}/${chunks.length} of ${name}, size: ${(chunk.length / (1024 * 1024)).toFixed(2)}MB`
            );
            const fileResponse = await chatSession.sendMessage(chunkContent);
            const responseText = await fileResponse.response.text();
            console.log('[AI Response]', responseText);
            processChunk(responseText, res, userSession);

            // Add delay between chunks to avoid rate limits
            if (i < chunks.length - 1) {
              sendStatus(`[DEBUG] Waiting before processing next chunk...`);
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            break;
          } catch (error: any) {
            retries--;
            if (error?.status === 429) {
              const waitTime = 5000 * (3 - retries); // Exponential backoff
              sendStatus(
                `[DEBUG] Rate limit hit, waiting ${waitTime / 1000}s before retry (${retries} retries left)`
              );
              await new Promise((resolve) => setTimeout(resolve, waitTime));
            } else if (retries === 0) {
              throw error;
            } else {
              const waitTime = 3000;
              sendStatus(
                `[DEBUG] Error occurred, waiting ${waitTime / 1000}s before retry (${retries} retries left)`
              );
              await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
          }
        }
      }
    } catch (error: any) {
      console.error(`Error processing file ${name}:`, error);
      const errorMessage = error?.message || 'Unknown error occurred';
      sendStatus(`[ERROR] Failed to process file ${name}: ${errorMessage}`);
      throw error;
    }

    console.timeEnd(timeLabel);
    const timeValue = process.hrtime();
    const timeMs = (timeValue[0] * 1000 + timeValue[1] / 1e6).toFixed(3);
    sendStatus(`${timeLabel}: ${timeMs}ms`);
  }

  router.post('/ki/generate', uploadMiddleware, async (req, res: Response) => {
    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    const userSession = await sessionRepository.getSession(user.owner); // Ensure session is typed
    if (!userSession) {
      return res.status(403).json({ error: 'Session expired' });
    }

    console.log('[GENERATE] Request received:', req.body);
    const canGenerate = await canContinue(req, res);
    if (!canGenerate) {
      return; // Exit if the user cannot continue
    }
    const timeLabel = '[GENERATE] total-generation';
    console.time(timeLabel);

    try {
      // Set up SSE headers first
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const sendStatus = (message: string) => {
        console.log(message);
        const data = JSON.stringify({ message });
        res.write(`event: status\ndata: ${data}\n\n`);
      };

      const sendTimeEnd = (label: string) => {
        console.timeEnd(label);
        const timeValue = process.hrtime();
        const timeMs = (timeValue[0] * 1000 + timeValue[1] / 1e6).toFixed(3);
        sendStatus(`${label}: ${timeMs}ms`);
      };

      sendStatus('[GENERATE] Starting generation process');

      const payload = {
        textLength: req.body.text?.length,
        requestedFiles: req.body.files,
        sessionFiles: userSession.data.uploadedFiles?.length || 0,
      };
      sendStatus(`[GENERATE] Request payload: ${JSON.stringify(payload)}`);

      sendStatus(
        `[GENERATE] Session files: ${JSON.stringify(userSession.data.uploadedFiles)}`
      );
      sendStatus(
        `[GENERATE] Requested files: ${JSON.stringify(req.body.files)}`
      );

      const inputText = req.body.text;
      sendStatus(`[GENERATE] Input text length: ${inputText?.length}`);

      sendStatus('[GENERATE] Sending start event');
      res.write(`event: start\ndata: {}\n\n`);

      let content = inputText || '';
      const chatInitLabel = 'chat-session-init';
      console.time(chatInitLabel);
      const paying = isPaying(res.locals);

      sendStatus('Initializing AI session...');

      const systemInstruction = `
        Your task is to convert to NDJSON.
        Please convert this file to NDJSON format with flashcards.

        If you find content already in a flashcard format (with Front: and Back: markers), extract those directly.
        For each lecture or section found, create a deck object first, then create cards for that section.

        - Deck is a object with a name and id based on the name
          Example: { "name": "Deck Name", "id": 1740258196492 }
        - Deck id must be an integer
        - The card is a object with a deck name, tags, front and back properties
          Example: { "deck": "Deck Name", "tags": ["tag1", "tag2"], "front": "Front of the card", "back": "Back of the card" }
        - If you find links in the text preserve them as links. Except for images that become image tags.
        - If you find any html preserve it as html.
        - Do not use an array but instead return the objects in order, first deck object then individual cards
        - Convert all markdown to html
        ${paying ? '' : `- This request is made by a free user. DO not create more than 100 cards`}
        `;

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-pro-exp-02-05',
        systemInstruction,
      });

      const generationConfig = {
        temperature: 0.7,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: paying ? 32768 : 8192,
        candidateCount: 1,
        responseMimeType: 'text/plain',
      };
      const chatSession = model.startChat({
        generationConfig: {
          ...generationConfig,
        },
        history: [],
      });
      sendTimeEnd(chatInitLabel);
      sendStatus('AI session initialized, starting processing...');

      if (
        userSession.data.uploadedFiles &&
        userSession.data.uploadedFiles.length > 0
      ) {
        const fileProcessLabel = 'file-processing';
        console.time(fileProcessLabel);

        // Create a SINGLE workspace instance for all files
        console.log(
          `[WORKSPACE] Using single workspace at: ${userSession.data.workspace.location}`
        );

        const filePromises = userSession.data.uploadedFiles.map(
          async (file: { name: string; path: string }) => {
            const readFileLabel = `read-file-${file.name}`;
            console.time(readFileLabel);
            sendStatus(`[UPLOAD] Processing file: ${file.name}`);

            try {
              const filePath = file.path;
              // Check if file exists
              await fs.access(filePath);
              const fileContent = await fs.readFile(filePath);
              sendTimeEnd(readFileLabel);

              if (isZIPFile(file.name) || isPotentialZipFile(file.name)) {
                sendStatus(`[UPLOAD] Processing ZIP file: ${file.name}`);

                const zipHandler = new ZipHandler(1);
                await zipHandler.build(
                  new Uint8Array(fileContent),
                  paying,
                  new CardOption(CardOption.LoadDefaultOptions())
                );

                const exporter = new CustomExporter(
                  file.name,
                  userSession.data.workspace.location
                );

                // Extract media files from zip to workspace
                for (const zipFile of zipHandler.files) {
                  if (
                    zipFile.name &&
                    zipFile.contents &&
                    isImageFileEmbedable(zipFile.name)
                  ) {
                    sendStatus(`[UPLOAD] Extracting media: ${zipFile.name}`);

                    const destPath = path.join(
                      userSession.data.workspace.location,
                      zipFile.name
                    );
                    // Ensure directory exists
                    const destDir = path.dirname(destPath);
                    await fs.mkdir(destDir, { recursive: true });

                    if (typeof zipFile.contents === 'string') {
                      await fs.writeFile(destPath, zipFile.contents, 'utf8');
                    } else if (Buffer.isBuffer(zipFile.contents)) {
                      await fs.writeFile(destPath, zipFile.contents);
                    } else if (zipFile.contents instanceof Uint8Array) {
                      await fs.writeFile(destPath, zipFile.contents);
                    } else {
                      const error = `Unsupported content type for file: ${zipFile.name}`;
                      console.error(error);
                      sendStatus(`[ERROR] ${error}`);
                    }
                  }
                }

                return zipHandler.files.map((f): ProcessedFile => {
                  let extractedContent = f.contents?.toString() || '';
                  const mediaFiles: string[] = [];

                  if (extractedContent) {
                    const dom = cheerio.load(extractedContent);
                    const webDom = cheerio.load(extractedContent);

                    // Handle both direct img tags and linked images
                    const images = dom('img');
                    const imageLinks = dom(
                      'a[href*=".png"], a[href*=".jpg"], a[href*=".jpeg"], a[href*=".gif"]'
                    );

                    if (images.length > 0 || imageLinks.length > 0) {
                      // Process direct image tags
                      images.each((i, elem) => {
                        const originalName = dom(elem).attr('src');
                        if (
                          originalName &&
                          isImageFileEmbedable(originalName)
                        ) {
                          const decodedPath = decodeURIComponent(originalName);
                          const imagePath = decodedPath.split('/').pop();
                          if (imagePath) {
                            const newName = embedFile({
                              exporter,
                              files: zipHandler.files,
                              filePath: decodedPath,
                              workspace: userSession.data.workspace,
                            });
                            if (newName) {
                              dom(elem).attr('src', newName);
                              webDom('img')
                                .eq(i)
                                .attr(
                                  'src',
                                  `/ki/media/${encodeURIComponent(newName)}`
                                );
                              mediaFiles.push(newName);
                            }
                          }
                        }
                      });

                      // Process linked images
                      imageLinks.each((i, elem) => {
                        const originalHref = dom(elem).attr('href');
                        if (
                          originalHref &&
                          isImageFileEmbedable(originalHref)
                        ) {
                          const decodedPath = decodeURIComponent(originalHref);
                          const imagePath = decodedPath.split('/').pop();
                          if (imagePath) {
                            const newName = embedFile({
                              exporter,
                              files: zipHandler.files,
                              filePath: decodedPath,
                              workspace: userSession.data.workspace,
                            });
                            if (newName) {
                              dom(elem).attr('href', newName);
                              webDom('a')
                                .eq(i)
                                .attr(
                                  'href',
                                  `/ki/media/${encodeURIComponent(newName)}`
                                );
                              mediaFiles.push(newName);
                            }
                          }
                        }
                      });

                      // Store APKG content
                      extractedContent = dom.html() || extractedContent;
                      // Send web preview content to client
                      res.write(
                        `event: preview\ndata: ${JSON.stringify({ html: webDom.html() })}\n\n`
                      );
                    }
                  }
                  return {
                    content: extractedContent,
                    name: f.name,
                    media: mediaFiles,
                  };
                });
              }

              console.timeEnd(`read-file-${file.name}`);
              return [
                { content: fileContent.toString('utf-8'), name: file.name },
              ];
            } catch (error) {
              console.error(`Failed to read file ${file.name}:`, error);
              return [{ content: '', name: file.name }];
            }
          }
        );

        const fileContentsArrays = await Promise.all(filePromises);
        const fileContents = fileContentsArrays.flat();

        // Process each file independently
        for (const { content: fileText, name, media } of fileContents) {
          if (!fileText || !isKiPermittedFile(name)) continue;
          await processFileContent(
            chatSession,
            fileText,
            name,
            res,
            userSession
          );
          if (media?.length) {
            // Update the media array in the last card
            const lastCardIndex = userSession.data.deckInfo.length - 1;
            if (
              lastCardIndex >= 0 &&
              userSession.data.deckInfo[lastCardIndex]
            ) {
              userSession.data.deckInfo[lastCardIndex].media = media;
            }
          }
        }
        console.timeEnd('file-processing');
      } else {
        // Process text input if only text is present
        if (content.trim().length > 0) {
          const textProcessLabel = 'text-input-processing';
          console.time(textProcessLabel);
          sendStatus(
            `[AI Request] Processing text input, length: ${content.length}`
          );

          const textResponse = await chatSession.sendMessage(content);
          const responseText = await textResponse.response.text();
          console.log('[KI Response]', responseText);
          processChunk(responseText, res, userSession);
          sendTimeEnd(textProcessLabel);
        }
      }

      // Keep this transform call - it's correct here after processing
      userSession.data.deckInfo = transformToDecks(userSession.data.deckInfo);

      // Update session with FINAL deck info
      await sessionRepository.updateSession(
        user.owner,
        {
          deckInfo: userSession.data.deckInfo,
        },
        userSession.id
      );

      // Store text input in session data
      if (content.trim().length > 0) {
        userSession.data.text = content;
        await sessionRepository.updateSession(
          user.owner,
          {
            text: content,
          },
          userSession.id
        );
      }

      res.write(
        `event: complete\ndata: ${JSON.stringify({ hasDeckInfo: true })}\n\n`
      );
      res.end();
      console.timeEnd(timeLabel);
    } catch (error) {
      console.error('[GENERATE] Generation error:', error);
      console.timeEnd(timeLabel);
      if (!res.headersSent) {
        res.write(
          `event: error\ndata: ${JSON.stringify({ error: 'Failed to generate flashcards' })}\n\n`
        );
        res.end();
      }
    }
  });

  router.post('/ki/download', async (req, res) => {
    console.log('[DOWNLOAD] Request received:', req.body);
    const canDownload = await canContinue(req, res);
    if (!canDownload) {
      return; // Exit if the user cannot continue
    }

    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    const userSession = await sessionRepository.getSession(user.owner); // Ensure session is typed
    if (!userSession || !userSession.data) {
      console.error('[DOWNLOAD] User session not found');
      return res.status(403).json({ error: 'Session expired' });
    }

    const { name } = req.body;
    console.log('[DOWNLOAD] Deck name:', name);
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const deckInfo = userSession.data.deckInfo; // Use userSession here
    if (!deckInfo) {
      console.error('[DOWNLOAD] No deck information found');
      return res.status(404).json({ error: 'No deck information found' });
    }

    console.log('[DOWNLOAD] Deck info:', deckInfo);
    const exporter = new CustomExporter(
      name,
      userSession.data.workspace.location
    );

    const sourceWorkspace = userSession.data.workspace.location; // Use userSession here
    if (!sourceWorkspace) {
      return res.status(404).json({ error: 'No workspace information found' });
    }

    // Copy media files to workspace
    for (const deck of deckInfo) {
      for (const card of deck.cards) {
        if (card.media && card.media.length > 0) {
          for (const mediaFile of card.media) {
            try {
              // Copy from source workspace to new workspace
              const sourcePath = path.join(sourceWorkspace, mediaFile);
              const destPath = path.join(
                userSession.data.workspace.location,
                mediaFile
              );
              // Ensure directory exists
              const destDir = path.dirname(destPath);
              await fs.mkdir(destDir, { recursive: true });
              await fs.copyFile(sourcePath, destPath);
            } catch (err) {
              console.error(`Failed to copy media file ${mediaFile}:`, err);
            }
          }
        }
      }
    }

    // Configure the exporter with the deck info
    exporter.configure(deckInfo);

    // Generate the APKG file
    const apkg = await exporter.save();

    if (!apkg) {
      return res.status(404).json({ error: 'Failed to generate APKG file' });
    }

    // Sanitize filename to remove invalid characters
    const sanitizedName = name
      .replace(/[^\x20-\x7E]/g, '_')
      .replace(/[^a-zA-Z0-9-_\.]/g, '_');
    const filename = sanitizedName.endsWith('.apkg')
      ? sanitizedName
      : `${sanitizedName}.apkg`;

    res.set('Content-Type', 'application/apkg');
    res.set('Content-Length', apkg.length.toString());
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(apkg);
  });

  router.get('/ki/media/:filename', async (req, res) => {
    const { filename } = req.params;
    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }
    const userSession = await sessionRepository.getSession(user.owner);
    const sourceWorkspace = userSession.data.workspace.location;

    try {
      const decodedFilename = decodeURIComponent(filename);
      const imagePath = path.join(
        userSession.data.workspace.location,
        decodedFilename
      );

      // Add security check
      if (imagePath.indexOf(sourceWorkspace) !== 0) {
        return res.status(403).send('Access denied');
      }

      await fs.access(imagePath);
      res.sendFile(imagePath, {
        headers: {
          'Content-Type': 'image/png', // or get proper MIME type
        },
      });
    } catch (error) {
      console.error('[MEDIA] Failed to serve media file:', error);
      res.status(404).send('File not found');
    }
  });

  router.get('/ki/status', async (req, res) => {
    console.log('[STATUS] Status check request received');
    const canCheckStatus = await canContinue(req, res);
    if (!canCheckStatus) {
      console.error('[STATUS] User cannot continue');
      return; // Exit if the user cannot continue
    }

    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    const userSession = await sessionRepository.getSession(user.owner); // Ensure session is typed
    if (!userSession || !userSession.data) {
      console.error('[STATUS] User session not found');
      return res.status(403).json({ error: 'Session expired' });
    }

    const hasDeckInfo = !!userSession.data?.deckInfo;
    console.log('[STATUS] Deck info available:', hasDeckInfo);
    res.json({ hasDeckInfo });
  });

  router.delete('/ki/session/delete', async (req, res) => {
    const canDeleteSession = await canContinue(req, res);
    if (!canDeleteSession) {
      return; // Exit if the user cannot continue
    }

    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    const { sessionId } = req.query;
    if (!sessionId) {
      console.error('[DELETE SESSION] No session ID provided');
      return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
      await sessionRepository.deleteSessionById(
        sessionId as string,
        user.owner
      );
      console.log('[DELETE SESSION] Session deleted:', sessionId);
      res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('[DELETE SESSION] Error deleting session:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  });

  router.get('/ki/session/cards', async (req, res) => {
    const canViewCards = await canContinue(req, res);
    if (!canViewCards) {
      return;
    }

    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    const userSession = await sessionRepository.getSession(user.owner);
    if (!userSession || !userSession.data) {
      return res.status(403).json({ error: 'Session expired' });
    }

    const deckInfo = userSession.data.deckInfo;
    if (!deckInfo) {
      return res.json([]);
    }

    // Transform deck info into cards array
    const cards = deckInfo.reduce((acc: any[], deck: any) => {
      if (deck.cards) {
        acc.push(
          ...deck.cards.map((card: any) => ({
            front: card.name,
            back: card.back,
            tags: card.tags,
            media: card.media,
            deck: deck.name, // Include the deck name
          }))
        );
      }
      return acc;
    }, []);

    res.json(cards);
  });

  router.get('/ki/session/history', async (req, res) => {
    const canViewHistory = await canContinue(req, res);
    if (!canViewHistory) {
      return;
    }

    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    try {
      const sessions = await sessionRepository.getUserSessions(
        user.owner.toString()
      );
      const currentSession = await sessionRepository.getSession(user.owner);
      res.json({
        sessions: sessions.map((session) => ({
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        })),
        currentSessionId: currentSession?.id,
      });
    } catch (error) {
      console.error('[HISTORY] Error fetching session history:', error);
      res.status(500).json({ error: 'Failed to fetch session history' });
    }
  });

  router.get('/ki/session/:sessionId', async (req, res) => {
    const canViewSession = await canContinue(req, res);
    if (!canViewSession) {
      return;
    }

    const user = await authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.redirect('/login?redirect=/ki');
      return false;
    }

    const { sessionId } = req.params;

    try {
      const session = await sessionRepository.getSessionById(
        sessionId,
        user.owner.toString()
      );
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Transform deck info into cards array
      const cards = session.data.deckInfo
        ? session.data.deckInfo.reduce((acc: any[], deck: any) => {
            if (deck.cards) {
              acc.push(
                ...deck.cards.map((card: any) => ({
                  front: card.name,
                  back: card.back,
                  tags: card.tags,
                  media: card.media,
                  deck: deck.name,
                }))
              );
            }
            return acc;
          }, [])
        : [];

      res.json({
        cards,
        text: session.data.text || '',
        uploadedFiles: session.data.uploadedFiles || [],
      });
    } catch (error) {
      console.error('[SESSION] Error fetching session:', error);
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  });

  return router;
};

export default KiRouter;
