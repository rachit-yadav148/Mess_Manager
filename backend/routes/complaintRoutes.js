const express = require("express");
const router = express.Router();
const {
  raiseComplaint,
  showComplaints,
  showUserComplaints,
  deleteComplaint,
  resolveComplaint,
} = require("../controllers/complaintController");
const { isAuthenticated } = require("../middleware/auth");
const { isChief } = require("../middleware/chiefauth");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.post("/hostel/raisecomplaint", raiseComplaint);

// use // /api/upload for uploading pictures while raisingComplaint
router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  console.log(file, file.filename);
  res.status(201).json(file.filename);
});

router.get("/showComplaints/:hostelName", showComplaints); //(returns list of complaints based on the following queries:
//   hostelName, status(resolved/unresolved), pageIndex, pageSize)

router.get("/showUserComplaints/:userId", showUserComplaints); //(returns list of complaints based on the following queries:
//   userId(student), status(resolved/unresolved), pageIndex, pageSize)

router.delete(
  "/delete/complaint/:complaintId",
  isAuthenticated,
  deleteComplaint
);

router.patch("/resolve/:complaintID", isChief, resolveComplaint);

module.exports = router;
