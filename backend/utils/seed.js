require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

async function seed() {
  await connectDB();

  const existingAdmin = await User.findOne({ email: 'admin@example.com' });
  if (existingAdmin) {
    console.log('Seed data already exists. Skipping.');
    await mongoose.disconnect();
    return;
  }

  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
  });

  const faculty = await User.create({
    name: 'Dr. Jane Faculty',
    email: 'faculty@example.com',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
  });

  const student = await User.create({
    name: 'Sam Student',
    email: 'student@example.com',
    password: 'Student@123',
    role: 'student',
    department: 'Computer Science',
    course: 'B.Tech CSE',
    rollNumber: 'CSE2026001',
  });

  const q1 = await Question.create({
    questionText: 'What does MERN stand for?',
    type: 'mcq',
    options: [
      { text: 'MongoDB, Express, React, Node', isCorrect: true },
      { text: 'MySQL, Express, React, Node', isCorrect: false },
      { text: 'MongoDB, Ember, React, Node', isCorrect: false },
      { text: 'MongoDB, Express, Ruby, Node', isCorrect: false },
    ],
    marks: 2,
    negativeMarks: 0.5,
    difficulty: 'easy',
    subject: 'Web Development',
    topic: 'MERN Stack',
    createdBy: faculty._id,
  });

  const q2 = await Question.create({
    questionText: 'Node.js is single-threaded.',
    type: 'true_false',
    options: [
      { text: 'True', isCorrect: true },
      { text: 'False', isCorrect: false },
    ],
    marks: 1,
    difficulty: 'easy',
    subject: 'Web Development',
    topic: 'Node.js',
    createdBy: faculty._id,
  });

  const q3 = await Question.create({
    questionText: 'Explain the purpose of middleware in Express.js.',
    type: 'descriptive',
    marks: 5,
    difficulty: 'medium',
    subject: 'Web Development',
    topic: 'Express.js',
    createdBy: faculty._id,
  });

  const now = new Date();
  const exam = await Exam.create({
    title: 'MERN Stack Fundamentals Quiz',
    description: 'A short quiz covering MERN stack basics.',
    subject: 'Web Development',
    course: 'B.Tech CSE',
    department: 'Computer Science',
    questions: [q1._id, q2._id, q3._id],
    totalMarks: 8,
    passingMarks: 4,
    duration: 30,
    startTime: now,
    endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    negativeMarking: true,
    instructions: 'Answer all questions. Do not switch tabs during the exam.',
    status: 'scheduled',
    createdBy: faculty._id,
  });

  console.log('Seed complete.');
  console.log('Admin login:    admin@example.com / Admin@123');
  console.log('Faculty login:  faculty@example.com / Faculty@123');
  console.log('Student login:  student@example.com / Student@123');
  console.log(`Sample exam created: ${exam.title} (${exam._id})`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
