## Proposed delivery plan: 

### Proposed workflow

Example workflow: 
- Photographer creates a catalogue for a client event. 
- Photographer creates the collections and sorts the initially proofed photos into the collections.
- When the catalogue is ready, photographer sets the catalogue to public and shares the public URL with the client.

- Client receives the public URL and can view the catalogue.
- Client adds photos to their favourites and sends the favourites to the photographer. 

- Photographer receives the favourites - they populate in the favourites tab list (emails of the clients who have sent their favourites).
- Photographer can open a favourite session and see the photos in the session, along side the email of the client who sent the favourites.
- Photographer has the option to create a new Delivery Collection from the favourite session. 
- The Delivery Collection is presented in the gallery workspace as a new collection, named after the client's email.
- The photographer prepares the final version of the photos and adds them to the Delivery Collection. 
- Delivery Collection can be shared with the client via its public delivery URL. 

- Client receives the public delivery URL and can view the delivery collection.
- Client can download the photos from the delivery collection as a zip file. 

### Changes to collections module

- Extend the collection schema to include a collection type field -> enum: proofing, delivery
- A delivery collection has a foreign key to the favourite session that created it and a unique auto-generated public delivery slug.
- When uploading photos to a delivery collection, the photos are not compressed - they are uploaded as is. Thumbnail generation remains the same.

### Changes to public module

- Introduce a new public route /d/{slug} - where slug is the public delivery slug.
- If the parent catalogue is password protected, the delivery collection is also password protected - with the catalogue password.
- Delivery page is a simple page that displays the delivery recipients email address and a download link for the photos.
- Download link triggers a download of the photos as a zip file. 
- Download action is also timestamped and stored in the database. Presented to the photographer in the delivery collection details page.