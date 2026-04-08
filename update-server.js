const fs = require("fs");

// 1. Add findByOwner to TemplatesRepository
const repoPath = "/home/alexa/src/github.com/2anki/server/src/data_layer/TemplatesRepository.ts";
let repo = fs.readFileSync(repoPath, "utf8");
repo = repo.replace(
  `  delete(owner: number | string) {
    return this.database(this.table).del().where({ owner });
  }`,
  `  async findByOwner(owner: string) {
    const row = await this.database(this.table).where({ owner }).first();
    return row ? row.payload : null;
  }

  delete(owner: number | string) {
    return this.database(this.table).del().where({ owner });
  }`
);
fs.writeFileSync(repoPath, repo);
console.log("Updated TemplatesRepository");

// 2. Add findByOwner to TemplateService
const svcPath = "/home/alexa/src/github.com/2anki/server/src/services/TemplatesService/TemplateService.ts";
let svc = fs.readFileSync(svcPath, "utf8");
svc = svc.replace(
  `  create(owner: string, templates: unknown) {`,
  `  findByOwner(owner: string) {
    return this.repository.findByOwner(owner);
  }

  create(owner: string, templates: unknown) {`
);
fs.writeFileSync(svcPath, svc);
console.log("Updated TemplateService");

// 3. Add GET and PUT routes to TemplatesRouter
const routerPath = "/home/alexa/src/github.com/2anki/server/src/routes/TemplatesRouter.ts";
let router = fs.readFileSync(routerPath, "utf8");

const newRoutes = `
  router.get('/api/templates/user', RequireAuthentication, (req, res) =>
    controller.getUserData(req, res)
  );

  router.put('/api/templates/user', RequireAuthentication, (req, res) =>
    controller.saveUserData(req, res)
  );

`;

router = router.replace(
  `  router.get('/api/templates/defaults'`,
  newRoutes + `  router.get('/api/templates/defaults'`
);
fs.writeFileSync(routerPath, router);
console.log("Updated TemplatesRouter");

// 4. Add getUserData and saveUserData to TemplatesController
const ctrlPath = "/home/alexa/src/github.com/2anki/server/src/controllers/TemplatesController.ts";
let ctrl = fs.readFileSync(ctrlPath, "utf8");
ctrl = ctrl.replace(
  `  async createTemplate(req: Request, res: Response) {`,
  `  async getUserData(req: Request, res: Response) {
    const owner = getOwner(res);
    try {
      const data = await this.service.findByOwner(owner);
      res.json(data || { templates: [], hiddenIds: [] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load templates' });
    }
  }

  async saveUserData(req: Request, res: Response) {
    const owner = getOwner(res);
    const { templates, hiddenIds } = req.body;
    try {
      await this.service.create(owner, { templates: templates || [], hiddenIds: hiddenIds || [] });
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to save templates' });
    }
  }

  async createTemplate(req: Request, res: Response) {`
);
fs.writeFileSync(ctrlPath, ctrl);
console.log("Updated TemplatesController");
