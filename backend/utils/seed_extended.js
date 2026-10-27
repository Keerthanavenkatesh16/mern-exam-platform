require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

async function seedExtended() {
  await connectDB();
  console.log('Connected to MongoDB. Preparing extended question bank and assessments...');

  // Find faculty user
  let faculty = await User.findOne({ email: 'faculty@example.com' });
  if (!faculty) {
    faculty = await User.findOne({ role: 'faculty' });
  }
  if (!faculty) {
    console.error('No faculty user found! Run base seed first.');
    await mongoose.disconnect();
    return;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. WEB DEVELOPMENT & MERN QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const webQuestions = [
    {
      questionText: 'Which React Hook is primarily used to perform side effects such as data fetching or DOM subscriptions?',
      type: 'mcq',
      options: [
        { text: 'useEffect', isCorrect: true },
        { text: 'useState', isCorrect: false },
        { text: 'useContext', isCorrect: false },
        { text: 'useReducer', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'easy',
      subject: 'Web Development',
      topic: 'React.js',
      tags: ['React', 'Hooks', 'Frontend'],
      explanation: 'useEffect handles side-effects like API calls, event listeners, and manual DOM manipulation.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Select all features that accurately describe Node.js architecture and runtime behavior:',
      type: 'multi_select',
      options: [
        { text: 'Single-threaded event loop for JavaScript execution', isCorrect: true },
        { text: 'Non-blocking, asynchronous I/O operations powered by libuv', isCorrect: true },
        { text: 'Built-in multithreaded JavaScript memory execution model', isCorrect: false },
        { text: 'Cross-platform JavaScript runtime built on Chrome V8 engine', isCorrect: true },
      ],
      marks: 3,
      negativeMarks: 1,
      difficulty: 'medium',
      subject: 'Web Development',
      topic: 'Node.js',
      tags: ['Node.js', 'Libuv', 'Event Loop'],
      explanation: 'Node.js executes JS on a single thread backed by the libuv thread pool for async I/O.',
      createdBy: faculty._id,
    },
    {
      questionText: 'In MongoDB, which index type is best suited to enforce uniqueness across a field?',
      type: 'mcq',
      options: [
        { text: 'Unique Index (e.g. { field: 1 }, { unique: true })', isCorrect: true },
        { text: 'Text Index', isCorrect: false },
        { text: 'Compound Wildcard Index', isCorrect: false },
        { text: 'Hashed Index without constraints', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'easy',
      subject: 'Web Development',
      topic: 'MongoDB',
      tags: ['MongoDB', 'Indexes', 'Database'],
      explanation: 'Unique indexes prevent duplicate values in specified fields.',
      createdBy: faculty._id,
    },
    {
      questionText: 'HTTP cookies marked with the "HttpOnly" attribute can still be read and modified by JavaScript via document.cookie.',
      type: 'true_false',
      options: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
      marks: 1,
      negativeMarks: 0.25,
      difficulty: 'easy',
      subject: 'Web Development',
      topic: 'Web Security',
      tags: ['Cookies', 'Security', 'HTTP'],
      explanation: 'HttpOnly prevents client-side scripts from reading the cookie, protecting against XSS session theft.',
      createdBy: faculty._id,
    },
    {
      questionText: 'What is the name of the React optimization hook used to memoize expensive calculation values between re-renders?',
      type: 'fill_blank',
      correctAnswerText: ['useMemo', 'usememo', 'useMemo()'],
      marks: 2,
      difficulty: 'medium',
      subject: 'Web Development',
      topic: 'React.js',
      tags: ['React', 'Performance', 'Hooks'],
      explanation: 'useMemo caches the result of a calculation between renders unless dependencies change.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Explain the critical differences between optimistic rendering and pessimistic UI updates in web applications.',
      type: 'descriptive',
      marks: 5,
      difficulty: 'medium',
      subject: 'Web Development',
      topic: 'Frontend Architecture',
      tags: ['Architecture', 'UX', 'State Management'],
      explanation: 'Optimistic UI updates immediately assume server success and rollback on error; pessimistic awaits server confirmation before updating.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Write a JavaScript function "twoSum(nums, target)" that returns the indices [i, j] of two numbers that add up to target. Return an array of two indices.',
      type: 'coding',
      starterCode: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      allowedLanguages: ['javascript', 'python', 'java'],
      testCases: [
        { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', isHidden: false },
        { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', isHidden: false },
        { input: '[3, 3], 6', expectedOutput: '[0, 1]', isHidden: true },
      ],
      marks: 5,
      difficulty: 'medium',
      subject: 'Web Development',
      topic: 'Algorithms in JS',
      tags: ['Coding', 'JavaScript', 'Hash Map'],
      explanation: 'Use a Hash Map to store seen numbers and look up the complement in O(1) time, resulting in O(N) overall time.',
      createdBy: faculty._id,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DATA STRUCTURES & ALGORITHMS (DSA)
  // ─────────────────────────────────────────────────────────────────────────────
  const dsaQuestions = [
    {
      questionText: 'What is the worst-case time complexity of QuickSort when using an unbalanced pivot selection (such as always choosing the first element on a sorted array)?',
      type: 'mcq',
      options: [
        { text: 'O(N²)', isCorrect: true },
        { text: 'O(N log N)', isCorrect: false },
        { text: 'O(N)', isCorrect: false },
        { text: 'O(log N)', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'easy',
      subject: 'DSA',
      topic: 'Sorting Algorithms',
      tags: ['QuickSort', 'Time Complexity', 'Algorithms'],
      explanation: 'When the partition is completely unbalanced, QuickSort degrades to O(N²) quadratic time.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Which data structures provide average O(1) time complexity for insertion and lookup operations?',
      type: 'multi_select',
      options: [
        { text: 'Hash Table / Hash Map', isCorrect: true },
        { text: 'Hash Set', isCorrect: true },
        { text: 'Standard Binary Search Tree (Unbalanced)', isCorrect: false },
        { text: 'Singly Linked List at index K', isCorrect: false },
      ],
      marks: 3,
      negativeMarks: 1,
      difficulty: 'easy',
      subject: 'DSA',
      topic: 'Data Structures',
      tags: ['Hash Table', 'Complexity'],
      explanation: 'Hash tables and hash sets provide O(1) average lookup and insertion when hash collisions are minimized.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Dijkstra\'s algorithm works correctly on graphs containing negative edge weights.',
      type: 'true_false',
      options: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
      marks: 1,
      negativeMarks: 0.25,
      difficulty: 'easy',
      subject: 'DSA',
      topic: 'Graph Algorithms',
      tags: ['Graphs', 'Dijkstra', 'Shortest Path'],
      explanation: 'Dijkstra assumes greedily that path weights never decrease; negative weights require Bellman-Ford.',
      createdBy: faculty._id,
    },
    {
      questionText: 'What standard tree traversal visits nodes in non-decreasing sorted order for a Binary Search Tree (BST)?',
      type: 'fill_blank',
      correctAnswerText: ['inorder', 'in-order', 'in order', 'inorder traversal'],
      marks: 2,
      difficulty: 'easy',
      subject: 'DSA',
      topic: 'Trees',
      tags: ['BST', 'Traversal'],
      explanation: 'In-order traversal visits Left -> Node -> Right, yielding sorted order in a BST.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Write a JavaScript function "isPalindrome(str)" that returns true if the input string is a palindrome (ignoring non-alphanumeric characters and case), false otherwise.',
      type: 'coding',
      starterCode: `function isPalindrome(str) {
  // Clean string and test palindrome
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
      allowedLanguages: ['javascript', 'python'],
      testCases: [
        { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
        { input: '"race a car"', expectedOutput: 'false', isHidden: false },
        { input: '" "', expectedOutput: 'true', isHidden: true },
      ],
      marks: 5,
      difficulty: 'medium',
      subject: 'DSA',
      topic: 'Strings & Two Pointers',
      tags: ['Coding', 'String Manipulation'],
      explanation: 'Filter alphanumeric characters, lowercase, and check two pointers from both ends.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Describe how the Sliding Window algorithm optimizes subarray problems from O(N²) to O(N). Provide an example scenario.',
      type: 'descriptive',
      marks: 5,
      difficulty: 'medium',
      subject: 'DSA',
      topic: 'Algorithm Techniques',
      tags: ['Sliding Window', 'Two Pointers'],
      explanation: 'Sliding window maintains a dynamic or fixed boundary window, adding and dropping elements in O(1) instead of recomputing entire subarrays.',
      createdBy: faculty._id,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. CYBERSECURITY & NETWORK DEFENSE
  // ─────────────────────────────────────────────────────────────────────────────
  const securityQuestions = [
    {
      questionText: 'Which type of attack occurs when an attacker tricks a victim into executing unwanted actions on a web application in which they are currently authenticated?',
      type: 'mcq',
      options: [
        { text: 'Cross-Site Request Forgery (CSRF)', isCorrect: true },
        { text: 'Cross-Site Scripting (XSS)', isCorrect: false },
        { text: 'SQL Injection (SQLi)', isCorrect: false },
        { text: 'Server-Side Request Forgery (SSRF)', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'easy',
      subject: 'Cybersecurity',
      topic: 'Web Security',
      tags: ['CSRF', 'OWASP', 'Authentication'],
      explanation: 'CSRF exploits trust in authenticated browser credentials (cookies) to execute unauthorized state changes.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Select all mechanisms that effectively mitigate Cross-Site Scripting (XSS) vulnerabilities in web applications:',
      type: 'multi_select',
      options: [
        { text: 'Context-aware output encoding / HTML escaping', isCorrect: true },
        { text: 'Implementing a Content Security Policy (CSP) header', isCorrect: true },
        { text: 'Sanitizing rich text inputs using libraries like DOMPurify', isCorrect: true },
        { text: 'Storing passwords using MD5 hashing without salt', isCorrect: false },
      ],
      marks: 3,
      negativeMarks: 1,
      difficulty: 'medium',
      subject: 'Cybersecurity',
      topic: 'Vulnerability Mitigation',
      tags: ['XSS', 'CSP', 'Sanitization'],
      explanation: 'Escaping output, Content Security Policy, and DOMPurify sanitize content to neutralize injected script execution.',
      createdBy: faculty._id,
    },
    {
      questionText: 'In public-key asymmetric cryptography, the private key is used by the recipient to decrypt data encrypted with their corresponding public key.',
      type: 'true_false',
      options: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
      marks: 1,
      negativeMarks: 0.25,
      difficulty: 'easy',
      subject: 'Cybersecurity',
      topic: 'Cryptography',
      tags: ['Public Key', 'RSA', 'Encryption'],
      explanation: 'Asymmetric encryption encrypts with public key and only the holder of the matching private key can decrypt.',
      createdBy: faculty._id,
    },
    {
      questionText: 'What is the acronym for the security policy concept that mandates "Never Trust, Always Verify" regardless of network perimeter?',
      type: 'short_answer',
      correctAnswerText: ['Zero Trust', 'ZT', 'Zero-Trust', 'Zero Trust Architecture', 'ZTA'],
      marks: 2,
      difficulty: 'medium',
      subject: 'Cybersecurity',
      topic: 'Security Architecture',
      tags: ['Zero Trust', 'Network Defense'],
      explanation: 'Zero Trust eliminates implicit trust and validates every stage of digital interaction.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Discuss the security implications of storing JWT access tokens in browser localStorage versus HttpOnly SameSite cookies.',
      type: 'descriptive',
      marks: 5,
      difficulty: 'hard',
      subject: 'Cybersecurity',
      topic: 'Auth Security',
      tags: ['JWT', 'Cookies', 'Storage Security'],
      explanation: 'LocalStorage is vulnerable to XSS theft; HttpOnly cookies resist XSS theft but require CSRF protection such as SameSite=Strict and CSRF tokens.',
      createdBy: faculty._id,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. DATABASE MANAGEMENT SYSTEMS (DBMS)
  // ─────────────────────────────────────────────────────────────────────────────
  const dbmsQuestions = [
    {
      questionText: 'Which ACID property guarantees that all operations within a database transaction succeed or all are rolled back?',
      type: 'mcq',
      options: [
        { text: 'Atomicity', isCorrect: true },
        { text: 'Consistency', isCorrect: false },
        { text: 'Isolation', isCorrect: false },
        { text: 'Durability', isCorrect: false },
      ],
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'easy',
      subject: 'DBMS',
      topic: 'Transactions',
      tags: ['ACID', 'Atomicity', 'Databases'],
      explanation: 'Atomicity states that transactions are all-or-nothing units of work.',
      createdBy: faculty._id,
    },
    {
      questionText: 'Select all statements that accurately describe Normalization in relational database design:',
      type: 'multi_select',
      options: [
        { text: 'Reduces data redundancy and prevents update anomalies', isCorrect: true },
        { text: 'Third Normal Form (3NF) requires eliminating transitive functional dependencies', isCorrect: true },
        { text: 'First Normal Form (1NF) ensures all attribute values are atomic', isCorrect: true },
        { text: 'Normalization always improves read query performance compared to denormalization', isCorrect: false },
      ],
      marks: 3,
      negativeMarks: 1,
      difficulty: 'medium',
      subject: 'DBMS',
      topic: 'Relational Design',
      tags: ['Normalization', 'SQL', 'Schema'],
      explanation: 'Normalization reduces anomalies but can require joins that may slow read throughput compared to denormalized stores.',
      createdBy: faculty._id,
    },
    {
      questionText: 'MongoDB supports multi-document ACID transactions across replica sets and sharded clusters.',
      type: 'true_false',
      options: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
      marks: 1,
      negativeMarks: 0.25,
      difficulty: 'easy',
      subject: 'DBMS',
      topic: 'NoSQL Databases',
      tags: ['MongoDB', 'Transactions'],
      explanation: 'Since MongoDB 4.0 (replica sets) and 4.2 (sharded clusters), multi-document ACID transactions are fully supported.',
      createdBy: faculty._id,
    },
    {
      questionText: 'What MongoDB aggregation pipeline stage is used to deconstruct an array field from the input documents to output a document for each element?',
      type: 'fill_blank',
      correctAnswerText: ['$unwind', 'unwind', '$unwind stage'],
      marks: 2,
      difficulty: 'medium',
      subject: 'DBMS',
      topic: 'MongoDB Aggregation',
      tags: ['Aggregation', 'MongoDB'],
      explanation: '$unwind flattens an array field, outputting a record for each array element.',
      createdBy: faculty._id,
    },
  ];

  // Insert all questions into DB
  const allNewQuestions = [
    ...webQuestions,
    ...dsaQuestions,
    ...securityQuestions,
    ...dbmsQuestions,
  ];

  const createdQuestions = [];
  for (const q of allNewQuestions) {
    // Check if duplicate question already exists
    const existing = await Question.findOne({ questionText: q.questionText });
    if (existing) {
      createdQuestions.push(existing);
    } else {
      const created = await Question.create(q);
      createdQuestions.push(created);
    }
  }

  console.log(`Questions ready: ${createdQuestions.length} questions available.`);

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE 4 FLAGSHIP ACTIVE EXAMS
  // ─────────────────────────────────────────────────────────────────────────────
  const now = new Date();
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Group questions by subject
  const webQIds = createdQuestions.filter((q) => q.subject === 'Web Development').map((q) => q._id);
  const dsaQIds = createdQuestions.filter((q) => q.subject === 'DSA').map((q) => q._id);
  const secQIds = createdQuestions.filter((q) => q.subject === 'Cybersecurity').map((q) => q._id);
  const dbQIds = createdQuestions.filter((q) => q.subject === 'DBMS').map((q) => q._id);

  const examsToCreate = [
    {
      title: 'Full-Stack Web & MERN Architecture Certification',
      description: 'Comprehensive evaluation covering React 18, Node.js event loop, MongoDB indexing, security best practices, and JavaScript algorithms.',
      subject: 'Web Development',
      course: 'B.Tech CSE',
      department: 'Computer Science',
      questions: webQIds,
      totalMarks: 20,
      passingMarks: 10,
      duration: 45,
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // active now
      endTime: oneMonthLater,
      negativeMarking: true,
      randomizeQuestions: true,
      instructions: '1. Read questions carefully. 2. Multiple choice and coding questions are auto-evaluated. 3. Avoid leaving fullscreen or switching tabs.',
      proctoring: {
        trackTabSwitch: true,
        requireFullscreen: true,
        maxTabSwitchWarnings: 3,
      },
      status: 'active',
      createdBy: faculty._id,
    },
    {
      title: 'Data Structures & Algorithmic Problem Solving Challenge',
      description: 'Test your algorithmic mastery on Sorting, Trees, Graphs, Two-Pointers, and Space-Time Complexity analysis.',
      subject: 'DSA',
      course: 'B.Tech CSE',
      department: 'Computer Science',
      questions: dsaQIds,
      totalMarks: 18,
      passingMarks: 9,
      duration: 50,
      startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // active now
      endTime: oneMonthLater,
      negativeMarking: true,
      randomizeQuestions: false,
      instructions: 'Write optimized solutions. Test cases will validate algorithmic accuracy and edge cases.',
      proctoring: {
        trackTabSwitch: true,
        requireFullscreen: false,
        maxTabSwitchWarnings: 4,
      },
      status: 'active',
      createdBy: faculty._id,
    },
    {
      title: 'Cybersecurity, Cryptography & Network Defense Exam',
      description: 'Rigorous assessment on OWASP Top 10 vulnerabilities (XSS, CSRF), Zero Trust architecture, Public Key cryptography, and secure token design.',
      subject: 'Cybersecurity',
      course: 'B.Tech CSE',
      department: 'Computer Science',
      questions: secQIds,
      totalMarks: 13,
      passingMarks: 7,
      duration: 40,
      startTime: new Date(now.getTime() - 30 * 60 * 1000), // active now
      endTime: oneMonthLater,
      negativeMarking: true,
      instructions: 'Proctored cybersecurity exam. Any attempt to inspect element or change focus triggers an integrity penalty log.',
      proctoring: {
        trackTabSwitch: true,
        requireFullscreen: true,
        maxTabSwitchWarnings: 2,
      },
      status: 'active',
      createdBy: faculty._id,
    },
    {
      title: 'Database Engineering & Advanced SQL / NoSQL Systems',
      description: 'Covers ACID transactional semantics, relational normalization up to 3NF/BCNF, MongoDB aggregation framework, and query optimization.',
      subject: 'DBMS',
      course: 'B.Tech CSE',
      department: 'Computer Science',
      questions: dbQIds,
      totalMarks: 8,
      passingMarks: 4,
      duration: 35,
      startTime: new Date(now.getTime() - 10 * 60 * 1000), // active now
      endTime: oneMonthLater,
      negativeMarking: false,
      instructions: 'Demonstrate deep understanding of relational versus document databases.',
      proctoring: {
        trackTabSwitch: true,
        requireFullscreen: false,
        maxTabSwitchWarnings: 3,
      },
      status: 'active',
      createdBy: faculty._id,
    },
  ];

  for (const exData of examsToCreate) {
    const existingExam = await Exam.findOne({ title: exData.title });
    if (!existingExam) {
      const ex = await Exam.create(exData);
      console.log(`Created exam: ${ex.title} (${ex._id}) with ${ex.questions.length} questions`);
    } else {
      // Update status to active and refresh questions
      existingExam.status = 'active';
      existingExam.questions = exData.questions;
      existingExam.startTime = exData.startTime;
      existingExam.endTime = exData.endTime;
      await existingExam.save();
      console.log(`Updated exam to active: ${existingExam.title}`);
    }
  }

  console.log('Seeding extended questions & exams completed successfully!');
  await mongoose.disconnect();
}

seedExtended().catch((err) => {
  console.error('Seed extended error:', err);
  process.exit(1);
});
