// const multer = require("multer");
// const path = require("path");

// // Storage config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // folder name
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   },
// });

// // File filter (only images)
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpg|jpeg|png/;
//   const ext = path.extname(file.originalname).toLowerCase();

//   if (allowedTypes.test(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images are allowed (jpg, jpeg, png)"));
//   }
// };

// // Upload config
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
// });

// module.exports = upload;

const multer = require("multer");

const upload = multer({
  dest: "uploads/",
});

module.exports = upload;