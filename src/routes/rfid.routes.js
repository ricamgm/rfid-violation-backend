const express = require("express");
const router = express.Router();

const {
  handleRfidTap,
  getStudents,
  getStudentById,
  getStudentByRfid,
  createStudent,
  updateStudent,
  deleteStudent,
  recordViolation,
  getStudentViolations,
} = require("../controllers/rfid.controller");

// RFID tap endpoint
router.post("/tap", handleRfidTap);

// Student management endpoints
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.get("/students/rfid/:rfid", getStudentByRfid);
router.post("/create_students", createStudent);
router.put("/update_students/:id", updateStudent);
router.delete("/delete_student/:id", deleteStudent);
router.post("/record_violation", recordViolation);
router.get("/student_violations/:student_id", getStudentViolations);

module.exports = router;
