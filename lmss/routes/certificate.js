import express from "express";
import { authenticate, requireSelfOrAdmin } from "../middleware/auth.js";
import {
  issueCertificate,
  getMyCertificates,
  getCertificateById,
  getCertificateByCode,
} from "../controller/CertificateController.js";

const router = express.Router();

// Protected: issue / list own certificates (admins may act for any user)
router.post("/issue", authenticate, requireSelfOrAdmin("userId"), issueCertificate);
router.get("/mine", authenticate, requireSelfOrAdmin("userId"), getMyCertificates);

// Public: printable / shareable certificate views
router.get("/code/:code", getCertificateByCode);
router.get("/:id", getCertificateById);

export default router;
