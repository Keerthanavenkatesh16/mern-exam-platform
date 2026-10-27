require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Question = require('../models/Question');
const QuestionBank = require('../models/QuestionBank');
const Exam = require('../models/Exam');

async function seedMoreQuestions() {
  await connectDB();
  console.log('Connected to MongoDB. Adding questions and exams...');

  // Find or create faculty user
  let faculty = await User.findOne({ role: 'faculty' });
  if (!faculty) {
    faculty = await User.create({
      name: 'Dr. Jane Faculty',
      email: 'faculty@example.com',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science',
    });
  }

  // 1. Create or Find Question Banks
  const bankWeb = await QuestionBank.findOneAndUpdate(
    { name: 'Full-Stack Web Development' },
    {
      name: 'Full-Stack Web Development',
      subject: 'Web Development',
      description: 'Core concepts in MERN, React, Node.js, Express, and REST APIs',
      createdBy: faculty._id,
    },
    { upsert: true, new: true }
  );

  const bankDbms = await QuestionBank.findOneAndUpdate(
    { name: 'Database Management Systems' },
    {
      name: 'Database Management Systems',
      subject: 'DBMS',
      description: 'Relational design, normalization, ACID properties, NoSQL, and indexing',
      createdBy: faculty._id,
    },
    { upsert: true, new: true }
  );

  const bankDsa = await QuestionBank.findOneAndUpdate(
    { name: 'Data Structures & Algorithms' },
    {
      name: 'Data Structures & Algorithms',
      subject: 'DSA',
      description: 'Arrays, Trees, Graphs, Sorting, Searching, and Complexity analysis',
      createdBy: faculty._id,
    },
    { upsert: true, new: true }
  );

  const bankNetworks = await QuestionBank.findOneAndUpdate(
    { name: 'Computer Networks & Security' },
    {
      name: 'Computer Networks & Security',
      subject: 'Computer Networks',
      description: 'OSI layers, TCP/IP, protocols, encryption, and network security',
      createdBy: faculty._id,
    },
    { upsert: true, new: true }
  );

  // 2. Define Comprehensive Questions List
  const questionsData = [
    // --- Web Development ---
    {
      questionText: 'What is the purpose of the cleanup function returned by useEffect in React?',
      type: 'mcq',
      options: [
        { text: 'To cancel subscriptions, timers, or event listeners before the component unmounts or before re-running the effect', isCorrect: true },
        { text: 'To reset the component state back to its initial values', isCorrect: false },
        { text: 'To immediately force a re-render of child components', isCorrect: false },
        { text: 'To clear the browser localStorage and cookies', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'medium',
      subject: 'Web Development',
      topic: 'React Hooks',
      tags: ['react', 'hooks', 'lifecycle'],
      explanation: 'The cleanup function in useEffect runs before the effect runs again or when the component unmounts, preventing memory leaks.',
      questionBank: bankWeb._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'Which of the following are valid Built-in React Hooks? (Select all that apply)',
      type: 'multi_select',
      options: [
        { text: 'useState', isCorrect: true },
        { text: 'useEffect', isCorrect: true },
        { text: 'useContext', isCorrect: true },
        { text: 'useComponentLifecycle', isCorrect: false },
      ],
      marks: 3,
      negativeMarks: 1,
      difficulty: 'easy',
      subject: 'Web Development',
      topic: 'React Hooks',
      tags: ['react', 'hooks'],
      explanation: 'useState, useEffect, and useContext are built-in React hooks. useComponentLifecycle does not exist.',
      questionBank: bankWeb._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'In Express.js, what does the next() function do inside a middleware?',
      type: 'mcq',
      options: [
        { text: 'Passes control to the next middleware or route handler in the stack', isCorrect: true },
        { text: 'Restarts the current HTTP request from the beginning', isCorrect: false },
        { text: 'Sends an immediate JSON response to the client', isCorrect: false },
        { text: 'Terminates the Node.js process gracefully', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'easy',
      subject: 'Web Development',
      topic: 'Express.js',
      tags: ['express', 'middleware'],
      explanation: 'Calling next() invokes the next middleware function in the execution pipeline.',
      questionBank: bankWeb._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'JavaScript execution in Node.js is primarily single-threaded on the main event loop.',
      type: 'true_false',
      options: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
      marks: 1,
      negativeMarks: 0,
      difficulty: 'easy',
      subject: 'Web Development',
      topic: 'Node.js',
      tags: ['javascript', 'nodejs', 'eventloop'],
      explanation: 'Node.js runs JavaScript code on a single thread event loop, using libuv worker threads under the hood for async I/O.',
      questionBank: bankWeb._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'In MongoDB, each individual record stored within a collection is referred to as a _____ (in lowercase).',
      type: 'fill_blank',
      correctAnswerText: ['document', 'documents'],
      marks: 2,
      negativeMarks: 0,
      difficulty: 'easy',
      subject: 'Web Development',
      topic: 'MongoDB',
      tags: ['mongodb', 'nosql'],
      explanation: 'MongoDB stores BSON data records called documents inside collections.',
      questionBank: bankWeb._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'What HTTP status code is standard for "Unauthorized" when user authentication is missing or invalid?',
      type: 'short_answer',
      correctAnswerText: ['401', '401 unauthorized'],
      marks: 2,
      negativeMarks: 0,
      difficulty: 'easy',
      subject: 'Web Development',
      topic: 'HTTP Protocols',
      tags: ['http', 'api', 'rest'],
      explanation: 'HTTP 401 indicates that the request requires authentication.',
      questionBank: bankWeb._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'Explain the difference between state and props in React, and when you should use each.',
      type: 'descriptive',
      marks: 5,
      negativeMarks: 0,
      difficulty: 'medium',
      subject: 'Web Development',
      topic: 'React Architecture',
      tags: ['react', 'state', 'props'],
      explanation: 'Props are read-only configuration passed from parent to child, while state is local and mutable data managed within the component.',
      questionBank: bankWeb._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'Write a JavaScript function named solution that takes an array of numbers and returns the sum of all even numbers.',
      type: 'coding',
      starterCode: 'function solution(nums) {\n  // Write your code here\n  return 0;\n}',
      allowedLanguages: ['javascript', 'python'],
      testCases: [
        { input: '[1, 2, 3, 4, 5, 6]', expectedOutput: '12', isHidden: false },
        { input: '[1, 3, 5]', expectedOutput: '0', isHidden: false },
        { input: '[2, 4, 8]', expectedOutput: '14', isHidden: true },
      ],
      marks: 5,
      negativeMarks: 0,
      difficulty: 'medium',
      subject: 'Web Development',
      topic: 'JavaScript Algorithms',
      tags: ['javascript', 'coding'],
      explanation: 'Filter array for num % 2 === 0 and sum with reduce.',
      questionBank: bankWeb._id,
      createdBy: faculty._id,
    },

    // --- DBMS ---
    {
      questionText: 'Which normal form eliminates partial functional dependencies on a composite primary key?',
      type: 'mcq',
      options: [
        { text: 'Second Normal Form (2NF)', isCorrect: true },
        { text: 'First Normal Form (1NF)', isCorrect: false },
        { text: 'Third Normal Form (3NF)', isCorrect: false },
        { text: 'Boyce-Codd Normal Form (BCNF)', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'medium',
      subject: 'DBMS',
      topic: 'Normalization',
      tags: ['dbms', 'normalization', '2nf'],
      explanation: '2NF requires the relation to be in 1NF and have no partial dependencies (every non-prime attribute must depend on the whole candidate key).',
      questionBank: bankDbms._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'In ACID properties of database transactions, what does "A" stand for?',
      type: 'mcq',
      options: [
        { text: 'Atomicity', isCorrect: true },
        { text: 'Accessibility', isCorrect: false },
        { text: 'Authentication', isCorrect: false },
        { text: 'Availability', isCorrect: false },
      ],
      marks: 1,
      negativeMarks: 0.25,
      difficulty: 'easy',
      subject: 'DBMS',
      topic: 'Transactions',
      tags: ['acid', 'transactions'],
      explanation: 'Atomicity ensures that all operations in a transaction succeed completely or none do.',
      questionBank: bankDbms._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'Which of the following are valid NoSQL database categories? (Select all that apply)',
      type: 'multi_select',
      options: [
        { text: 'Document Stores (e.g., MongoDB)', isCorrect: true },
        { text: 'Key-Value Stores (e.g., Redis)', isCorrect: true },
        { text: 'Graph Databases (e.g., Neo4j)', isCorrect: true },
        { text: 'Column-Family Stores (e.g., Cassandra)', isCorrect: true },
      ],
      marks: 3,
      negativeMarks: 1,
      difficulty: 'medium',
      subject: 'DBMS',
      topic: 'NoSQL Architectures',
      tags: ['nosql', 'mongodb', 'redis'],
      explanation: 'All four are the standard classifications of NoSQL databases.',
      questionBank: bankDbms._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'In a relational database, a primary key column is allowed to store NULL values.',
      type: 'true_false',
      options: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
      marks: 1,
      negativeMarks: 0,
      difficulty: 'easy',
      subject: 'DBMS',
      topic: 'Relational Model',
      tags: ['sql', 'primary key'],
      explanation: 'By definition of entity integrity, primary keys must be unique and non-null.',
      questionBank: bankDbms._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'Which SQL statement is used to remove all rows from a table without logging individual row deletions, making it faster than DELETE?',
      type: 'short_answer',
      correctAnswerText: ['truncate', 'truncate table'],
      marks: 2,
      negativeMarks: 0,
      difficulty: 'medium',
      subject: 'DBMS',
      topic: 'SQL DDL',
      tags: ['sql', 'truncate'],
      explanation: 'TRUNCATE TABLE deallocates entire data pages and is faster than row-by-row DELETE.',
      questionBank: bankDbms._id,
      createdBy: faculty._id,
    },

    // --- DSA ---
    {
      questionText: 'What is the worst-case time complexity of QuickSort when a poor pivot is repeatedly selected?',
      type: 'mcq',
      options: [
        { text: 'O(n²)', isCorrect: true },
        { text: 'O(n log n)', isCorrect: false },
        { text: 'O(n)', isCorrect: false },
        { text: 'O(log n)', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'medium',
      subject: 'DSA',
      topic: 'Sorting Algorithms',
      tags: ['dsa', 'sorting', 'quicksort'],
      explanation: 'When the smallest or largest element is consistently picked as the pivot (e.g. sorted array without random pivot), QuickSort degrades to O(n²).',
      questionBank: bankDsa._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'Which data structure follows the Last In, First Out (LIFO) order?',
      type: 'mcq',
      options: [
        { text: 'Stack', isCorrect: true },
        { text: 'Queue', isCorrect: false },
        { text: 'Linked List', isCorrect: false },
        { text: 'Binary Tree', isCorrect: false },
      ],
      marks: 1,
      negativeMarks: 0.25,
      difficulty: 'easy',
      subject: 'DSA',
      topic: 'Linear Data Structures',
      tags: ['stack', 'dsa'],
      explanation: 'Stack uses LIFO, whereas Queue uses FIFO.',
      questionBank: bankDsa._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'A tree data structure in which every node has at most two children is known as a _____ tree.',
      type: 'fill_blank',
      correctAnswerText: ['binary', 'binary tree'],
      marks: 1,
      negativeMarks: 0,
      difficulty: 'easy',
      subject: 'DSA',
      topic: 'Trees',
      tags: ['trees', 'binary tree'],
      explanation: 'A binary tree restricts each node to a maximum of two child nodes.',
      questionBank: bankDsa._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'Which of the following data structures can be used to implement a Breadth-First Search (BFS) graph traversal?',
      type: 'mcq',
      options: [
        { text: 'Queue', isCorrect: true },
        { text: 'Stack', isCorrect: false },
        { text: 'Priority Queue (Min-Heap)', isCorrect: false },
        { text: 'Binary Search Tree', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'easy',
      subject: 'DSA',
      topic: 'Graph Algorithms',
      tags: ['bfs', 'queue', 'graphs'],
      explanation: 'BFS uses a FIFO Queue to visit neighbors level by level.',
      questionBank: bankDsa._id,
      createdBy: faculty._id,
    },

    // --- Computer Networks & Security ---
    {
      questionText: 'Which of the following protocols operate at the Application layer (Layer 7) of the OSI model? (Select all that apply)',
      type: 'multi_select',
      options: [
        { text: 'HTTP (Hypertext Transfer Protocol)', isCorrect: true },
        { text: 'DNS (Domain Name System)', isCorrect: true },
        { text: 'SMTP (Simple Mail Transfer Protocol)', isCorrect: true },
        { text: 'TCP (Transmission Control Protocol)', isCorrect: false },
      ],
      marks: 3,
      negativeMarks: 1,
      difficulty: 'medium',
      subject: 'Computer Networks',
      topic: 'OSI Model',
      tags: ['networks', 'osi', 'protocols'],
      explanation: 'HTTP, DNS, and SMTP are Application layer protocols. TCP operates at the Transport layer.',
      questionBank: bankNetworks._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'HTTPS encrypts communications over computer networks using TLS/SSL.',
      type: 'true_false',
      options: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
      marks: 1,
      negativeMarks: 0,
      difficulty: 'easy',
      subject: 'Computer Networks',
      topic: 'Network Security',
      tags: ['https', 'security', 'tls'],
      explanation: 'HTTPS provides end-to-end encryption and authenticity verification via TLS.',
      questionBank: bankNetworks._id,
      createdBy: faculty._id,
    },
    {
      questionText: 'What standard port number is used by default for unencrypted HTTP traffic?',
      type: 'short_answer',
      correctAnswerText: ['80', 'port 80'],
      marks: 1,
      negativeMarks: 0,
      difficulty: 'easy',
      subject: 'Computer Networks',
      topic: 'Ports & Protocols',
      tags: ['http', 'ports'],
      explanation: 'HTTP default port is 80; HTTPS default port is 443.',
      questionBank: bankNetworks._id,
      createdBy: faculty._id,
    },
  ];

  // Insert or update each question
  const savedQuestions = [];
  for (const q of questionsData) {
    const existing = await Question.findOne({ questionText: q.questionText });
    if (existing) {
      Object.assign(existing, q);
      await existing.save();
      savedQuestions.push(existing);
    } else {
      const created = await Question.create(q);
      savedQuestions.push(created);
    }
  }
  console.log(`Successfully saved/verified ${savedQuestions.length} comprehensive questions.`);

  // 3. Create or Update Active Interactive Exams
  const now = new Date();
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  // Exam 1: Interactive Full-Stack Assessment (10 questions, active, long window)
  const fullStackQuestions = savedQuestions.filter(
    (q) => q.subject === 'Web Development' || q.subject === 'DBMS'
  ).slice(0, 10);

  const fullStackTotalMarks = fullStackQuestions.reduce((acc, q) => acc + q.marks, 0);

  const exam1 = await Exam.findOneAndUpdate(
    { title: 'Interactive Full-Stack Web & Database Assessment' },
    {
      title: 'Interactive Full-Stack Web & Database Assessment',
      description: 'Test your knowledge on React, Node.js, Express, MongoDB, and relational databases. Featuring multiple choice, multi-select, true/false, fill-in-the-blank, and coding questions.',
      subject: 'Web Development',
      course: 'B.Tech CSE',
      department: 'Computer Science',
      questions: fullStackQuestions.map((q) => q._id),
      totalMarks: fullStackTotalMarks,
      passingMarks: Math.ceil(fullStackTotalMarks * 0.4),
      duration: 45,
      startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // started yesterday
      endTime: nextYear, // valid for 1 year
      negativeMarking: true,
      randomizeQuestions: false,
      instructions: 'Answer all questions. You can navigate back and forth, mark questions for review, and use keyboard shortcuts.',
      status: 'active',
      createdBy: faculty._id,
      proctoring: {
        requireCamera: false,
        requireFullscreen: false,
        trackTabSwitch: true,
        maxTabSwitchWarnings: 3,
      },
    },
    { upsert: true, new: true }
  );

  // Exam 2: CS Foundations: DSA & Computer Networks
  const csQuestions = savedQuestions.filter(
    (q) => q.subject === 'DSA' || q.subject === 'Computer Networks'
  );
  const csTotalMarks = csQuestions.reduce((acc, q) => acc + q.marks, 0);

  const exam2 = await Exam.findOneAndUpdate(
    { title: 'Data Structures, Algorithms & Networks Challenge' },
    {
      title: 'Data Structures, Algorithms & Networks Challenge',
      description: 'Covers core algorithmic complexity, queue/stack data structures, binary trees, OSI protocols, and network fundamentals.',
      subject: 'DSA',
      course: 'B.Tech CSE',
      department: 'Computer Science',
      questions: csQuestions.map((q) => q._id),
      totalMarks: csTotalMarks,
      passingMarks: Math.ceil(csTotalMarks * 0.4),
      duration: 30,
      startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      endTime: nextYear,
      negativeMarking: true,
      randomizeQuestions: false,
      instructions: 'Carefully review each question. Single choice and multiple-select questions are included.',
      status: 'active',
      createdBy: faculty._id,
      proctoring: {
        requireCamera: false,
        requireFullscreen: false,
        trackTabSwitch: true,
        maxTabSwitchWarnings: 3,
      },
    },
    { upsert: true, new: true }
  );

  // Exam 3: Update existing MERN quiz window so it is active and not expired
  await Exam.findOneAndUpdate(
    { title: 'MERN Stack Fundamentals Quiz' },
    {
      startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      endTime: nextYear,
      status: 'active',
    }
  );

  console.log('Seeding complete!');
  console.log(`Exam 1: "${exam1.title}" (${exam1._id}) - ${exam1.questions.length} questions`);
  console.log(`Exam 2: "${exam2.title}" (${exam2._id}) - ${exam2.questions.length} questions`);

  await mongoose.disconnect();
}

seedMoreQuestions().catch((err) => {
  console.error('Error seeding questions:', err);
  process.exit(1);
});
