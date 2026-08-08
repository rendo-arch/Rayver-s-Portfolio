DROP YOUR PHOTOS IN THIS FOLDER
================================

The site now auto-detects the file extension (.jpg, .jpeg, .png, or .webp all
work) — you only need to get the BASE NAME right. No renaming needed.

1) PROFILE AVATAR (top-left circle, click it to switch photo)
   - assets/profile-1.<jpg|jpeg|png|webp>   <- shows first
   - assets/profile-2.<jpg|jpeg|png|webp>   <- appears after you click
   Add more (profile-3, profile-4, ...) by adding the base name to the
   `avatarBases` array in js/script.js (search "AVATAR CROSSFADE").

2) "OUTSIDE THE CODE" PHOTO STACK (gallery-1 on top, others peeking out
   behind it — click/tap the stack to shuffle to the next photo)
   - assets/gallery-1.<jpg|jpeg|png|webp>   <- shows first
   - assets/gallery-2.<jpg|jpeg|png|webp>
   - assets/gallery-3.<jpg|jpeg|png|webp>
   - ...up to gallery-6 is auto-detected; add more slots by extending the
   `galleryBaseCandidates` array (search "OUTSIDE-THE-CODE PHOTO STACK") in
   js/script.js. Only 1 photo? It'll just show that one, no click needed.

3) CHAT WIDGET AVATAR (small circle next to "Chat with Rayver")
   - reuses assets/profile-1.* automatically.

IMPORTANT — folder structure:
   your-folder/
     index.html
     assets/
       profile-1.jpg
       profile-2.jpg
       gallery-1.jpg
       ...

The "assets" folder must sit in the SAME folder as index.html (as siblings).
If you're using VS Code Live Server, make sure Live Server is running from
the folder that CONTAINS both index.html and assets/ — not a parent or
different folder.

If a photo is genuinely missing, the site falls back to a clean placeholder
automatically — nothing breaks, it just won't show your photo yet.
