import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

const s3 = new AWS.S3();

function generatePresignedUrl(filename) {
  return new Promise((resolve, reject) => {
    const fileId = uuidv4();
    const signedUrlExpireSeconds = 60 * 15; // 15 minutes
    const _filename = filename || `${fileId}.jpg`;

    const key = `users/${fileId}/${_filename}`;

    const params = {
      Key: key,
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: "public-read",
      Expires: signedUrlExpireSeconds,
    };

    s3.getSignedUrl("putObject", params, (err, signedUrl) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          signedUrl: signedUrl,
          url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        });
      }
    });
  });
}

const uploadImg = async (req) => {
  if(process.env.UPLOAD_TO_AWS_S3){
    const signedUrl = await generatePresignedUrl(req.params.fileName);

    return {
      putUrl: signedUrl.signedUrl,
      getUrl: signedUrl.url,
    };
  }else{
    return {
      putUrl: "",
      getUrl:"",
    };
  }
 
};

export default uploadImg;
