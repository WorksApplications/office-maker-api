import AWS from 'aws-sdk';

const S3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME;

const main = async () => {
  if (!bucketName) {
    throw new Error('BUCKET_NAME is not specified');
  }

  const versions = (await S3.listObjectVersions({
    Bucket: bucketName
  }).promise()).Versions;

  // Delete one by one
  for (const version of versions) {
    await S3.deleteObject({
      Bucket: bucketName,
      Key: version.Key,
      VersionId: version.VersionId
    }).promise();
  }

  await S3.deleteBucket({
    Bucket: bucketName
  }).promise();
};

main();
