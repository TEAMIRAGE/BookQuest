//Importing packages
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");

// Database Directory import/linking
let admin_auth = require("../schemas/admin_auth.js");
let all_books = require("../schemas/all_books.js");
let book_details = require("../schemas/book_details.js");
let logs_book_issue = require("../schemas/logs_book_issue.js");
let request_details_books = require("../schemas/request_details_books.js");
let request_details_student_register = require("../schemas/request_details_student_register.js");
let student_auth = require("../schemas/student_auth.js");
let student_book_storage = require("../schemas/student_book_storage.js");
let student_notifications = require("../schemas/student_notifications.js");

//Directory linking/import
const studentAuthController = require("../authentication/studentAuthControl.js");
const adminAuthController = require("../authentication/adminAuthControl.js");
const {
  requireStudentAuth,
  requireAdminAuth,
} = require("../authentication/authMiddleware.js");
const renderPages = require("../mainRenders/render.js");
const pythonControl = require("../pythonController/AiPowered.js");

//Setting up express router
const route = express.Router();

//Setting up env file variables
dotenv.config({ path: "config.env" });
const port = process.env.PORT;
const ip = process.env.IP;
const gcpProId = process.env.GCP_PROID;
const gcpBucketName = process.env.GCP_BUCKET_NAME;
const gcpJsonKey = process.env.GCP_JSON_KEY;
const secretJwtKey = process.env.SECRET_JWT_KEY;

//Setting up multer
const upload = multer({
  storage: multer.memoryStorage(),
});

//Setting up GCP Bucket
const storage = new Storage({
  projectId: gcpProId,
  keyFilename: gcpJsonKey,
});
const bucket = storage.bucket(gcpBucketName);

//// Page Rendering
//Home Page
route.get("/", renderPages.homePage_get);

//Admin Login Page
route.get("/admin-login", renderPages.admin_login_get);

//Admin Signup Page
route.get("/admin-signup", renderPages.admin_signup_get);

//Student Login Page
route.get("/student-login", renderPages.student_login_get);

//Student Signup Page
route.get("/student-signup", renderPages.student_signup_get);

// Login Options Page
route.get("/login-options", renderPages.login_options_get);

//Admin New Book Registration
route.get(
  "/new-book-registration-form",
  requireAdminAuth,
  renderPages.new_book_register_form_get
);

// Add Similar Book Form
route.get(
  "/similar-book-add-form/:id",
  requireAdminAuth,
  renderPages.similar_book_add_form_get
);

// Specific book buy page
route.get(
  "/specific-book-student/:id",
  requireStudentAuth,
  renderPages.specific_book_buy_page_get
);

// Book Gallery
route.get("/book-gallery", renderPages.book_gallery_get);

// Student Profile
route.get(
  "/student-profile/:id",
  requireStudentAuth,
  renderPages.student_profile_get
);

// Student Notifications
route.get(
  "/student-notifications",
  requireStudentAuth,
  renderPages.student_notifications_get
);

// Book Request List
route.get(
  "/book-request-list",
  requireAdminAuth,
  renderPages.book_request_list_get
);

// Specific book manualId list for request
route.get(
  "/show-list-manualId-specific-book-request/:studentId/:bookId",
  requireAdminAuth,
  renderPages.book_request_manualId_list
);

// Admin book details list
route.get(
  "/all-books-info",
  requireAdminAuth,
  renderPages.admin_all_books_list_get
);

// Admin manualId book details list
route.get(
  "/specific-book-manaulId-list/:id",
  requireAdminAuth,
  renderPages.admin_books_manaulId_list_get
);

// Admin book update page
route.get(
  "/admin-book-update-page/:id",
  requireAdminAuth,
  renderPages.admin_book_update_page_get
);

// Admin transaction log
route.get(
  "/book-transaction-logs",
  requireAdminAuth,
  renderPages.admin_book_transaction_log_get
);

// Student List data
route.get(
  "/student-list-admin",
  requireAdminAuth,
  renderPages.student_details_list_get
);

