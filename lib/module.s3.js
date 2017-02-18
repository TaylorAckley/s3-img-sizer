"use strict";

const moment = require('moment');
const Promise = require('bluebird');
const AWS = require('aws-sdk');
const crypto = require('crypto');

let config = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || null,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || null,
    AWS_REGION: process.env.AWS_REGION || null
};

let s3 = {
    getExpiryTime: function() {
        let _date = new Date();
        return '' + (_date.getFullYear()) + '-' + (_date.getMonth() + 1) + '-' +
            (_date.getDate() + 1) + 'T' + (_date.getHours() + 3) + ':' + '00:00.000Z';
    },
    createS3Policy: function(contentType, bucket) {
        return new Promise(function(resolve, reject) {
            let date = new Date();
            var s3Policy = {
                'expiration': module.exports.aws.getExpiryTime(),
                'conditions': [ //https://aws.amazon.com/articles/1434/
                    ['starts-with', '$key', ''], {
                        'bucket': bucket
                    }, {
                        'acl': 'private'
                    }, {
                        'success_action_status': '201'
                    },
                    ["starts-with", "$Content-Type", ""],
                    ["starts-with", "$filename", ""],
                    ["content-length-range", 0, 1048576 * 10]

                ]
            };

            // stringify and encode the policy
            let stringPolicy = JSON.stringify(s3Policy);
            let base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');

            // sign the base64 encoded policy
            let signature = crypto.createHmac('sha1', appConfig.AWS.AWS_SECRET_ACCESS_KEY)
                .update(new Buffer(base64Policy, 'utf-8')).digest('base64');

            // build the results object
            let s3Credentials = {
                s3Policy: base64Policy,
                s3Signature: signature,
                AWSAccessKeyId: appConfig.AWS.AWS_ACCESS_KEY_ID
            };

            // send it back
            resolve(s3Credentials);

        });
    },
    deleteS3Object: function(bucket, key) {
        return new Promise(function(resolve, reject) {
            if (!key) {
                reject('Error, no key');
            }
            let s3 = new AWS.S3();
            s3.deleteObjects({
                Bucket: bucket,
                Delete: {
                    Objects: [{
                        Key: key
                    }]
                }
            }, function(err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(data);
            });
        });

    },
    upload: function(body, bucket, key) {
        return new Promise(function(resolve, reject) {
            let body = fs.createReadStream(filepath);
            var s3obj = new AWS.S3({
                params: {
                    Bucket: bucket,
                    Key: key
                }
            });
            s3obj.upload({ // upload the deliverable to S3
                    Body: body
                })
                .send(function(err, data) {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });

        });

    },
    getSignedUrl: function(bucket, key) {
        return new Promise(function(resolve, reject) {
            let s3 = new AWS.S3();
            let url = s3.getSignedUrl('getObject', { // get a signed URL that will last for 20 minutes.
                Bucket: bucket,
                Key: key
            });
            resolve(key);
        });
    },
    download: function(bucket, key) {
        return new Promise(function(resolve, reject) {
            let s3 = new AWS.S3();
            let params = {
                Bucket: bucket,
                Key: key
            };
            var data;
            s3.getObject(params, (err, data) => {
                    data = data;
                })
                .createReadStream()
                .pipe(resolve(data));
        });
    }

};

module.exports = s3;