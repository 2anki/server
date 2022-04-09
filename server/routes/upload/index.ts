import express from "express";

import StorageHandler from "../../lib/storage/StorageHandler";
import RequireAuthentication from "../../middleware/RequireAuthentication";
import deleteUpload from "./deleteUpload";
import deleteJob from "./deleteJob";
import getActiveJobs from "./getActiveJobs";
import getUploads from "./getUploads";
import handleUpload from "./legacyUpload";
import upload from "./upload";

const router = express.Router();

const storage = new StorageHandler();

router.post("/", (req, res) => {
  const u = upload(storage);

  u(req, res, function (error) {
    if (error) {
      console.error(error);
      return res.status(500).end();
    } else {
      handleUpload(storage, req, res);
    }
  });
});

router.get("/mine", RequireAuthentication, getUploads);
router.get("/active", RequireAuthentication, getActiveJobs);
router.delete("/active/:id", RequireAuthentication, deleteJob);
router.delete("/mine/:key", RequireAuthentication, deleteUpload);

export default router;
