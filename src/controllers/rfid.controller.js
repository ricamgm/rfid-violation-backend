
let students = [];

let violations = [];

exports.recordViolation = (req, res) => {
  const { student_id, violations: violationList } = req.body;

  if (
    !student_id ||
    !Array.isArray(violationList) ||
    violationList.length === 0
  ) {
    return res.status(400).json({
      status: "error",
      message: "Student ID and at least one violation are required",
    });
  }

  const student = students.find((s) => s.student_id === student_id);
  if (!student) {
    return res.status(404).json({
      status: "error",
      message: "Student not found",
    });
  }

  const timestamp = new Date().toISOString();
  const newViolations = violationList.map((violation) => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    student_id,
    type: violation.type || "Other",
    description: violation.description || "",
    timestamp,
    status: "pending", // Can be 'pending', 'resolved', etc.
  }));

  violations.push(...newViolations);

  res.status(201).json({
    status: "success",
    data: newViolations,
  });
};

exports.getStudentViolations = (req, res) => {
  const { student_id } = req.params;

  const studentViolations = violations.filter(
    (v) => v.student_id === student_id,
  );

  res.json({
    status: "success",
    data: studentViolations,
  });
};

// Helper function to generate new ID
const generateId = () => {
  return students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;
};

// Get all students
exports.getStudents = (req, res) => {
  res.json(students);
};

// Get student by ID
exports.getStudentById = (req, res) => {
  const student = students.find((s) => s.id === parseInt(req.params.id));
  if (!student) {
    return res
      .status(404)
      .json({ status: "error", message: "Student not found" });
  }
  res.json(student);
};

// Get student by RFID
exports.getStudentByRfid = (req, res) => {
  const { rfid } = req.params;
  console.log("Looking up RFID:", rfid);

  const student = students.find((s) => s.rfid_uid === rfid);
  if (!student) {
    console.log("RFID not found:", rfid);
    return res.status(404).json({
      status: "error",
      message: "Student not found",
    });
  }

  console.log("Found student:", student);
  res.json(student);
};

// Create new student
exports.createStudent = (req, res) => {
  const { name, student_id, grade, section, rfid_uid } = req.body;
  console.log("Received data:", { name, student_id, grade, section, rfid_uid });

  if (!name || !student_id || !grade || !section || !rfid_uid) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  // Check for duplicate RFID or student_id
  const existingRfid = students.some((s) => s.rfid_uid === rfid_uid);
  if (existingRfid) {
    return res.status(400).json({
      status: "error",
      message: "RFID already in use",
    });
  }

  const existingStudent = students.some((s) => s.student_id === student_id);
  if (existingStudent) {
    return res.status(400).json({
      status: "error",
      message: "Student ID already in use",
    });
  }

  const newStudent = {
    id: Date.now().toString(),
    rfid_uid,
    student_id,
    name,
    grade,
    section,
  };

  students.push(newStudent);
  console.log("New student created:", newStudent);
  res.status(201).json(newStudent);
};

// Update student
exports.updateStudent = (req, res) => {
  const student = students.find((s) => s.id === parseInt(req.params.id));
  if (!student) {
    return res
      .status(404)
      .json({ status: "error", message: "Student not found" });
  }

  const { name, student_id, grade, section, rfid_uid } = req.body;

  // Check if RFID is already in use by another student
  if (rfid_uid && rfid_uid !== student.rfid_uid) {
    const rfidInUse = students.some(
      (s) => s.rfid_uid === rfid_uid && s.id !== student.id,
    );
    if (rfidInUse) {
      return res
        .status(400)
        .json({ status: "error", message: "RFID already in use" });
    }
  }

  // Check if student ID is already in use by another student
  if (student_id && student_id !== student.student_id) {
    const studentIdInUse = students.some(
      (s) => s.student_id === student_id && s.id !== student.id,
    );
    if (studentIdInUse) {
      return res
        .status(400)
        .json({ status: "error", message: "Student ID already in use" });
    }
  }

  // Update student data
  student.name = name || student.name;
  student.student_id = student_id || student.student_id;
  student.grade = grade || student.grade;
  student.section = section || student.section;
  student.rfid_uid = rfid_uid || student.rfid_uid;

  res.json({ status: "success", student });
};

// Delete student
exports.deleteStudent = (req, res) => {
  const studentIndex = students.findIndex(
    (s) => s.id === parseInt(req.params.id),
  );
  if (studentIndex === -1) {
    return res
      .status(404)
      .json({ status: "error", message: "Student not found" });
  }

  students.splice(studentIndex, 1);
  res.status(204).send();
};

// Handle RFID tap
exports.handleRfidTap = (req, res) => {
  const { rfid_uid } = req.body;

  if (!rfid_uid) {
    return res.status(400).json({
      status: "error",
      message: "RFID UID is required",
    });
  }

  const student = students.find((s) => s.rfid_uid === rfid_uid);

  if (!student) {
    return res.status(404).json({
      status: "error",
      message: "Student not found",
    });
  }

  return res.json({
    status: "ok",
    student,
  });
};
