const fileTypeMap = {
  image: /\.(jpe?g|png)$/i,
  resume: /\.(pdf|doc|docx)$/i,
};

exports.createFileFilter = (allowedFields = []) => (req, file, cb) => {
  if (!allowedFields.includes(file.fieldname)) {
    return cb(new Error(`Unexpected file field: ${file.fieldname}`));
  }

  const pattern = fileTypeMap[file.fieldname];
  if (!pattern || !pattern.test(file.originalname)) {
    return cb(new Error(`Invalid file type for ${file.fieldname}`));
  }

  cb(null, true);
};
