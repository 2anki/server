import { ApiDeckController } from './ApiDeckController'; // Adjust path if needed
import { Request, Response } from 'express';
import Workspace from '../../lib/parser/WorkSpace';
import GeneratePackagesUseCase from '../../usecases/uploads/GeneratePackagesUseCase';
import CardOption from '../../lib/parser/Settings/CardOption';
import fs from 'fs';

// Mock dependencies
jest.mock('../../lib/parser/WorkSpace');
jest.mock('../../usecases/uploads/GeneratePackagesUseCase');
jest.mock('../../lib/parser/Settings/CardOption');
jest.mock('fs', () => ({
    ...jest.requireActual('fs'), // Import and retain default behavior
    promises: {
        ...jest.requireActual('fs').promises,
        rm: jest.fn().mockResolvedValue(undefined), // Mock rm specifically
    },
}));


describe('ApiDeckController', () => {
    let apiDeckController: ApiDeckController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;
    let mockSend: jest.Mock;
    let mockSetHeader: jest.Mock;

    const mockApkgBuffer = Buffer.from('mock apkg data');
    const mockWorkspaceInstance = {
        location: '/mock/workspace/path',
        getFirstAPKG: jest.fn().mockResolvedValue(mockApkgBuffer),
        // ensureExists: jest.fn(), // if constructor calls it
    };
    const mockExecuteUseCase = jest.fn().mockResolvedValue(undefined);
    const mockDefaultCardOptions = { deckName: 'DefaultDeck' };


    beforeEach(() => {
        jest.clearAllMocks();

        apiDeckController = new ApiDeckController();

        mockStatus = jest.fn().mockReturnThis();
        mockJson = jest.fn().mockReturnThis();
        mockSend = jest.fn().mockReturnThis();
        mockSetHeader = jest.fn().mockReturnThis();

        mockResponse = {
            status: mockStatus,
            json: mockJson,
            send: mockSend,
            setHeader: mockSetHeader,
            headersSent: false,
        };

        mockRequest = {
            body: {
                title: 'Test Deck',
                content: 'Test content',
                options: {},
            },
        };

        // Setup mock implementations
        (Workspace as jest.Mock).mockImplementation(() => mockWorkspaceInstance);
        (GeneratePackagesUseCase as jest.Mock).mockImplementation(() => ({
            execute: mockExecuteUseCase,
        }));
        (CardOption.LoadDefaultOptions as jest.Mock).mockReturnValue(mockDefaultCardOptions);
        // CardOption constructor mock if needed, or assume its creation is fine
        (CardOption as jest.Mock).mockImplementation((opts) => ({ ...mockDefaultCardOptions, ...opts }));
    });

    it('should create a deck successfully', async () => {
        await apiDeckController.createDeck(mockRequest as Request, mockResponse as Response);

        expect(Workspace).toHaveBeenCalledWith(true, 'fs');
        expect(mockExecuteUseCase).toHaveBeenCalled();
        expect(mockWorkspaceInstance.getFirstAPKG).toHaveBeenCalled();
        expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
        expect(mockSetHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="Test_Deck.apkg"');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockSend).toHaveBeenCalledWith(mockApkgBuffer);
        expect(fs.promises.rm).toHaveBeenCalledWith(mockWorkspaceInstance.location, { recursive: true, force: true });
    });

    it('should return 400 if title is missing', async () => {
        mockRequest.body.title = '';
        await apiDeckController.createDeck(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Title is required and must be a non-empty string.' });
        expect(fs.promises.rm).not.toHaveBeenCalled(); // Workspace might not be created or cleaned if validation fails early
    });

    it('should return 400 if content is missing', async () => {
        mockRequest.body.content = '';
        await apiDeckController.createDeck(mockRequest as Request, mockResponse as Response);
        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Content is required and must be a non-empty string.' });
         expect(fs.promises.rm).not.toHaveBeenCalled();
    });

    it('should return 500 if getFirstAPKG fails', async () => {
        mockWorkspaceInstance.getFirstAPKG.mockResolvedValue(null); // Simulate no APKG file
        await apiDeckController.createDeck(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to create deck' }));
        expect(fs.promises.rm).toHaveBeenCalledWith(mockWorkspaceInstance.location, { recursive: true, force: true });
    });
    
    it('should return 500 if use case execution fails', async () => {
        mockExecuteUseCase.mockRejectedValue(new Error('UseCase failed'));
        await apiDeckController.createDeck(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to create deck' }));
        expect(fs.promises.rm).toHaveBeenCalledWith(mockWorkspaceInstance.location, { recursive: true, force: true });
    });


    it('should still attempt cleanup if an error occurs after workspace creation', async () => {
        mockExecuteUseCase.mockRejectedValue(new Error('Execution error')); // Simulate error after workspace creation
        await apiDeckController.createDeck(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(fs.promises.rm).toHaveBeenCalledWith(mockWorkspaceInstance.location, { recursive: true, force: true });
    });
});
