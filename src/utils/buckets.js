// var AWS = require('aws-sdk')
// var s3 = new AWS.S3({
//   endpoint: 'https://s3.filebase.com',
//   signatureVersion: 'v4',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// })
let buckets = []
// s3.listBuckets(async function (err, data) {
//   if (err) {
//     console.log(err, err.stack)
//   } else {
//     buckets = data.Buckets
//   }
// })
module.exports = buckets