// Student update page
route.get(
  "/specific-student-admin-view/:id",
  requireAdminAuth,
  renderPages.student_admin_view_page_get
);

// Admin student account request page
route.get(
  "/account-request-list",
  requireAdminAuth,
  renderPages.admin_student_account_request_list_get
);

// Genre wise book render page
route.get("/books/genre/:id", renderPages.book_top_genre_page_get);

// Admin Profile Page
route.get(
  "/admin-profile/:id",
  requireAdminAuth,
  renderPages.admin_profile_get
);

// AI powered Chat Form page
route.get("/ai-chat/:id", renderPages.AI_chat_Form_get);

//// API
// New Book Registration
route.post(
  "/api/new-book-registration",
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.body) {
        res.status(400).send({ message: "Content cannot be empty" });
        return;
      }

      if (!req.file) {
        const error = new Error("Please choose file");
        error.httpStatuscode = 400;
        return next(error);
      }

      // const jwtToken = req.cookies.jwt;
      // let userID;
      // if(jwtToken){
      //     const decodedToken = jwt.verify(jwtToken, secretJwtKey);
      //     userID = decodedToken.id;
      // }

      const gcBucketFileName = Date.now() + "_" + req.file.originalname;
      const gcBucketFile = bucket.file(gcBucketFileName);
      const stream = gcBucketFile.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      stream.on("error", (err) => {
        console.error(err);
        res.status(500).send("Error uploading file.");
      });

      stream.on("finish", async () => {
        //start

        const newBookDetailDataToLoad = new book_details({
          name: req.body.name,
          author: req.body.author,
          description: req.body.description,
          genre: req.body.option,
          readCount: 0,
          image_bucket_name: gcBucketFileName,

          quantity: 0,
          availableCount: 0,
        });
        const bookDetailData = await newBookDetailDataToLoad.save();

        res.redirect(`/similar-book-add-form/${bookDetailData._id}`);

        //end
      });

      stream.end(req.file.buffer);
    } catch (err) {
      res.status(500).send({
        message:
          err.message || "Some error occured while creating a create operation",
      });
    }
  }
);

// Similar book add form
route.post("/api/add-existing-book-form/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let book_Count;
    let available_Count;

    const newAllBooksDataToLoad = new all_books({
      admin_id_manual: req.body.manualID,
      book_details_id: id,
      status: 1,
    });

    const allBookData = await newAllBooksDataToLoad.save();
    const response = await axios.get(
      `${ip}${port}/api/all_books_details?id=${id}`
    );
    available_Count = response.data.availableCount;
    available_Count = available_Count + 1;
    book_Count = response.data.quantity;
    book_Count = book_Count + 1;
    const updateData = await book_details.findByIdAndUpdate(
      response.data._id,
      { quantity: book_Count, availableCount: available_Count },
      { new: true }
    );
    res.status(201).json({ newUser: allBookData._id });
  } catch (err) {
    let errors = { adminManualIdStatus: "" };
    if (err.code === 11000) {
      errors.adminManualIdStatus = "This ID is already used.";

      res.status(400).json({ errors });
    } else {
      res
        .status(500)
        .send(
          { message: err.message } ||
            "Some error occured while creating a create operation"
        );
    }
  }
});

