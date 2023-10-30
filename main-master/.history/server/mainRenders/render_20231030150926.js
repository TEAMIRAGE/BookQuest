// Importing Packages
const axios = require("axios");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const dotenv = require("dotenv");

// Database Directory import/linking
let request_details_books = require("../schemas/request_details_books.js");
let student_auth = require("../schemas/student_auth.js");
let student_book_storage = require("../schemas/student_book_storage.js");
let all_books = require("../schemas/all_books.js");
let book_details = require("../schemas/book_details.js");
let logs_book_issue = require("../schemas/logs_book_issue.js");
const request_details_student_register = require("../schemas/request_details_student_register.js");
const admin_auth = require("../schemas/admin_auth.js");

//Setting up env file variables
dotenv.config({ path: "config.env" });
const port = process.env.PORT;
const ip = process.env.IP;
const gcpProId = process.env.GCP_PROID;
const gcpBucketName = process.env.GCP_BUCKET_NAME;
const gcpJsonKey = process.env.GCP_JSON_KEY;
const secretJwtKey = process.env.SECRET_JWT_KEY;

//Setting up GCP Bucket
const storage = new Storage({
  projectId: gcpProId,
  keyFilename: gcpJsonKey,
});
const bucket = storage.bucket(gcpBucketName);

//// Rendering Pages
// Home Page
module.exports.homePage_get = async (req, res) => {
  try {
    const popularBookResponse = await axios.get(
      `${ip}${port}/api/all_books_details?id=current-popular-books`
    );
    const popularBookDetails = popularBookResponse.data;

    const popularBookSet = await Promise.all(
      popularBookDetails.map(async (info) => {
        const [signedURL] = await bucket
          .file(info.image_bucket_name)
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          });

        return {
          signedURL,
          name: info.name,
          author: info.author,
          id: info._id,
        };
      })
    );

    const latestBookResponse = await axios.get(
      `${ip}${port}/api/all_books_details?id=latest-books`
    );
    const latestBookDetails = latestBookResponse.data;

    const latestBookSet = await Promise.all(
      latestBookDetails.map(async (info) => {
        const [signedURL] = await bucket
          .file(info.image_bucket_name)
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          });

        return {
          signedURL,
          name: info.name,
          author: info.author,
          id: info._id,
        };
      })
    );

    const firstYearBookResponse = await axios.get(
      `${ip}${port}/api/all_books_details?id=firstYearBooks`
    );
    const firstYearBookDetails = firstYearBookResponse.data;

    const firstYearBookSet = await Promise.all(
      firstYearBookDetails.map(async (info) => {
        const [signedURL] = await bucket
          .file(info.image_bucket_name)
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          });

        return {
          signedURL,
          name: info.name,
          author: info.author,
          id: info._id,
        };
      })
    );

    const secondYearBookResponse = await axios.get(
      `${ip}${port}/api/all_books_details?id=secondYearBooks`
    );
    const secondYearBookDetails = secondYearBookResponse.data;

    const secondYearBookSet = await Promise.all(
      secondYearBookDetails.map(async (info) => {
        const [signedURL] = await bucket
          .file(info.image_bucket_name)
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          });

        return {
          signedURL,
          name: info.name,
          author: info.author,
          id: info._id,
        };
      })
    );

    const thirdYearBookResponse = await axios.get(
      `${ip}${port}/api/all_books_details?id=thirdYearBooks`
    );
    const thirdYearBookDetails = thirdYearBookResponse.data;

    const thirdYearBookSet = await Promise.all(
      thirdYearBookDetails.map(async (info) => {
        const [signedURL] = await bucket
          .file(info.image_bucket_name)
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          });

        return {
          signedURL,
          name: info.name,
          author: info.author,
          id: info._id,
        };
      })
    );

    const fourthYearBookResponse = await axios.get(
      `${ip}${port}/api/all_books_details?id=fourthYearBooks`
    );
    const fourthYearBookDetails = fourthYearBookResponse.data;

    const fourthYearBookSet = await Promise.all(
      fourthYearBookDetails.map(async (info) => {
        const [signedURL] = await bucket
          .file(info.image_bucket_name)
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          });

        return {
          signedURL,
          name: info.name,
          author: info.author,
          id: info._id,
        };
      })
    );

    res.render("home.ejs", {
      popularBookSet,
      latestBookSet,
      firstYearBookSet,
      secondYearBookSet,
      thirdYearBookSet,
      fourthYearBookSet,
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

// Admin Signup Page
module.exports.admin_signup_get = (req, res) => {
  res.render("adminSignUp.ejs");
};

// Admin Login Page
module.exports.admin_login_get = (req, res) => {
  res.render("adminLogin.ejs");
};

// Student Signup Page
module.exports.student_signup_get = (req, res) => {
  res.render("studentSignUp.ejs");
};

// Student Login Page
module.exports.student_login_get = (req, res) => {
  res.render("studentLogin.ejs");
};

// Login Option Page
module.exports.login_options_get = (req, res) => {
  res.render("loginOption.ejs");
};

// New Book Register Page
module.exports.new_book_register_form_get = (req, res) => {
  res.render("addNewBookForm.ejs");
};

// Similar Book Add Page
module.exports.similar_book_add_form_get = async (req, res) => {
  try {
    const id = req.params.id;

    const response = await axios.get(
      `${ip}${port}/api/all_books_details?id=${id}`
    );

    const details = response.data;

    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
    };
    const [signedUrl] = await bucket
      .file(details.image_bucket_name)
      .getSignedUrl(options);
    details.profileUrl = signedUrl;

    res.render("addSimilarBookForm.ejs", { details });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.specific_book_buy_page_get = async (req, res) => {
  try {
    const id = req.params.id;

    const response = await axios.get(
      `${ip}${port}/api/all_books_details?id=${id}`
    );

    const details = response.data;

    const jwtToken = req.cookies.jwt;
    let userID;
    if (jwtToken) {
      const decodedToken = jwt.verify(jwtToken, secretJwtKey);
      userID = decodedToken.id;
    }

    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
    };
    const [signedUrl] = await bucket
      .file(details.image_bucket_name)
      .getSignedUrl(options);
    details.profileUrl = signedUrl;
    const alreadyRequestedResponse = await request_details_books.findOne({
      student_auth_id: userID,
      book_details_id: details._id,
    });
    if (alreadyRequestedResponse) {
      details.alreadyRequested = 1;
    } else {
      details.alreadyRequested = 0;
    }

    res.render("specificBookBuyPage.ejs", { details });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.book_gallery_get = async (req, res) => {
  try {
    const response = await axios.get(`${ip}${port}/api/all_books_details`);
    const details = response.data;

    const details_all = await Promise.all(
      details.map(async (info) => {
        const [signedURL] = await bucket
          .file(info.image_bucket_name)
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          });

        return {
          signedURL,
          name: info.name,
          author: info.author,
          id: info._id,
        };
      })
    );

    res.render("bookGallery.ejs", { details_all });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.student_profile_get = async (req, res) => {
  try {
    const id = req.params.id;
    const studentInfo = await student_auth.findById(id);
    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
    };

    if (!studentInfo) {
      throw new Error("Student not found");
    }

    const [signedUrl] = await bucket
      .file(studentInfo.image_bucket_name)
      .getSignedUrl(options);
    studentInfo.profileUrl = signedUrl;

    const collectionInfo = await student_book_storage.find({
      student_auth_id: studentInfo._id,
    });

    if (collectionInfo.length === 1) {
      studentInfo.collectionStatus = 1;
      const manualIdInfo = await all_books.findOne({
        admin_id_manual: collectionInfo[0].admin_id_manual_list,
      });

      if (manualIdInfo) {
        const bookInfo = await book_details.findById(
          manualIdInfo.book_details_id
        );

        if (!bookInfo) {
          throw new Error("Book details not found");
        }

        const [signedUrl] = await bucket
          .file(bookInfo.image_bucket_name)
          .getSignedUrl(options);
        bookInfo.imageLink = signedUrl;
        bookInfo.manualId = manualIdInfo.admin_id_manual;

        res.render("studentProfile.ejs", { studentInfo, bookInfo });
      } else {
        throw new Error("Manual ID info not found");
      }
    } else if (collectionInfo.length > 1) {
      studentInfo.collectionStatus = 2;
      const manualIdInfo = collectionInfo.map(
        (studentBook) => studentBook.admin_id_manual_list
      );
      const books = await all_books.find({
        admin_id_manual: { $in: manualIdInfo },
      });
      const bookDetailIds = books.map((book) => book.book_details_id);
      const bookDetails = await book_details.find({
        _id: { $in: bookDetailIds },
      });

      const adminIdMap = new Map();
      books.forEach((book) => {
        adminIdMap.set(book.book_details_id.toString(), book.admin_id_manual);
      });

      const details_all = await Promise.all(
        bookDetails.map(async (info) => {
          const adminId = adminIdMap.get(info._id.toString());

          const [signedURL] = await bucket
            .file(info.image_bucket_name)
            .getSignedUrl({
              action: "read",
              expires: Date.now() + 60 * 60 * 1000,
            });

          return {
            signedURL,
            name: info.name,
            author: info.author,
            id: info._id,
            manualID: adminId,
          };
        })
      );

      res.render("studentProfile.ejs", { studentInfo, details_all });
    } else {
      studentInfo.collectionStatus = 0;
      res.render("studentProfile.ejs", { studentInfo });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while performing this operation",
    });
  }
};

module.exports.student_notifications_get = async (req, res) => {
  try {
    const jwtToken = req.cookies.jwt;
    let userID;
    if (jwtToken) {
      const decodedToken = jwt.verify(jwtToken, secretJwtKey);
      userID = decodedToken.id;
    }
    const response = await axios.get(
      `${ip}${port}/student-notifications-common?studentId=${userID}`
    );
    const details = response.data;

    if (details.length > 0) {
      details.checkMessage = 1;
    } else {
      details.checkMessage = 0;
    }
    details.studentId = userID;
    res.render("studentNotifications.ejs", { details });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.book_request_list_get = async (req, res) => {
  try {
    const response = await axios.get(`${ip}${port}/api-book-request`);
    const details = response.data;
    const contentCheck = { status: -1 };

    if (details.length > 0) {
      contentCheck.status = 1;

      const idArray = [];
      details.forEach((doc) => {
        if (doc.student_auth_id) {
          idArray.push(doc.student_auth_id);
        }
        if (doc.book_details_id) {
          idArray.push(doc.book_details_id);
        }
      });

      const studentDetailPromises = idArray.map((id) =>
        student_auth.findById(id)
      );
      const bookDetailPromises = idArray.map((id) => book_details.findById(id));

      let studentDetailData = await Promise.all(studentDetailPromises);
      let bookDetailData = await Promise.all(bookDetailPromises);

      // Remove null values from studentDetailData and bookDetailData arrays
      studentDetailData = studentDetailData.filter((data) => data !== null);
      bookDetailData = bookDetailData.filter((data) => data !== null);

      console.log("student Detail ka list: ", studentDetailData);
      console.log("book Detail ka list: ", bookDetailData);

      const mappedData = {
        studentDetail: studentDetailData,
        bookDetail: bookDetailData,
      };

      res.render("adminBookRequestList.ejs", {
        contentCheck,
        data: mappedData,
      });
    } else {
      contentCheck.status = 0;
      res.render("adminBookRequestList.ejs", { contentCheck });
    }
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while performing this operation",
    });
  }
};

module.exports.book_request_manualId_list = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const bookId = req.params.bookId;

    const manualIdResponse = await all_books.find({ book_details_id: bookId });
    manualIdResponse.studentId = studentId;
    res.render("adminBookRequestManualIdlist.ejs", { data: manualIdResponse });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.admin_all_books_list_get = async (req, res) => {
  try {
    const details = await book_details.find();

    res.render("adminAllBooksList.ejs", { details });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.admin_books_manaulId_list_get = async (req, res) => {
  try {
    const bookId = req.params.id;
    const details = await all_books.find({ book_details_id: bookId });

    if (details.length > 0) {
      details.checkMessage = 1;
    } else {
      details.checkMessage = 0;
    }

    res.render("adminManualidSimilarBookList.ejs", { details });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.admin_book_transaction_log_get = async (req, res) => {
  try {
    const logData = await logs_book_issue.find();
    const studentData = await student_auth.find();
    const bookData = await book_details.find();

    const combinedData = logData.map((log) => {
      const student = studentData.find(
        (student) => student._id.toString() === log.student_auth_id.toString()
      );
      const book = bookData.find(
        (book) => book._id.toString() === log.book_details_id.toString()
      );

      return {
        studentName: student.name,
        studentId: log.student_auth_id,
        bookName: book.name,
        authorName: book.author,
        bookId: log.book_details_id,
        adminManualId: log.admin_id_manual,
      };
    });

    res.render("adminBookTransactionLog.ejs", { data: combinedData });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.admin_book_update_page_get = async (req, res) => {
  try {
    const id = req.params.id;

    const response = await axios.get(
      `${ip}${port}/api/all_books_details?id=${id}`
    );

    const details = response.data;

    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
    };
    const [signedUrl] = await bucket
      .file(details.image_bucket_name)
      .getSignedUrl(options);
    details.profileUrl = signedUrl;

    res.render("adminBookUpdatePage.ejs", { details });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.student_details_list_get = async (req, res) => {
  try {
    const details = await student_auth.find({ decision: 1 });

    res.render("studentDetailList.ejs", { details });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.student_admin_view_page_get = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await student_auth.findById(id);

    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
    };
    const [signedUrl] = await bucket
      .file(details.image_bucket_name)
      .getSignedUrl(options);
    details.profileUrl = signedUrl;

    res.render("studentUpdateDelete.ejs", { details });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.admin_profile_get = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await admin_auth.findById(id);

    const fictionDataCount = await book_details.countDocuments({
      genre: "fiction",
    });
    const biographyDataCount = await book_details.countDocuments({
      genre: "biography",
    });
    const historyDataCount = await book_details.countDocuments({
      genre: "history",
    });
    const scienceDataCount = await book_details.countDocuments({
      genre: "science",
    });
    const comicDataCount = await book_details.countDocuments({
      genre: "comic",
    });

    const allGenreCount = {
      fictionDataCount: fictionDataCount,
      biographyDataCount: biographyDataCount,
      historyDataCount: historyDataCount,
      scienceDataCount: scienceDataCount,
      comicDataCount: comicDataCount,
    };

    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // expire time - 15min
    };
    const [signedUrl] = await bucket
      .file(details.image_bucket_name)
      .getSignedUrl(options);
    details.profileUrl = signedUrl;

    res.render("adminProfile.ejs", { details, allGenreCount });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.admin_student_account_request_list_get = async (req, res) => {
  try {
    const requestData = await request_details_student_register.find();

    const students = [];

    for (const request of requestData) {
      const studentData = await student_auth.findById(request.student_auth_id);

      const combinedData = {
        _id: studentData._id,
        name: studentData.name,
        roll_no: studentData.roll_no,
        email: studentData.email,
        year: studentData.year,
        branch: studentData.branch,
        username: studentData.username,
      };

      students.push(combinedData);
    }

    res.render("adminAccountRequestList.ejs", { students });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.book_top_genre_page_get = async (req, res) => {
  try {
    const id = req.params.id;

    const response = await axios.get(`${ip}${port}/api/books/genre/${id}`);
    const details = response.data;

    const details_all = await Promise.all(
      details.map(async (info) => {
        const [signedURL] = await bucket
          .file(info.image_bucket_name)
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          });

        return {
          signedURL,
          name: info.name,
          author: info.author,
          id: info._id,
          genre: info.genre,
        };
      })
    );

    res.render("topGenreCollection.ejs", { details_all });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};

module.exports.AI_chat_Form_get = async (req, res) => {
  try {
    const id = req.params.id;

    res.render("AIpoweredForm.ejs");
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occured while performing this operation",
    });
  }
};
