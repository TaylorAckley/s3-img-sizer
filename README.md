# s3 Image Resizer

Use Sharp to resize an image and put it where you need it.

### Features

- Accepts either a buffer or s3 object (bucket, key)
- Will deliver either a buffer of the resized image, or will write the file to s3.

## S3

In order for S3 to be leveraged, the following env variables need to be present.

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION

Use a .env file to securely load them in.

## Usage


```
//construct and object of options
let opts = {
    src: { // img buffer or s3.  Will use img if both are provided.
        img: <buffer> 
        s3: {
            bucket: 'my-bucket',
            key: 'path/to/img.jpg'
        }
    },
    delivery: { // will return a buffer if delivery is nnot provided.
        s3: {
            bucket: 'my-bucket',
            key: 'path/to/img'  //NOTE: do not include the extension.  defaults to timestamp if no key is provided.
        }
    },
    h: 300
    w: 300
    format: 'png' //default
};

let resizer = new Resizer(opts);
resizer.process()
    .then((data) => {
        //...... either a buffer or s3 confirmation.
    })
    .catch(() => console.log(err));