// All Books Detail & Specific Book Detail
route.get("/api/all_books_details", async (req, res) => {
  try {
    if (req.query.id === "current-popular-books") {
      const data = await book_details.find().sort({ readCount: -1 }).limit(5);
      res.send(data);
    } else if (req.query.id === "latest-books") {
      const data = await book_details.find().sort({ _id: -1 }).limit(5);
      res.send(data);
    } else if (req.query.id === "firstYearBooks") {
      const data = await book_details.find({ genre: "1st_year" }).limit(5);
      res.send(data);
    } else if (req.query.id === "secondYearBooks") {
      const data = await book_details.find({ genre: "2nd_year" }).limit(5);
      res.send(data);
    } else if (req.query.id === "thirdYearBooks") {
      const data = await book_details.find({ genre: "3rd_year" }).limit(5);
      res.send(data);
    } else if (req.query.id === "fourthYearBooks") {
      const data = await book_details.find({ genre: "4th_year" }).limit(5);
      res.send(data);
    } else if (req.query.id) {
      const id = req.query.id;
      const data = await book_details.findById(id);
      if (!data) {
        res
          .status(400)
          .send({ message: "Not found information with id " + id });
      } else {
        res.send(data);
      }
    } else {
      const deleteZeroQuantityBooks = await book_details.deleteMany({
        quantity: 0,
      });
      if (deleteZeroQuantityBooks.length > 0) {
        deleteZeroQuantityBooks.forEach(async (data) => {
          await bucket.file(data.image_bucket_name).delete();
        });
      }
      const info = await book_details.find();
      res.send(info);
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

route.get("/specfic-buy-book/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const jwtToken = req.cookies.jwt;
    let userID;
    if (jwtToken) {
      const decodedToken = jwt.verify(jwtToken, secretJwtKey);
      userID = decodedToken.id;
    }

    const studentResponse = await student_auth.findById(userID);
    if (studentResponse.book_limit_counter < 5) {
      const bookRequestCheckResponse =
        await request_details_books.countDocuments({
          student_auth_id: studentResponse._id,
        });

      if (bookRequestCheckResponse < 3) {
        const bookDetailResponse = await book_details.findById(id);

        const sendBookRequest = new request_details_books({
          student_auth_id: studentResponse._id,
          book_details_id: bookDetailResponse._id,
        });
        const sendBookRequestResponse = await sendBookRequest.save();

        res.status(201).json({ success: sendBookRequestResponse._id });
      } else {
        let failure = {
          message: "Book Request Limit Exceeded: Last 3 request pending!!!",
        };

        res.status(400).json({ failure });
      }
    } else {
      let failure = {
        message:
          "Book Storage Limit Exceeded: Cannot keep more than 5 books!!!",
      };

      res.status(400).json({ failure });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

// Search Form POST request Book gallery
route.post("/search-form-book-gallery", async (req, res) => {
  try {
    const name = new RegExp(req.body.name, "i");
    const author = new RegExp(req.body.author, "i");
    const responseSearch = await book_details.findOne({
      name: name,
      author: author,
    });

    if (responseSearch) {
      res.status(201).json({ success: responseSearch._id });
    } else {
      let failure = { message: "No book found with given details." };

      res.status(400).json({ failure });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

route.get("/student-notifications-common", async (req, res) => {
  try {
    const userID = req.query.studentId;

    if (req.query.id) {
      console.log("this is running");
      const notificationResponse = await student_notifications.deleteMany({
        student_auth_id: userID,
      });
      res.redirect("/student-notifications");
    } else {
      console.log("ye he id" + userID);
      const notificationResponse = await student_notifications
        .find({ student_auth_id: userID })
        .sort({ _id: -1 });

      res.send(notificationResponse);
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

route.get("/api-book-request", async (req, res) => {
  try {
    const bookRequestList = await request_details_books.find();
    res.send(bookRequestList);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

route.get(
  "/api-admin-book-accept/:studentId/:bookId/:manualId",
  async (req, res) => {
    try {
      const studentId = req.params.studentId;
      const bookId = req.params.bookId;
      const manualId = req.params.manualId;

      const bookRequestDelete = await request_details_books.deleteOne({
        student_auth_id: studentId,
        book_details_id: bookId,
      });

      const addBookToStorage = new student_book_storage({
        student_auth_id: studentId,
        admin_id_manual_list: manualId,
      });
      await addBookToStorage.save();

      // readCount increase karo book
      const readCountResponse = await book_details.findById(bookId);

      // Update available Count

      let availableCounter = readCountResponse.availableCount;
      availableCounter = availableCounter - 1;

      let readCounter;
      readCounter = readCountResponse.readCount;
      readCounter = readCounter + 1;
      await book_details.findByIdAndUpdate(
        bookId,
        { readCount: readCounter, availableCount: availableCounter },
        { new: true }
      );

      const addBooksInLogs = new logs_book_issue({
        student_auth_id: studentId,
        admin_id_manual: manualId,
        book_details_id: bookId,
      });

      await addBooksInLogs.save();

      const checkNotificationCount = await student_notifications.find({
        student_auth_id: studentId,
      });
      const bookDetailsForNotification = await book_details.findById(bookId);

      if (checkNotificationCount.length > 0) {
        let counter;
        counter = checkNotificationCount[0].message_count;
        counter = counter + 1;

        const addNewNotification = new student_notifications({
          student_auth_id: studentId,
          book_request_status: `Your Book ${bookDetailsForNotification.name} by author ${bookDetailsForNotification.author} is accepted by admin.`,
          message_count: counter,
        });

        await addNewNotification.save();

        await student_notifications.updateMany(
          { student_auth_id: studentId },
          { $set: { message_count: counter } }
        );
      } else {
        const addNewNotification = new student_notifications({
          student_auth_id: studentId,
          book_request_status: `Your Book ${bookDetailsForNotification.name} by author ${bookDetailsForNotification.author} is accepted by admin.`,
          message_count: 1,
        });

        await addNewNotification.save();
      }

      let limitCounter;
      const studentDetailForLimitCounter = await student_auth.findById(
        studentId
      );
      limitCounter = studentDetailForLimitCounter.book_limit_counter;
      limitCounter = limitCounter + 1;

      await student_auth.findByIdAndUpdate(
        studentId,
        { book_limit_counter: limitCounter },
        { new: true }
      );

      await all_books.findOneAndUpdate(
        { admin_id_manual: manualId },
        { status: 0 },
        { new: true }
      );

      if (bookDetailsForNotification.availableCount === 0) {
        const notificationData = await request_details_books.find({
          book_details_id: bookDetailsForNotification._id,
        });

        const student_auth_ids = notificationData.map(
          (notification) => notification.student_auth_id
        );

        const existingNotifications = await student_notifications.find({
          student_auth_id: { $in: student_auth_ids },
        });

        const matchedStudentAuthIds = existingNotifications.map(
          (notification) => notification.student_auth_id
        );
        const unmatchedStudentAuthIds = student_auth_ids.filter(
          (id) => !matchedStudentAuthIds.includes(id)
        );

        if (matchedStudentAuthIds.length > 0) {
          const newNotifications = matchedStudentAuthIds.map(
            (student_auth_id) => ({
              student_auth_id,
              book_request_status: `Your Book ${bookDetailsForNotification.name} by author ${bookDetailsForNotification.author} is rejected by admin.`,
              message_count:
                existingNotifications.find(
                  (notification) =>
                    notification.student_auth_id === student_auth_id
                ).message_count + 1,
            })
          );

          await student_notifications.insertMany(newNotifications);
          await request_details_books.deleteMany({
            student_auth_id: { $in: matchedStudentAuthIds },
          });
        }

        if (unmatchedStudentAuthIds.length > 0) {
          const newNotifications = unmatchedStudentAuthIds.map(
            (student_auth_id) => ({
              student_auth_id,
              book_request_status: `Your Book ${bookDetailsForNotification.name} by author ${bookDetailsForNotification.author} is rejected by admin.`,
              message_count: 1,
            })
          );

          await student_notifications.insertMany(newNotifications);
          await request_details_books.deleteMany({
            student_auth_id: { $in: unmatchedStudentAuthIds },
          });
        }
      }

      res.redirect("/book-request-list");
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error occurred while retrieving information",
      });
    }
  }
);

route.get("/api-admin-book-reject/:studentId/:bookId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const bookId = req.params.bookId;

    // iss student ko notification bhejna h phele reject ka
    // uske bad book_request database se ye student ka ye book delete krna h

    const checkNotificationCount = await student_notifications.find({
      student_auth_id: studentId,
    });
    const bookDetailsForNotification = await book_details.findById(bookId);

    if (checkNotificationCount) {
      let counter;
      counter = checkNotificationCount[0].message_count;
      counter = counter + 1;

      checkNotificationCount.forEach(async (doc) => {
        doc.message_count = counter;
        await doc.save();
      });

      const addNewNotification = new student_notifications({
        student_auth_id: studentId,
        book_request_status: `Your Book ${bookDetailsForNotification.name} by author ${bookDetailsForNotification.author} is rejected by admin.`,
        message_count: counter,
      });

      await addNewNotification.save();
    } else {
      const addNewNotification = new student_notifications({
        student_auth_id: studentId,
        book_request_status: `Your Book ${bookDetailsForNotification.name} by author ${bookDetailsForNotification.author} is rejected by admin.`,
        message_count: 1,
      });

      await addNewNotification.save();
    }

    await request_details_books.deleteOne({
      student_auth_id: studentId,
      book_details_id: bookId,
    });
    res.redirect("/book-request-list");
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

// search form for book list

route.post("/search-form-book-admin", async (req, res) => {
  try {
    const name = new RegExp(req.body.name, "i");
    const author = new RegExp(req.body.author, "i");
    const responseSearch = await book_details.findOne({
      name: name,
      author: author,
    });

    if (responseSearch) {
      res.status(201).json({ success: responseSearch._id });
    } else {
      let failure = { message: "No book found with given details." };

      res.status(400).json({ failure });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

// Search Form for student list
route.post("/admin-search-form-student-list", async (req, res) => {
  try {
    const name = new RegExp(req.body.name, "i");
    const rollNo = req.body.rollNo;
    const year = req.body.year;
    const branch = req.body.branch;
    const responseSearch = await student_auth.findOne({
      name: name,
      roll_no: rollNo,
      year: year,
      branch: branch,
    });

    if (responseSearch) {
      res.status(201).json({ success: responseSearch._id });
    } else {
      let failure = { message: "No student found with given details." };

      res.status(400).json({ failure });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

route.get("/admin-book-delete/:id", async (req, res) => {
  try {
    const manualId = req.params.id;

    const manualIdResponse = await all_books.findByIdAndDelete(manualId);
    const bookId = manualIdResponse.book_details_id;

    const bookDetailsResponse = await book_details.findById(bookId);
    let quantityCount = bookDetailsResponse.quantity;
    quantityCount = quantityCount - 1;
    await book_details.findByIdAndUpdate(
      bookId,
      { quantity: quantityCount },
      { new: true }
    );

    // available count
    if (manualIdResponse.status === 1) {
      let availableCounter = bookDetailsResponse.availableCount;
      availableCounter = availableCounter - 1;
      await book_details.findByIdAndUpdate(bookId, {
        availableCount: availableCounter,
      });
    } else if (manualIdResponse.status === 0) {
      const findUser = await student_book_storage.find({
        admin_id_manual_list: manualIdResponse.admin_id_manual,
      });
      console.log("findUser without index ", findUser);
      console.log("findUser with index ", findUser[0]);
      const user_Id = findUser[0].student_auth_id;
      const studentDetail = await student_auth.findById(user_Id);
      let bookLimitCounter = studentDetail.book_limit_counter;
      bookLimitCounter = bookLimitCounter - 1;
      await student_auth.findByIdAndUpdate(
        user_Id,
        { book_limit_counter: bookLimitCounter },
        { new: true }
      );
      await student_book_storage.deleteOne({
        student_auth_id: user_Id,
        admin_id_manual_list: manualIdResponse.admin_id_manual,
      });
    }

    res.redirect(`/specific-book-manaulId-list/${bookId}`);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

// Admin student delete
route.get("/api/admin/student-delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const storageCheck = await student_book_storage.find({
      student_auth_id: id,
    });
    if (storageCheck.length) {
      let failure = {
        message:
          "This student Acc. contains some book, delete all books from this Acc. first!",
        id: id,
      };

      res.status(400).json({ failure });
    } else {
      const studentDetail = await student_auth.findById(id);
      const imageBucketName = studentDetail.image_bucket_name;
      await bucket.file(imageBucketName).delete();
      await student_auth.findByIdAndDelete(id);
      let success = { message: "Account Successfully deleted!" };
      res.status(201).json({ success });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

// Book return api
route.get(
  "/api-admin-book-return/:bookId/:adminManualId/:studentId",
  async (req, res) => {
    try {
      const bookId = req.params.bookId;
      const adminManualId = req.params.adminManualId;
      const studentId = req.params.studentId;

      // Student ka book storage se delete karo
      await student_book_storage.deleteOne({
        student_auth_id: studentId,
        admin_id_manual_list: adminManualId,
      });

      // status ko active kardo manualId book ka
      await all_books.updateOne(
        { admin_id_manual: adminManualId },
        { status: 1 }
      );

      // student ka profile se limit minus krna
      const studentResponse = await student_auth.findById(studentId);
      let limitCounter = studentResponse.book_limit_counter;
      limitCounter = limitCounter - 1;
      await student_auth.findByIdAndUpdate(
        studentId,
        { book_limit_counter: limitCounter },
        { new: true }
      );

      // Book ka availableCount ++

      const bookResponse = await book_details.findById(bookId);
      let availableCounter = bookResponse.availableCount;
      availableCounter = availableCounter + 1;
      await book_details.findByIdAndUpdate(
        bookId,
        { availableCount: availableCounter },
        { new: true }
      );

      // Logs k database se delete karo
      await logs_book_issue.deleteOne({
        student_auth_id: studentId,
        admin_id_manual: adminManualId,
        book_details_id: bookId,
      });

      res.redirect("/book-transaction-logs");
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error Occured while retrieving Information",
      });
    }
  }
);

// Book Update API
route.post(
  "/api/admin-book-update/:id",
  upload.single("file"),
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!req.body) {
        res.status(400).send({ message: "Content cannot be empty" });
        return;
      }

      if (!req.file) {
        await book_details.findByIdAndUpdate(id, {
          name: req.body.name,
          author: req.body.author,
          description: req.body.description,
          genre: req.body.option,
        });

        res.redirect(`/specific-book-manaulId-list/${id}`);
      } else {
        const gcBucketFileName = Date.now() + "_" + req.file.originalname;
        const gcBucketFile = bucket.file(gcBucketFileName);
        const stream = gcBucketFile.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });
        stream.on("error", (err) => {
          console.error(err);
          res.status(500).send("Error uploading file.");
        });

        let imageBucketName;
        stream.on("finish", async () => {
          //start

          const previousDetails = await book_details.findById(id);
          imageBucketName = previousDetails.image_bucket_name;

          await book_details.findByIdAndUpdate(id, {
            name: req.body.name,
            author: req.body.author,
            description: req.body.description,
            genre: req.body.option,
            image_bucket_name: gcBucketFileName,
          });

          await bucket.file(imageBucketName).delete();

          res.redirect(`/specific-book-manaulId-list/${id}`);

          //end
        });

        stream.end(req.file.buffer);
      }
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error Occured while retrieving Information",
      });
    }
  }
);

//admin- student account request handle
route.get("/api/student-account-request/:id/:decision", async (req, res) => {
  try {
    const id = req.params.id;
    const decision = req.params.decision;

    if (decision === "accept") {
      await student_auth.findByIdAndUpdate(id, { decision: 1 }, { new: true });
      await request_details_student_register.deleteOne({ student_auth_id: id });
    } else if (decision === "reject") {
      const currentStudent = await student_auth.findById(id);
      let imageBucketName = currentStudent.image_bucket_name;
      await bucket.file(imageBucketName).delete();
      await request_details_student_register.deleteOne({ student_auth_id: id });
      await student_auth.findByIdAndDelete(currentStudent._id);
    }
    res.redirect("/account-request-list");
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving Information",
    });
  }
});

// Student Update api
route.post(
  "/api/admin-student-update/:id",
  upload.single("file"),
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!req.body) {
        res.status(400).send({ message: "Content cannot be empty" });
        return;
      }

      if (!req.file) {
        await student_auth.findByIdAndUpdate(id, {
          name: req.body.name,
          roll_no: req.body.rollNo,
          year: req.body.year,
          branch: req.body.branch,
          email: req.body.email,
        });
        res.redirect(`/specific-student-admin-view/${id}`);
      } else {
        const gcBucketFileName = Date.now() + "_" + req.file.originalname;
        const gcBucketFile = bucket.file(gcBucketFileName);
        const stream = gcBucketFile.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });
        stream.on("error", (err) => {
          console.error(err);
          res.status(500).send("Error uploading file.");
        });

        let imageBucketName;
        stream.on("finish", async () => {
          //start

          const previousDetails = await student_auth.findById(id);
          imageBucketName = previousDetails.image_bucket_name;

          await student_auth.findByIdAndUpdate(id, {
            name: req.body.name,
            roll_no: req.body.rollNo,
            year: req.body.year,
            branch: req.body.branch,
            email: req.body.email,
            image_bucket_name: gcBucketFileName,
          });

          await bucket.file(imageBucketName).delete();

          res.redirect(`/specific-student-admin-view/${id}`);

          //end
        });

        stream.end(req.file.buffer);
      }
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error Occured while retrieving Information",
      });
    }
  }
);

// Admin Profile update api
route.post(
  "/api/admin-profile-update/:id",
  upload.single("file"),
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!req.body) {
        res.status(400).send({ message: "Content cannot be empty" });
        return;
      }

      if (!req.file) {
        await admin_auth.findByIdAndUpdate(id, {
          name: req.body.name,
          email: req.body.email,
        });
        res.redirect(`/admin-profile/${id}`);
      } else {
        const gcBucketFileName = Date.now() + "_" + req.file.originalname;
        const gcBucketFile = bucket.file(gcBucketFileName);
        const stream = gcBucketFile.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });
        stream.on("error", (err) => {
          console.error(err);
          res.status(500).send("Error uploading file.");
        });

        let imageBucketName;
        stream.on("finish", async () => {
          //start

          const previousDetails = await admin_auth.findById(id);
          imageBucketName = previousDetails.image_bucket_name;

          await admin_auth.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            image_bucket_name: gcBucketFileName,
          });

          await bucket.file(imageBucketName).delete();

          res.redirect(`/admin-profile/${id}`);

          //end
        });

        stream.end(req.file.buffer);
      }
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error Occured while retrieving Information",
      });
    }
  }
);

