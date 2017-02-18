"use strict";

const sharp = require('sharp');
let Promise = require('bluebird');
let moment = require('moment');
let aws = require('./s3.module.js');

class Resizer {
    constructor(opts) {
        this._opts = opts;
        this._opts.h = opts.h || null;
        this._opts.w = opts.w || null;
        this._opts.format = opts.format || 'png';
        this._opts.delivery = opts.delivery || 'stream';
        this._opts.filename = opts.filename || moment().format('YYYYMMDD');
        this._img = undefined;
    }

    get() {
        return new Promise((resolve, reject) => {
            let src = this._opts.src;
            if (src.img) {
                this._img = src.img;
            } else {
                aws.download(src.s3.bucket, src.s3.key)
                    .then((data) => resolve(data))
                    .catch((err) => console.log(err));
            }
        });
    }

    delivery(_buffer) {
        return new Promise((resolve, reject) => {
            if (this._opts.delivery === 'stream' || !this._opts.delivery) {
                sharp(_buffer)
                    .toFormat(this._opts.format)
                    .toBuffer()
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
            } else if (this._opts.delivery.s3) {
                let s3 = this._opts.delivery.s3;
                sharp(_buffer)
                    .toFormat(this._opts.format)
                    .toBuffer()
                    .then((data) => {
                        let _key = `${s3.key || this._opts.filename}.${this._opts.format}`
                        aws.upload(data, s3.bucket, _key)
                            .then((res) => resolve(res))
                            .catch((err) => reject(err));
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
            } else if (this._opts.delivery === 'file') {
                sharp(_buffer)
                    .toFormat(this._opts.format)
                    .toFile(`./data/out/${this._opts.filename}.${this._opts.format}`)
                    .then((res) => {
                        console.log('ln 34');
                        resolve(res);
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
            }
        });
    }
    resize(_buffer) {
        return new Promise((resolve, reject) => {
            sharp(_buffer)
                .resize(this._opts.w, this._opts.h)
                .toBuffer()
                .then((data) => {
                    resolve(data);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    process() {
        return new Promise((resolve, reject) => {
            this.get()
                .then((_buffer) => {
                    this.resize()
                        .then((_buffer) => {
                            this.delivery(_buffer)
                                .then((res) => {
                                    resolve(res);
                                })
                                .catch((err) => {
                                    console.log(err)
                                    reject(err);
                                });
                        })
                        .catch((err) => {
                            console.log(err);
                            reject(err);
                        });
                });

        });
    }
}

module.exports = Resizer;