const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const upload = async (file) => {
  const cleanFileName = (filename) => {
    return filename.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
  };
  const fileName = cleanFileName(file.name);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.body,
    ContentType: file.type,
    ACL: "public-read",
  };
  try {
    const uploadResult = await s3.upload(params).promise();
    return { messageType: "S", data: uploadResult };
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = upload;