route.get("/api/books/genre/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (id === "fiction-All") {
      const details = await book_details
        .find({ genre: "fiction" })
        .sort({ readCount: -1 });

      res.send(details);
    } else if (id === "history-All") {
      const details = await book_details
        .find({ genre: "history" })
        .sort({ readCount: -1 });

      res.send(details);
    } else if (id === "biography-All") {
      const details = await book_details
        .find({ genre: "biography" })
        .sort({ readCount: -1 });

      res.send(details);
    } else if (id === "science-All") {
      const details = await book_details
        .find({ genre: "science" })
        .sort({ readCount: -1 });

      res.send(details);
    } else if (id === "comic-All") {
      const details = await book_details
        .find({ genre: "comic" })
        .sort({ readCount: -1 });

      res.send(details);
    } else if (id === "firstYear-All") {
      const details = await book_details.find({ genre: "1st_year" });

      res.send(details);
    } else if (id === "secondYear-All") {
      const details = await book_details.find({ genre: "2nd_year" });

      res.send(details);
    } else if (id === "thirdYear-All") {
      const details = await book_details.find({ genre: "3rd_year" });

      res.send(details);
    } else if (id === "fourthYear-All") {
      const details = await book_details.find({ genre: "4th_year" });

      res.send(details);
    }
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
});

// Admin Registration
route.post(
  "/admin-signup",
  upload.single("file"),
  adminAuthController.admin_signup_post
);

// Admin Login
route.post("/admin-login", adminAuthController.admin_login_post);

// Student Registration
route.post(
  "/student-signup",
  upload.single("file"),
  studentAuthController.student_signup_post
);

// Student Login
route.post("/student-login", studentAuthController.student_login_post);

// Logout
route.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});

// About Us
route.get("/aboutUs", (req, res) => {
  res.render("aboutUs.ejs");
});

module.exports = route;
