## Proposed R2 storage plan

### Proposed workflow

Example workflow: 
- Photographer uploads photos to the gallery workspace.
- Photos are uploaded to the R2 storage bucket.
- Photos are automatically resized and compressed to 1000px width and ?% quality.
- Thumbnails are generated and stored in the R2 storage bucket.
- Thumbnails are automatically resized and compressed to 400px width and ?% quality.
- Thumbnails are stored in the R2 storage bucket.

### Changes to photos module

- Thumbnails and original photos are accessed via the R2 public CDN url. 

### Delivery collection photos and download flow

- When the download is initiated, the async worker is triggered to generate the zip file and store it in the R2 storage bucket.
- When the zip file is generated and pushed to the R2 storage bucked, the URL is stored on the delivery collection record. 
- While the zip file is being generated, the FE shows the loading indicator and keeps pooling the API for the zip file URL.
- Once the zip file is generated, a signed URL is generated for the zip file and passed to the FE to give the client a direct download link.
- Client downloads the zip from the signed URL directly from the R2 storage bucket.

TODO: 
- Integrate R2 into the project
- Migrate the storage to push to R2 bucket instead of local filesystem for original photos and thumbnails.
- Migrate the deletion logic to delete the files from the R2 bucket instead of the local filesystem.
  - Handle direct photo deletion from the R2 bucket.
  - Handle collection level deletion from the R2 bucket.
  - Handle catalogue level deletion from the R2 bucket.
- Prepare zip file generation and signed url generation logic. 
