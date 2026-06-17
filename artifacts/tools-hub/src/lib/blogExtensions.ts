import type { BlogSection } from "./blogData";

export const BLOG_EXTENSIONS: Record<string, BlogSection[]> = {

  "how-to-compress-images": [
    {
      heading: "Common mistakes that make compression worse",
      list: [
        "Compressing an already-compressed image: Re-compressing a JPEG degrades quality each time. Always compress from the original file.",
        "Using PNG for photos: PNG is lossless but 3–5× larger than JPEG for the same photo. Only use PNG when transparency is required.",
        "Over-compressing for perceived savings: Going below 65% quality rarely saves proportionally more space but causes visible blocking artifacts.",
        "Ignoring dimensions: A 5000px wide image compressed at 80% quality is still 3× larger than a correctly resized 1600px version at the same quality.",
      ],
    },
    {
      heading: "How compression works (in simple terms)",
      paragraphs: [
        "JPEG compression works by dividing an image into 8×8 pixel blocks and discarding detail that human eyes are least sensitive to — specifically high-frequency changes in colour (chroma) rather than brightness (luma). This is why JPEG handles smooth gradients well but struggles with sharp text or fine lines.",
        "WebP uses a more sophisticated algorithm that can also store multiple frames (for animation) and achieves better compression at every quality level compared to JPEG. When you use ToolsHub Image Compressor, you're running this compression entirely in your browser using the Canvas API — your files never leave your device.",
      ],
    },
  ],

  "convert-images-between-formats": [
    {
      heading: "Format comparison: when to use what",
      list: [
        "JPEG: Best for photographs and complex images with many colors. Lossy compression, no transparency support. Universal compatibility.",
        "PNG: Best for screenshots, graphics with text, logos, and anything needing transparency. Lossless but large file sizes.",
        "WebP: Best for web publishing. Supports both lossy and lossless modes, supports transparency, 25–35% smaller than equivalent JPEG.",
        "GIF: Only useful for simple animations. Supports only 256 colors — terrible for photos. Use WebP or APNG instead.",
        "HEIC: Apple's format for iPhone photos. High compression and quality, but poor compatibility outside Apple ecosystems. Convert to JPEG or WebP before sharing.",
      ],
    },
    {
      heading: "Batch conversion workflow for websites",
      paragraphs: [
        "If you're migrating a website's image library to WebP, ToolsHub Image Converter handles bulk conversion in one pass. Drop all your JPEGs, click convert to WebP, and download the ZIP. File names are preserved — photo.jpg becomes photo.webp — so you can swap files without changing any HTML references if your server handles routing.",
        "For teams, this eliminates the need for command-line tools like ImageMagick or FFmpeg for basic format conversion. The browser-based approach means anyone on the team can run conversions without installing software.",
      ],
    },
  ],

  "resize-images-online-free": [
    {
      heading: "Resizing vs. cropping — what's the difference?",
      paragraphs: [
        "Resizing changes the overall dimensions of an image while keeping all content visible. A 1000×800 image resized to 500×400 looks identical but smaller. Cropping cuts away portions of the image — a 1000×800 image cropped to 500×500 loses the left and right edges.",
        "Both operations are sometimes needed together. A social media profile photo typically needs both: resize to a square first, then crop to center the subject. ToolsHub offers both Image Resizer and Image Cropper as separate tools so you can combine them precisely.",
      ],
    },
    {
      heading: "Social media presets reference",
      list: [
        "Instagram square post: 1080×1080px",
        "Instagram portrait (max reach): 1080×1350px",
        "Instagram Stories / Reels: 1080×1920px",
        "X (Twitter) post image: 1200×675px",
        "LinkedIn post image: 1200×627px",
        "YouTube thumbnail: 1280×720px",
        "Facebook cover photo: 851×315px",
        "WhatsApp profile: 500×500px (minimum)",
      ],
    },
    {
      heading: "Aspect ratio lock — why it matters",
      paragraphs: [
        "Resizing without locking the aspect ratio produces stretched, distorted images. ToolsHub Image Resizer keeps aspect ratio locked by default — when you change the width, the height adjusts automatically to maintain proportions. You can unlock it if you need to force a specific dimension (for example, fitting an image to a fixed container regardless of distortion), but for most use cases, keep it locked.",
      ],
    },
  ],

  "how-to-crop-images-free": [
    {
      heading: "Aspect ratios explained",
      list: [
        "1:1 (square): Instagram posts, profile photos, product thumbnails",
        "4:3: Traditional photography, presentations, tablet screens",
        "16:9: YouTube thumbnails, widescreen displays, blog hero images",
        "4:5: Instagram portrait posts — highest reach on the platform",
        "9:16: Stories and Reels format (vertical video/image)",
        "Free-form: When you need exact pixel dimensions without a fixed ratio",
      ],
    },
    {
      heading: "Cropping for better composition",
      paragraphs: [
        "Cropping isn't just about dimensions — it's one of the most powerful composition tools available. The rule of thirds suggests placing the main subject off-centre (at one of four intersection points of a 3×3 grid), which creates more dynamic and visually interesting images than centred compositions.",
        "When cropping portraits, standard practice is to crop below a joint (shoulder, waist, knee) rather than at one. Cropping at a joint creates an awkward visual cutoff. Similarly, avoid cropping the top of a person's head — give slightly more headroom than feels natural.",
        "ToolsHub Image Cropper lets you drag the crop handle freely, or snap to preset ratios with one click. The live preview updates instantly so you can see exactly what the final image will look like before downloading.",
      ],
    },
  ],

  "extract-color-palette-from-image": [
    {
      heading: "How to use extracted colors in your design",
      paragraphs: [
        "Once you have HEX, RGB, or HSL values from an image, you can paste them directly into any design tool — Figma, Canva, CSS, or a design system. HEX codes work everywhere and are the most universally supported format. HSL is most useful in CSS where you need to programmatically adjust lightness or saturation.",
        "A typical workflow: extract 5–8 dominant colors from a brand image or photo, identify a primary (most prominent), secondary (complementary), and accent color, then use the lighter and darker variants of these for backgrounds, borders, and hover states.",
      ],
    },
    {
      heading: "Building brand palettes from product photography",
      list: [
        "Upload your hero product photo to ToolsHub Color Palette Generator.",
        "Extract the 5–8 dominant colors. These will include the product's primary colors, background tones, and accent shades.",
        "Identify the most saturated color as your primary brand color.",
        "Use neutral extracted tones (greys, off-whites) for backgrounds and text.",
        "Check contrast ratios: text color on background must meet WCAG AA (4.5:1 ratio) for accessibility.",
        "Test the palette across your website, social media, and print — colors render differently across media.",
      ],
    },
    {
      heading: "When colors look different across devices",
      paragraphs: [
        "The same HEX code can look noticeably different on a calibrated designer monitor versus a phone screen or a budget laptop. This is due to differences in color profile (sRGB vs Display P3), brightness calibration, and panel technology. For web work, designing in sRGB covers the majority of screens correctly. For print, always request CMYK proofs — RGB colors can't all be reproduced in print.",
      ],
    },
  ],

  "convert-heic-to-jpg-guide": [
    {
      heading: "Why HEIC exists and why it causes problems",
      paragraphs: [
        "Apple introduced HEIC (High Efficiency Image Container) with iOS 11 in 2017 to reduce the storage footprint of iPhone photos. HEIC achieves roughly half the file size of JPEG at the same perceived quality — a significant advantage when your camera roll has thousands of photos.",
        "The problem is that HEIC is not a universal standard. Windows requires a paid codec from the Microsoft Store to open HEIC files natively (or Windows 11 with the right update). Most web platforms don't accept HEIC for uploads. Android doesn't support HEIC natively. This compatibility gap means iPhone users routinely need to convert before sharing outside the Apple ecosystem.",
      ],
    },
    {
      heading: "How to stop iPhone from shooting HEIC in the first place",
      list: [
        "Open Settings on your iPhone.",
        "Go to Camera → Formats.",
        "Select 'Most Compatible' instead of 'High Efficiency'.",
        "Your camera will now shoot JPEG by default — larger files, but universally compatible.",
        "Note: This doesn't convert your existing HEIC library — use ToolsHub for those.",
      ],
    },
    {
      heading: "HEIC vs JPEG vs WebP — which to convert to?",
      paragraphs: [
        "For most purposes, convert to JPEG — it's universally supported on every platform, device, and browser. JPEG at 85% quality from a HEIC source retains excellent detail.",
        "If you're preparing images for a website or app, convert to WebP instead — it's 30% smaller than JPEG at the same quality and supported by all modern browsers. ToolsHub HEIC Converter supports JPEG, PNG, and WebP output formats.",
      ],
    },
  ],

  "remove-background-from-image-free": [
    {
      heading: "What AI background removal actually does",
      paragraphs: [
        "Traditional background removal required manual selection — the Magic Wand tool in Photoshop, pen tool paths, or color-range selection. All of these require skill and take significant time, especially around hair, fur, or complex edges.",
        "AI background removal uses a neural network trained on millions of image-subject pairs to predict, pixel by pixel, which parts of an image are 'foreground' (the subject) and which are 'background'. ToolsHub uses the @imgly/background-removal library, which runs an ONNX model directly in your browser. The model generates an alpha mask — a grayscale image where white = keep, black = remove — and applies it to your original photo to produce a transparent PNG.",
      ],
    },
    {
      heading: "Best use cases for background removal",
      list: [
        "Product photography: Remove messy backgrounds and place products on white or branded backgrounds for e-commerce listings.",
        "Profile photos: Remove cluttered office or home backgrounds before professional headshots.",
        "Presentations: Cut subjects out of photos to overlay on slide backgrounds.",
        "Social media: Create composites — person in front of a different location or styled background.",
        "Documents: Extract signatures or logos from scanned images.",
      ],
    },
    {
      heading: "Tips for the cleanest results",
      list: [
        "Use high-contrast images: The AI performs best when the subject is clearly lit against a distinguishable background.",
        "Avoid busy backgrounds that share colors with the subject (e.g. a person wearing green in front of a garden).",
        "For hair detail: Start with the highest resolution image you have — the AI needs pixel density to resolve fine strands.",
        "After removal, download as PNG (not JPEG) to preserve the transparent background.",
      ],
    },
  ],

  "upscale-images-ai-free": [
    {
      heading: "Traditional vs AI upscaling",
      paragraphs: [
        "Traditional upscaling algorithms (bilinear, bicubic, Lanczos) work by interpolating new pixels between existing ones. They can smooth jagged edges but fundamentally cannot add detail that wasn't in the original — the result is a larger but blurry image.",
        "AI upscaling uses a super-resolution neural network trained on pairs of high-resolution and artificially downscaled images. The model learns to reverse the downscaling — predicting what detail 'should' be present based on patterns it learned from millions of images. The result is sharper, more detailed, and more realistic than any traditional algorithm.",
      ],
    },
    {
      heading: "When AI upscaling is most effective",
      list: [
        "Old photos scanned at low DPI — AI restores missing texture and sharpness",
        "Small product images from supplier databases that need to be displayed larger",
        "Screenshots at low resolution that need printing or large display",
        "Thumbnail images where you've lost the original high-res file",
        "Faces and portraits — AI is particularly good at restoring facial detail",
      ],
    },
    {
      heading: "When upscaling won't help",
      paragraphs: [
        "AI upscaling can't recover information that was never there. A severely compressed JPEG with blocking artifacts will upscale with the artifacts still visible. A photo taken in very low light with motion blur will remain blurry after upscaling — the AI can sharpen edges but can't correct motion or focus blur.",
        "If your source image is already over 2000px on its longest side, upscaling likely won't add meaningful detail — you're already past the resolution limit of the original content.",
      ],
    },
  ],

  "colorize-black-and-white-photos": [
    {
      heading: "How AI colorization works",
      paragraphs: [
        "AI photo colorization is a computer vision task where a model trained on color photographs learns the statistical relationships between image textures, edges, and likely colors. Sky tends to be blue. Grass tends to be green. Human skin falls within a predictable range. The model applies these learned associations to the grayscale input.",
        "This means AI colorization produces plausible colors, not necessarily historically accurate ones. The AI doesn't know what color a specific person's coat was in 1920 — it makes an educated guess based on the garment's texture and context. For most casual and artistic uses, this is entirely acceptable.",
      ],
    },
    {
      heading: "Best photos for AI colorization",
      list: [
        "Portraits with clear facial features — the AI handles skin tones reliably",
        "Outdoor scenes with identifiable elements (sky, vegetation, water)",
        "Photos with good contrast and detail — the model needs clear information to work from",
        "Mid-century photos from the 1930s–1970s where color context can be inferred from style",
      ],
    },
    {
      heading: "Limitations to expect",
      paragraphs: [
        "Colorization struggles with: clothing of unusual or period-specific colors, multi-colored objects where color isn't deducible from shape, and images with very high contrast or overexposed areas. Interior scenes can also be challenging because artificial lighting and wall colors are highly variable.",
        "Consider AI colorization a creative interpretation rather than a historical record. For archival or documentary work, manually corrected colorization by a specialist is more appropriate.",
      ],
    },
  ],

  "remove-watermark-from-image": [
    {
      heading: "Technical approaches to watermark removal",
      paragraphs: [
        "The tool uses AI inpainting — a technique where a neural network fills in the region covered by the watermark by predicting what the underlying image content would look like, based on surrounding pixels and learned patterns. It's the same technology used in Photoshop's Content-Aware Fill, but running entirely in your browser.",
        "Results vary significantly based on the watermark type. Fully opaque logos are harder to remove than semi-transparent overlays because there's no underlying pixel information to work from. Text watermarks in corner positions are usually the easiest to remove cleanly.",
      ],
    },
    {
      heading: "Legal and ethical considerations",
      paragraphs: [
        "This tool is intended for removing watermarks from images you own or have the right to modify — test watermarks from design tools, draft overlays added by your own workflow, camera timestamps, or promotional watermarks on your own content.",
        "Removing watermarks from stock photos, news photographs, or any copyrighted image you don't own is a violation of copyright law in most jurisdictions, regardless of the technical capability to do so. The tool is a technical capability — its legal use is the user's responsibility.",
      ],
    },
    {
      heading: "Alternative: preventing watermarks from appearing",
      list: [
        "Export directly from your editing software without the watermark layer",
        "Use your camera's settings to disable automatic timestamp embedding",
        "For draft review watermarks: export a clean version for the final delivery",
        "For stock photo test watermarks: purchase the license before using in final materials",
      ],
    },
  ],

  "blur-faces-in-photos-privacy": [
    {
      heading: "Legal context for face blurring",
      paragraphs: [
        "In many jurisdictions, publishing identifiable photos of individuals in public spaces requires either their consent or a legitimate public interest justification. In the EU, GDPR applies to images of identifiable people — a face is personal data. In the US, right-of-publicity and privacy laws vary by state. In practice, news photography and documentary work often operate under editorial justification, but social media and personal publishing have different standards.",
        "Face blurring provides a practical, technology-based approach to respecting privacy even when legal requirements are unclear. For event photos, crowd shots, or protest documentation, blurring unintended bystanders is broadly considered best practice.",
      ],
    },
    {
      heading: "When face detection may miss or misfire",
      list: [
        "Profile views or turned faces: The model is trained primarily on frontal faces and may miss side profiles",
        "Partially obscured faces: Faces behind glasses, masks, or hair may not be detected reliably",
        "Small faces in crowd photos: Very small faces at distance may fall below the detection threshold",
        "Unusual angles or extreme lighting: Strong backlighting or very high contrast can reduce detection accuracy",
      ],
    },
    {
      heading: "Manual verification after processing",
      paragraphs: [
        "Always review the output at full zoom before publishing. AI face detection is reliable for clear, frontal faces but may miss edge cases. For sensitive contexts — journalism, legal documentation, humanitarian work — manually verify that every visible face has been addressed. ToolsHub's blurring is irreversible on the downloaded file, so keep the original if you may need to revisit.",
      ],
    },
  ],

  "remove-exif-metadata-from-photos": [
    {
      heading: "What EXIF data looks like in practice",
      paragraphs: [
        "Open any JPEG taken on a smartphone in a tool that reads EXIF data (Windows Explorer → Properties → Details, or Mac Preview → Tools → Show Inspector). You'll typically see: GPS latitude and longitude accurate to 5–6 decimal places (within 10 metres), the exact date and time of the shot, your phone model and OS version, camera settings (focal length, ISO, exposure time), and in some cases the name stored in your device's user account.",
        "This data is embedded inside the image file itself — not in a separate sidecar file. Viewing the JPEG in a browser or image viewer shows only the image; the metadata is invisible unless you specifically look for it. But anyone who downloads the file can access it with free tools.",
      ],
    },
    {
      heading: "Platforms that strip EXIF automatically",
      list: [
        "Facebook, Instagram: Strip GPS and most EXIF on upload (but not always immediately after posting)",
        "Twitter / X: Strips EXIF on upload",
        "Google Photos: Preserves EXIF in the stored copy but strips GPS from publicly shared links",
        "WhatsApp: Preserves EXIF when sending 'as document'; strips when sending as a regular photo (with compression)",
        "Email attachments: Preserves EXIF — the original file is sent unmodified",
        "Dropbox, Google Drive shared links: Preserves EXIF in the stored file",
      ],
    },
    {
      heading: "Strip EXIF as a default habit",
      paragraphs: [
        "Rather than trying to remember which platforms strip EXIF and which don't, the safer habit is to strip before sharing — especially for photos taken at home, at regular locations, or containing identifiable routines. ToolsHub EXIF Stripper processes batches of photos in seconds, so there's no meaningful friction to building this into your sharing workflow.",
      ],
    },
  ],

  "how-to-pick-colors-from-images": [
    {
      heading: "Color formats explained",
      paragraphs: [
        "HEX (#FF5733) is a six-character code representing RGB values in base-16. It's the most common format in web design and works in all CSS, HTML, and design tools. RGB (255, 87, 51) expresses the same color as three separate decimal values for red, green, and blue. HSL (hue, saturation, lightness) is often more intuitive for adjustments — to make a color lighter, increase the L value; to desaturate it, decrease S.",
        "When picking colors for accessibility, HSL is particularly useful because you can lock the hue and adjust lightness to meet contrast requirements. WCAG AA requires a 4.5:1 contrast ratio between text and background for normal text, 3:1 for large text.",
      ],
    },
    {
      heading: "Practical color picking workflow",
      numberedList: [
        "Upload any image containing the color you want to extract.",
        "Hover or click the target color area — the tool reports the HEX, RGB, and HSL values.",
        "Copy the HEX code for immediate use in CSS or design tools.",
        "If you need to lighten or darken it, use the HSL values as a starting point and adjust L (lightness).",
        "Test contrast: paste your foreground and background colors into a contrast checker to verify accessibility compliance.",
      ],
    },
    {
      heading: "Color harmony — building on a picked color",
      list: [
        "Complementary: The opposite hue on the color wheel (hue + 180°) — high contrast, bold pairings",
        "Analogous: Adjacent hues (±30°) — cohesive, easy on the eye",
        "Triadic: Three evenly spaced hues (hue ±120°) — vibrant but balanced",
        "Monochromatic: Same hue at different saturation and lightness levels — clean, professional",
      ],
    },
  ],

  "pdf-tools-compress-merge-split": [
    {
      heading: "When to use each PDF tool",
      list: [
        "Compress: Before emailing a PDF — most email systems have 10–25 MB attachment limits. Also before uploading to portals with file size restrictions.",
        "Merge: Combining invoice + delivery note + terms into a single client document. Assembling a multi-chapter report from separately authored sections.",
        "Split: Extracting a single chapter from a textbook. Separating individual pages from a scanned multi-page document for different recipients.",
        "Protect: Adding password protection before sharing sensitive documents — financial statements, contracts, personal records.",
        "Watermark: Adding 'DRAFT' or 'CONFIDENTIAL' overlays to documents in review. Adding a logo to client-facing reports.",
        "Convert: Turning a scanned image PDF into a searchable text document. Converting web page prints to cleaner PDFs.",
      ],
    },
    {
      heading: "Why browser-based PDF processing matters",
      paragraphs: [
        "PDF documents routinely contain sensitive information — contracts with personal details, financial statements, medical records, legal documents. Uploading these to a server-based PDF tool means that data passes through a third party's infrastructure. Even with HTTPS and deletion promises, this represents a privacy risk for genuinely sensitive content.",
        "ToolsHub PDF tools use pdf-lib and PDF.js, both running in your browser via WebAssembly. Your PDF never leaves your device. For professionals handling confidential documents, this is the correct approach.",
      ],
    },
    {
      heading: "PDF compression — what actually shrinks file size",
      paragraphs: [
        "Most PDF file size comes from embedded images. A 10 MB PDF is usually a 10 MB set of scanned images wrapped in a PDF container. PDF compression resamples and recompresses those embedded images to reduce the total file size. Text-heavy PDFs (typeset, not scanned) are already highly compressed and shrink by much less.",
      ],
    },
  ],

  "sign-pdf-free-online": [
    {
      heading: "E-signature legality — which countries recognize it",
      paragraphs: [
        "Electronic signatures are legally recognized in the US (ESIGN Act, 2000), European Union (eIDAS Regulation), United Kingdom (Electronic Communications Act 2000), India (IT Act 2000), Australia (Electronic Transactions Act), Canada (PIPEDA and provincial legislation), and most of the Asia-Pacific region. The core requirement in all of these is that the signature represents the signer's intent to be bound by the document.",
        "There are exceptions: certain testamentary documents (wills), real estate deeds in some jurisdictions, and court affidavits may require wet signatures or notarization. Check local requirements for high-stakes documents before using any e-signature.",
      ],
    },
    {
      heading: "Three signing methods compared",
      list: [
        "Draw: Most natural-looking. Use a mouse, trackpad, or stylus. Works particularly well on touchscreens with a finger. The result resembles a handwritten signature.",
        "Type: Clean and professional. Choose from handwriting-style fonts. Fastest method — appropriate for internal approvals, confirmations, and low-formality documents.",
        "Upload image: Use a photo or scan of your physical signature. Most consistent with your existing official documents. Recommended when you need to match signatures across physical and digital records.",
      ],
    },
    {
      heading: "Retaining a record of signed documents",
      paragraphs: [
        "Unlike DocuSign or Adobe Sign, ToolsHub does not create an audit trail or send confirmation emails. For most personal and small business use, the signed PDF itself is sufficient evidence. If you need a formal audit trail (for compliance, legal disputes, or regulated industries), a dedicated e-signature platform is more appropriate.",
        "Best practice: store the signed PDF in a named folder with the date, keep a copy of the original unsigned document, and if both parties are signing electronically, have the other party sign and send back a copy.",
      ],
    },
  ],

  "annotate-pdf-free-online": [
    {
      heading: "What annotations are supported",
      list: [
        "Text highlights in multiple colors — mark key passages for review",
        "Freehand drawing — underline, circle, or bracket content",
        "Text boxes — add comments, corrections, or review notes",
        "Sticky note-style callouts — attach feedback to specific locations",
        "Stamps — DRAFT, APPROVED, CONFIDENTIAL overlays",
        "Signatures — embed a drawn or typed signature directly in the annotated PDF",
      ],
    },
    {
      heading: "Annotation for document review workflows",
      paragraphs: [
        "ToolsHub PDF Annotator is well-suited for individual review — reading through a contract and marking sections that need revision, or providing feedback on a design brief. The annotations are embedded in the downloaded PDF, so they're visible to anyone who opens the file in any PDF reader.",
        "For collaborative review where multiple people need to comment on the same document simultaneously, a cloud-based tool with real-time sync is more appropriate. ToolsHub is a single-user, privacy-first tool — the document never leaves your browser.",
      ],
    },
    {
      heading: "Preparing annotated PDFs for meetings",
      numberedList: [
        "Download the PDF document you need to review.",
        "Open it in ToolsHub PDF Annotator — it loads directly in your browser.",
        "Read through and add highlights, callouts, and corrections as you go.",
        "Download the annotated version. It's a standard PDF — open in any reader.",
        "Share the annotated PDF via email or your collaboration tool before the meeting.",
        "The recipient sees all annotations without needing any special software.",
      ],
    },
  ],

  "extract-text-from-images-ocr": [
    {
      heading: "How OCR (Optical Character Recognition) works",
      paragraphs: [
        "OCR works in two stages: first, the engine analyzes the image to detect regions that contain text (character segmentation); second, it classifies each character using a trained model. Modern OCR engines like Tesseract (which ToolsHub uses via Tesseract.js) are trained on millions of character samples across fonts, sizes, and styles.",
        "Tesseract.js runs the full Tesseract OCR engine compiled to WebAssembly — one of the more computationally intensive browser-based tasks. On most modern devices, page-level OCR takes 3–8 seconds. The accuracy is comparable to Google Docs' built-in OCR for printed text in good conditions.",
      ],
    },
    {
      heading: "What affects OCR accuracy",
      list: [
        "Image resolution: 300 DPI minimum for reliable results. Below 150 DPI, character recognition degrades significantly.",
        "Font clarity: Clean, standard fonts work best. Decorative, cursive, or heavily stylized fonts are harder to recognize.",
        "Image quality: Blurry, skewed, or low-contrast images produce errors. Straighten skewed scans before running OCR.",
        "Background complexity: Text on plain white or light backgrounds extracts cleanly. Patterned or textured backgrounds interfere.",
        "Language: ToolsHub OCR supports 8 languages including English, Hindi, French, German, Spanish, Portuguese, Italian, and Arabic.",
      ],
    },
    {
      heading: "Editing extracted text",
      paragraphs: [
        "OCR output is plain text — copy it directly into a word processor, email, or note-taking app. For best results, do a quick review pass for recognition errors — common mistakes include '0' vs 'O', '1' vs 'l', and punctuation at line breaks. Most text editors' find-and-replace handles these corrections quickly.",
      ],
    },
  ],

  "generate-strong-passwords-online": [
    {
      heading: "What makes a password cryptographically secure",
      paragraphs: [
        "ToolsHub Password Generator uses the browser's Web Crypto API — specifically `window.crypto.getRandomValues()` — to generate random bytes. This is the same randomness source used by your operating system for cryptographic operations. It is fundamentally different from `Math.random()`, which is a pseudo-random number generator not suitable for security-sensitive use.",
        "A 16-character password using uppercase, lowercase, digits, and symbols has approximately 2^94 possible combinations. At a rate of 100 billion guesses per second (a modern GPU cluster), exhaustive brute-force would take longer than the age of the universe. In practice, passwords are compromised through database breaches and phishing, not brute force — which is why password uniqueness (never reusing) matters more than length beyond 14 characters.",
      ],
    },
    {
      heading: "Password manager integration",
      paragraphs: [
        "Generating strong passwords is only useful if you don't have to remember them — which means using a password manager. Bitwarden (free, open-source), 1Password, and Dashlane are well-regarded options. Generate a password in ToolsHub, copy it, and paste it directly into your password manager as you set up a new account. Never store passwords in browser autofill for banking or email accounts.",
      ],
    },
    {
      heading: "Passphrase vs password",
      list: [
        "Password (e.g. 'X!7kP#2mLq9R'): Short but random — high entropy per character. Hard to type, impossible to remember.",
        "Passphrase (e.g. 'correct-horse-battery-staple'): Long chain of random words — high entropy from length. More typeable, possible to remember if needed.",
        "Use passwords for accounts you access from a password manager (where you paste, not type). Use passphrases for things you must type — device login PIN, password manager master password.",
      ],
    },
  ],

  "create-qr-codes-free": [
    {
      heading: "QR code types and when to use each",
      list: [
        "URL: The most common type. Encodes a web address — tap to open in a browser. Use for menus, business cards, product pages.",
        "Plain text: Any text content — instructions, codes, serial numbers.",
        "WiFi: Encodes network name, password, and security type. Guests scan to connect automatically — no password typing required.",
        "Contact (vCard): Encodes name, phone, email, and organization. Scanning adds directly to the phone's contacts.",
        "Email: Pre-fills recipient, subject, and body of an email when scanned.",
        "SMS: Pre-fills a phone number and message text.",
      ],
    },
    {
      heading: "QR code technical considerations",
      paragraphs: [
        "QR codes have built-in error correction — they can still scan correctly even if up to 30% of the code is obscured (for example, by a logo placed in the center). The four error correction levels are L (7%), M (15%), Q (25%), and H (30%). Higher correction = larger code. For most use cases, M (medium) provides a good balance of size and redundancy.",
        "The amount of data encoded affects the code's density. A short URL produces a sparse, easily-scannable code. A full vCard with multiple contact fields produces a denser code that requires a more controlled scanning environment. For print at small sizes, keep the encoded data short.",
      ],
    },
    {
      heading: "Print sizing guidelines",
      list: [
        "Business card (1×1 cm): Works for short URLs but push to 1.5×1.5 cm for reliability",
        "A4 poster: 5×5 cm minimum — scales up freely",
        "Outdoor signage: 10×10 cm at minimum; scale with viewing distance (roughly 1cm per 10cm reading distance)",
        "Always test: print at target size and scan from the intended distance before mass printing",
      ],
    },
  ],

  "create-whatsapp-link-generator": [
    {
      heading: "How WhatsApp click-to-chat links work",
      paragraphs: [
        "WhatsApp click-to-chat links use the `wa.me` or `api.whatsapp.com/send` URL scheme. The format is: `https://wa.me/{phone_number}?text={encoded_message}`. The phone number must be in international format without spaces, dashes, or plus signs — for example, +44 7700 900123 becomes `447700900123`. The message text is URL-encoded (spaces become %20, line breaks become %0A).",
        "ToolsHub generates this URL automatically and provides both a direct link and a scannable QR code. The QR code is useful for embedding in print materials — business cards, flyers, packaging — where a clickable link isn't possible.",
      ],
    },
    {
      heading: "Using WhatsApp links in business",
      list: [
        "Website chat button: Add the link as a floating button or in the contact section — lower friction than a contact form.",
        "Email signature: Include 'WhatsApp me' as a link in your professional email signature.",
        "Social media bio: Instagram and TikTok bios support the wa.me URL — direct traffic to WhatsApp for conversions.",
        "Physical materials: QR code on business cards, menus, packaging — customers scan to start a conversation instantly.",
        "Pre-filled support messages: Set the default text to something like 'Hi, I need help with my order #' — customers just add their order number.",
      ],
    },
    {
      heading: "WhatsApp Business vs personal",
      paragraphs: [
        "For customer-facing use, WhatsApp Business (free) is more appropriate than a personal number. It supports auto-replies, business hours messages, product catalogs, and a verified business profile. The click-to-chat link works identically for both personal and Business accounts.",
      ],
    },
  ],

  "convert-video-to-gif-free": [
    {
      heading: "GIF technical limitations you should know",
      paragraphs: [
        "GIF is a format from 1987. It supports only 256 colors per frame, which is why GIFs have that characteristic posterized, slightly grainy look. For video content with rich color gradients, GIF compression introduces visible dithering — a pattern of dots used to simulate colors beyond the 256-color palette.",
        "GIF files are large for their quality. A 5-second 480px GIF can easily exceed 10 MB. This is why for actual video embedding in modern web contexts, WebM or MP4 with `autoplay muted loop` attributes are far more efficient. GIF survives primarily because of universal platform support — it plays automatically everywhere without interaction.",
      ],
    },
    {
      heading: "Optimizing GIFs for size",
      list: [
        "Reduce dimensions: A 320px wide GIF is typically 4–5× smaller than the same at 640px.",
        "Reduce frame rate: 10–15 fps is usually sufficient — human eyes don't notice the reduction.",
        "Trim the clip: Only include the essential motion — a 3-second GIF is dramatically smaller than a 10-second one.",
        "Reduce color palette: For simple animations or screen recordings, limiting to 64 or 128 colors can halve file size with minimal visible impact.",
        "Crop to content: If your video has large static borders, crop them out — they contribute to GIF size.",
      ],
    },
    {
      heading: "Best use cases for GIF vs video",
      list: [
        "Use GIF: Product demos for email (video embeds are blocked by most email clients), platform comments/chats where video isn't supported, simple looping illustrations",
        "Use MP4/WebM: Website hero animations, social media posts, anywhere you control the embed code",
      ],
    },
  ],

  "pomodoro-technique-timer-online": [
    {
      heading: "The science behind the Pomodoro Technique",
      paragraphs: [
        "The technique was developed by Francesco Cirillo in the late 1980s, named after the tomato-shaped kitchen timer he used as a student. The core principle is based on time-boxing — working in fixed, focused intervals with regular breaks. Research on attention and cognitive fatigue consistently shows that sustained focus degrades significantly after 25–45 minutes without a break.",
        "Regular short breaks (5 minutes every 25 minutes) prevent the accumulation of cognitive load — the mental overhead of tracking what you've done, what you need to do, and managing distractions. The act of stopping at a defined time also creates a psychological endpoint that makes starting easier.",
      ],
    },
    {
      heading: "Adapting the technique to your work style",
      list: [
        "Standard: 25 minutes work / 5 minute break (Cirillo's original)",
        "Extended focus: 50 minutes work / 10 minute break (for deep technical work where flow state takes longer to enter)",
        "Short burst: 15 minutes work / 3 minute break (for ADHD, high-interruption environments, or low-energy periods)",
        "After 4 Pomodoros: Take a long break of 15–30 minutes before starting the next set",
      ],
    },
    {
      heading: "What to do during break time",
      paragraphs: [
        "The break's purpose is cognitive rest, not switching to a different screen-based task. Stand up, stretch, look at something distant (gives your eye muscles a break), make a drink, or step outside briefly. Scrolling social media during a Pomodoro break typically doesn't provide meaningful cognitive rest — it continues the same kind of fragmented attention processing.",
        "ToolsHub Pomodoro Timer plays an audio notification at the end of each interval, so you don't have to monitor the screen. Set it up and focus — the timer handles the structure.",
      ],
    },
  ],

  "unit-converter-online-free": [
    {
      heading: "The most common conversion mistakes",
      list: [
        "Miles vs kilometres: 1 mile = 1.609 km. A common error: a '5K' race is 5 kilometres, not 5 miles — 5 km ≈ 3.1 miles.",
        "Celsius vs Fahrenheit: The formula is °F = (°C × 9/5) + 32. Room temperature (20°C) is 68°F; body temperature (37°C) is 98.6°F.",
        "Kilograms vs pounds: 1 kg ≈ 2.205 lbs. A 70 kg person weighs about 154 lbs.",
        "Litres vs gallons: US gallon (3.785 L) ≠ UK imperial gallon (4.546 L) — always specify which system.",
        "MB vs MiB: 1 MB (megabyte) = 1,000,000 bytes; 1 MiB (mebibyte) = 1,048,576 bytes. Storage manufacturers use MB; operating systems often report in MiB, causing apparent discrepancies.",
      ],
    },
    {
      heading: "Why different countries use different units",
      paragraphs: [
        "Most of the world uses the metric system (SI units). The US, Myanmar, and Liberia are the only countries that have not officially adopted metric as the primary system — though the US uses metric extensively in science, medicine, and industry. The UK is a hybrid: metric for most official purposes, but miles for road distances and pints for draught beer.",
        "The cost of this inconsistency is real: NASA's Mars Climate Orbiter was lost in 1999 because one team used imperial units and another used metric, causing a navigation error that sent the spacecraft into the Martian atmosphere.",
      ],
    },
    {
      heading: "Categories covered by ToolsHub Unit Converter",
      list: [
        "Length, area, volume, weight/mass",
        "Temperature (Celsius, Fahrenheit, Kelvin)",
        "Speed (km/h, mph, m/s, knots)",
        "Digital storage (bits, bytes, KB, MB, GB, TB, and binary equivalents)",
        "Time (seconds, minutes, hours, days, weeks, months, years)",
        "Pressure, energy, power, and more",
      ],
    },
  ],

  "clean-format-text-online": [
    {
      heading: "Where messy text comes from",
      paragraphs: [
        "The three most common sources of badly formatted text: PDF exports (which break words across lines at arbitrary points, add page headers into body text, and lose paragraph structure), email copy-paste (which brings HTML formatting — bold, italic, font changes — into plain text editors as visible tags), and web scraping or CMS copy-paste (which includes hidden Unicode spaces, non-breaking spaces, and formatting characters that look identical to regular spaces but behave differently in word counts and string operations).",
        "Each of these produces a distinct type of mess that requires a different cleaning operation. ToolsHub Text Cleaner handles all of them: normalize whitespace, strip HTML tags, fix line breaks, convert smart quotes to straight quotes, remove duplicate lines, and trim leading/trailing whitespace.",
      ],
    },
    {
      heading: "Common cleaning operations and when to use them",
      list: [
        "Remove extra spaces: Collapses multiple consecutive spaces into one — essential after PDF copy-paste",
        "Fix line breaks: Removes single line breaks (which occur mid-sentence in PDFs) but preserves paragraph breaks",
        "Strip HTML: Converts <b>bold</b> → bold, removes all tags — useful when pasting from web pages",
        "Normalize quotes: Converts curly/smart quotes to straight quotes — important for code or CSV data",
        "Case conversion: UPPERCASE → lowercase, or capitalize first letter of each sentence",
        "Remove duplicate lines: Deduplicates lists — useful after merging data from multiple sources",
      ],
    },
    {
      heading: "Text cleaning for AI and data workflows",
      paragraphs: [
        "Pre-processing text before feeding it to an AI model, database, or NLP pipeline requires clean, consistent formatting. Extra whitespace, mixed encodings, and HTML remnants cause tokenization errors and unexpected behavior. Run raw scraped or extracted text through a cleaner first — it's a small step that prevents large downstream problems.",
      ],
    },
  ],

  "word-counter-online-free": [
    {
      heading: "Character limits for major platforms",
      list: [
        "X (Twitter): 280 characters per tweet",
        "Instagram caption: 2,200 characters (but only 125 shown before 'more')",
        "LinkedIn post: 3,000 characters",
        "Facebook post: 63,206 characters (effectively unlimited for practical use)",
        "SMS: 160 characters per message (multipart messages split at 153 characters each)",
        "Google meta description: 155–160 characters (longer gets truncated in search results)",
        "Google title tag: 55–60 characters",
        "Email subject line: 40–50 characters for good mobile preview",
      ],
    },
    {
      heading: "Average reading and writing speeds",
      paragraphs: [
        "The average adult reads 200–250 words per minute (WPM) for general non-fiction. Technical content and academic text reduce this to 100–150 WPM. Skimming can reach 600+ WPM but with significant comprehension loss. ToolsHub Word Counter calculates reading time using 200 WPM as a baseline.",
        "Average typing speed is 40 WPM for most adults; 65–75 WPM for proficient typists; 120+ WPM for competitive typists. Voice dictation at natural speaking pace is typically 130–150 WPM — roughly 3× faster than average typing.",
      ],
    },
    {
      heading: "Word count targets by document type",
      list: [
        "Tweet / social post: 15–25 words (140–160 characters)",
        "Email (professional): 50–125 words — respect the reader's time",
        "Blog post (SEO): 1,200–2,500 words — longer posts rank better for competitive keywords",
        "News article: 400–800 words",
        "Academic essay (undergrad): 1,500–3,000 words",
        "Short story: 1,500–7,500 words",
        "Novel: 70,000–100,000 words",
      ],
    },
  ],

  "build-resume-online-free": [
    {
      heading: "What recruiters actually look at",
      paragraphs: [
        "Eye-tracking studies on recruiter behavior consistently show that initial resume screening takes 6–10 seconds. In that window, recruiters scan: name, current title, most recent employer and dates, educational institution, and one or two job titles further back. The rest is only read if those elements pass the initial filter.",
        "This means your resume's top third is its most valuable real estate. Lead with name, contact, and a 2-3 line professional summary, followed immediately by your most recent and relevant role. Don't bury key information with a lengthy Skills section before your work history.",
      ],
    },
    {
      heading: "ATS (Applicant Tracking System) optimization",
      list: [
        "Use standard section headings: 'Work Experience', 'Education', 'Skills' — ATS systems parse standard headings reliably",
        "Avoid tables, text boxes, and headers/footers — most ATS systems don't read these correctly",
        "Include keywords from the job description verbatim — ATS scores resumes partly on keyword match",
        "Use a clean, single-column layout for maximum ATS compatibility",
        "Export as PDF for human reviewers; some older ATS systems prefer DOCX — check the application instructions",
      ],
    },
    {
      heading: "Common resume mistakes",
      list: [
        "Using 'responsible for' instead of action verbs: Write 'Led a team of 5 engineers' not 'Responsible for managing engineers'",
        "Omitting numbers: 'Increased revenue' is weak; 'Increased revenue by 23% in 6 months' is strong",
        "Including a photo (in most Western markets): Adds bias risk; not expected in US, UK, Australia hiring contexts",
        "Listing references: 'References available on request' wastes space — everyone assumes this",
        "Making it more than 2 pages (unless 10+ years experience): Recruiters prefer concise",
      ],
    },
  ],

  "explore-csv-data-online-free": [
    {
      heading: "What CSV files are and why they're universal",
      paragraphs: [
        "CSV (Comma-Separated Values) is the simplest possible structured data format: one row per line, with values separated by commas. It has no formatting, no formulas, no merged cells — just data. This simplicity makes it the most portable data format in existence: every spreadsheet application (Excel, Google Sheets, Numbers), every database, and every programming language can read and write CSV.",
        "CSV files come from everywhere: exported transaction history from banks, downloaded customer lists from CRMs, data exports from e-commerce platforms, survey results, log files, and API responses. Understanding how to read and filter them without specialized software gives you a significant practical advantage.",
      ],
    },
    {
      heading: "Common CSV problems to watch for",
      list: [
        "Delimiter confusion: Some 'CSV' files use semicolons (;) or tabs instead of commas — common in European locales where commas are used as decimal separators",
        "Encoding issues: Special characters (accents, symbols) can appear corrupted if the file encoding (UTF-8 vs Latin-1) doesn't match what the viewer expects",
        "Quoted fields: Fields containing commas must be quoted: '\"Smith, John\",30' — if unquoted, the comma splits the field incorrectly",
        "Missing headers: Some CSV exports don't include a header row — you need to know what each column represents",
        "Trailing commas: Some exports add an empty column at the end of each row",
      ],
    },
    {
      heading: "Privacy-safe data exploration",
      paragraphs: [
        "Customer data, transaction records, and personal information exported to CSV are sensitive. Uploading them to an online tool that processes server-side means that data passes through a third party. ToolsHub CSV viewer processes your file entirely in the browser — nothing is uploaded. This makes it appropriate for exploring sensitive business data that you wouldn't upload to a cloud service.",
      ],
    },
  ],

  "explore-json-data-online": [
    {
      heading: "JSON syntax explained clearly",
      paragraphs: [
        "JSON (JavaScript Object Notation) has six data types: string (text in double quotes), number (integer or decimal), boolean (true or false), null, object (key-value pairs in curly braces), and array (ordered list in square brackets). A valid JSON document is either an object or an array at the top level.",
        "Common syntax errors that break JSON: single quotes instead of double quotes, trailing commas after the last item in an array or object, unescaped special characters in strings, and comments (JSON doesn't support comments — use JSONC or JSON5 if you need them).",
      ],
    },
    {
      heading: "Where JSON appears in daily work",
      list: [
        "API responses: Every REST API returns JSON — product data, user profiles, payment responses",
        "Configuration files: package.json, tsconfig.json, .eslintrc — most modern tools use JSON config",
        "Webhooks: Payment processors, CRMs, and analytics tools send event data as JSON payloads",
        "NoSQL databases: MongoDB, Firestore, DynamoDB all store documents in JSON-like format",
        "Log analysis: Structured logs from applications often use JSON for machine-parseable output",
      ],
    },
    {
      heading: "Useful JSON operations in ToolsHub viewer",
      list: [
        "Format (pretty-print): Takes minified JSON and adds indentation and line breaks for readability",
        "Validate: Confirms the JSON is syntactically valid before using it in code",
        "Tree view: Collapse and expand nested objects and arrays to navigate deep structures",
        "Path copy: Click any value to copy its full JSON path (e.g. response.data.users[0].email)",
        "Search: Find all occurrences of a key or value across a large JSON document",
      ],
    },
  ],

  "bmi-calculator-body-mass-index": [
    {
      heading: "BMI categories and what they mean",
      list: [
        "Below 18.5: Underweight — may indicate malnutrition, eating disorder, or underlying health condition",
        "18.5 – 24.9: Normal weight — associated with lowest all-cause mortality in large population studies",
        "25.0 – 29.9: Overweight — modestly elevated cardiovascular risk; may be appropriate for muscular individuals",
        "30.0 – 34.9: Obese Class I — significantly elevated risk for diabetes, cardiovascular disease, sleep apnoea",
        "35.0 – 39.9: Obese Class II — high risk; many comorbidities likely",
        "40.0 and above: Obese Class III (severe) — very high risk; surgical intervention may be considered",
      ],
    },
    {
      heading: "BMI's significant limitations",
      paragraphs: [
        "BMI was developed by Adolphe Quetelet in the 1830s as a population-level statistical tool — not as a diagnostic for individual health. It has well-documented limitations: it doesn't distinguish between fat and muscle mass (a competitive bodybuilder has a 'obese' BMI), it doesn't capture fat distribution (waist circumference is a better predictor of metabolic risk), and the same BMI has different health implications across ethnicities — Asian populations show elevated metabolic risk at lower BMIs.",
        "BMI is a screening tool, not a diagnosis. It identifies individuals who may benefit from further evaluation — it doesn't determine health status on its own. Use it as a starting point for a conversation with a healthcare provider, not as a verdict.",
      ],
    },
    {
      heading: "Complementary measurements for a fuller picture",
      list: [
        "Waist circumference: >94cm (men) or >80cm (women) indicates elevated metabolic risk regardless of BMI",
        "Waist-to-height ratio: Waist circumference ÷ height. Below 0.5 is associated with healthy metabolic function",
        "Body fat percentage: Measured via DEXA scan, bioelectrical impedance, or skinfold calipers — more precise than BMI",
      ],
    },
  ],

  "emi-calculator-loan-repayment": [
    {
      heading: "How EMI is calculated",
      paragraphs: [
        "EMI (Equated Monthly Installment) is calculated using the formula: EMI = P × r × (1+r)^n / [(1+r)^n – 1], where P is the principal loan amount, r is the monthly interest rate (annual rate ÷ 12), and n is the total number of monthly payments. This formula produces a fixed monthly payment that covers both interest and principal, structured so that early payments are mostly interest and later payments are mostly principal — this is called an amortizing loan.",
        "ToolsHub EMI Calculator computes this instantly and shows the full amortization schedule — each month's payment broken down into its interest and principal components, and the outstanding balance after each payment.",
      ],
    },
    {
      heading: "Key factors that affect your EMI",
      list: [
        "Principal: The loan amount. Borrow less by making a larger down payment.",
        "Interest rate: Even a 0.5% difference makes a significant impact over long tenures — always compare rates before accepting.",
        "Tenure: Longer tenure → lower EMI but far more total interest paid. Shorter tenure → higher EMI but much less total interest.",
        "Processing fees: Often not included in the headline rate — add them to calculate the true cost of credit.",
        "Prepayment: Most loans allow partial prepayment, which reduces the principal and shortens the remaining tenure.",
      ],
    },
    {
      heading: "Total interest paid — why this number matters",
      paragraphs: [
        "On a 20-year home loan at 8.5% interest, the total interest paid is typically 90–110% of the original loan amount — you effectively pay for the house twice. Understanding this number before signing makes the decision to make extra payments (when cash flow allows) much more compelling. Even one extra EMI per year can reduce a 20-year loan by 2–3 years.",
      ],
    },
  ],

  "base64-encode-decode-online": [
    {
      heading: "Where Base64 appears in everyday development",
      list: [
        "Data URIs: Embedding images directly in HTML or CSS — `<img src='data:image/png;base64,...'>`. Eliminates an HTTP request at the cost of larger HTML payload.",
        "HTTP Basic Authentication: The `Authorization: Basic {token}` header uses Base64 encoding of `username:password`.",
        "JSON Web Tokens (JWT): The header and payload sections of a JWT are Base64url-encoded (a variant that uses - and _ instead of + and /).",
        "Email attachments: MIME encoding uses Base64 to transfer binary attachments through text-based email protocols.",
        "API payloads: Some APIs require binary data (files, images) to be Base64-encoded for inclusion in JSON request bodies.",
      ],
    },
    {
      heading: "Base64 vs Base64url",
      paragraphs: [
        "Standard Base64 uses the characters A–Z, a–z, 0–9, +, /, and = for padding. This causes problems in URLs because + means 'space' and / is a path separator in URL encoding.",
        "Base64url (used in JWTs and many modern APIs) replaces + with - and / with _. ToolsHub handles both variants — paste a JWT payload section and it will decode it correctly regardless of which variant was used.",
      ],
    },
    {
      heading: "Security reminder",
      paragraphs: [
        "Base64 is encoding, not encryption. Anyone who receives a Base64-encoded string can decode it instantly — it provides zero security. Never Base64-encode passwords, API keys, or sensitive data in client-side code expecting it to be obscured. If you need to protect data, use actual encryption (AES-256) with a proper key management approach.",
      ],
    },
  ],

  "optimize-images-for-web-core-web-vitals": [
    {
      heading: "Core Web Vitals scores and what they measure",
      list: [
        "LCP (Largest Contentful Paint): How fast the largest visible element loads. Target: under 2.5 seconds. Usually a hero image.",
        "CLS (Cumulative Layout Shift): How much content unexpectedly moves as the page loads. Target: under 0.1. Images without declared width/height cause layout shifts when they load.",
        "FID (First Input Delay) / INP (Interaction to Next Paint): How fast the page responds to the first user interaction. Less affected by images.",
      ],
    },
    {
      heading: "Preventing layout shifts from images",
      paragraphs: [
        "Always include `width` and `height` attributes on `<img>` tags — even for responsive images. Modern browsers use these attributes to reserve space for the image before it loads, preventing content from jumping when the image arrives. Without these attributes, the browser doesn't know the image's aspect ratio and can't allocate space in advance.",
        "For responsive images, the CSS `aspect-ratio` property achieves the same effect: `img { aspect-ratio: 16/9; width: 100%; }` tells the browser to reserve a 16:9 space for every image in that selector.",
      ],
    },
    {
      heading: "Measuring your image impact",
      numberedList: [
        "Open Chrome DevTools → Lighthouse → Generate report.",
        "Check 'Opportunities' — usually includes 'Serve images in next-gen formats' and 'Properly size images'.",
        "Identify the LCP element — Chrome DevTools highlights it in the performance trace.",
        "Compress and resize that specific element first — it has the largest single impact on LCP.",
        "Re-run Lighthouse to verify the improvement before moving to other assets.",
      ],
    },
  ],

  "sign-documents-free-without-docusign": [
    {
      heading: "Evidence of intent — what makes an e-signature valid",
      paragraphs: [
        "The legal validity of an electronic signature doesn't come from the platform that created it — it comes from evidence of the signer's intent. Courts look for: evidence that the person signing knew what they were signing (clear document presentation), evidence of consent to sign electronically (often an explicit checkbox or statement), and evidence that the specific person signed (harder to prove without an audit trail).",
        "For everyday business documents — freelance contracts, service agreements, NDAs — the combination of the signed PDF and email correspondence demonstrating both parties agreed to the terms is typically sufficient evidence. For higher-stakes documents, a platform with timestamped audit trails provides stronger legal footing.",
      ],
    },
    {
      heading: "Sending a document for counter-signature",
      numberedList: [
        "Sign your portion of the document using ToolsHub E-Signature.",
        "Download the signed PDF.",
        "Email it to the counter-party with a clear instruction: 'Please sign page 3 and return by [date]'.",
        "The counter-party can sign using any e-signature tool and return it.",
        "Keep the fully executed (both-signed) version in your records.",
      ],
    },
    {
      heading: "When a notarized or witnessed signature is required",
      paragraphs: [
        "Standard e-signatures are not equivalent to notarized signatures. Documents that legally require notarization — real estate transfers in many jurisdictions, powers of attorney, sworn affidavits — require either in-person notarization or remote online notarization (RON) via a platform with identity verification capabilities. ToolsHub is not appropriate for these use cases.",
      ],
    },
  ],

  "how-to-protect-privacy-selling-online": [
    {
      heading: "The most overlooked privacy risk: your listing description",
      paragraphs: [
        "Most sellers focus on the item photos and overlook what they've written in the listing description. Mentioning 'moving to a smaller flat' reveals you may be leaving an address. 'Downsizing after my kids left for university' reveals age and life stage. 'Collect from my home in [neighbourhood name]' gives a partial address to anyone reading.",
        "Keep descriptions product-focused. The item's condition, dimensions, features, and price are what matters. Personal context adds nothing to the sale and creates unnecessary information exposure.",
      ],
    },
    {
      heading: "Safe meeting practices for in-person handover",
      list: [
        "Use a neutral public location: police station car parks, supermarket car parks, and shopping centres are commonly recommended",
        "Bring a friend if the item is valuable or the buyer is unknown",
        "Do not invite strangers to your home for first meetings",
        "For high-value items, use an escrow service or platform's protected payment",
        "Trust your instincts: if a buyer's communication pattern seems off, it's fine to cancel",
      ],
    },
    {
      heading: "Platform-specific privacy settings",
      list: [
        "Facebook Marketplace: Review your profile visibility — selling publicly means your profile photo and name are visible to buyers",
        "eBay: Use a pseudonymous username; your real name isn't required in your public profile",
        "Gumtree / Craigslist: Use the platform's anonymous reply email system rather than listing your personal email",
        "Depop / Vinted: These platforms have built-in messaging — keep communication on-platform until you've confirmed legitimacy",
      ],
    },
  ],

  "social-media-image-size-guide-2025": [
    {
      heading: "Why platforms compress images differently",
      paragraphs: [
        "Every major social platform recompresses images on upload — this is how they manage storage and delivery costs at scale. The degree of compression varies: Instagram is aggressive (especially for Story images), LinkedIn is relatively gentle, and X (Twitter) applies heavy compression to JPEG while treating PNG more carefully.",
        "Understanding platform-specific compression behavior helps you pre-optimize. For Instagram: upload at 1080px width (not larger), use JPEG at 80–85% quality, and make sure your image is in sRGB color space (not Adobe RGB). For X: use PNG for graphics with text — Twitter's JPEG compression destroys fine text rendering.",
      ],
    },
    {
      heading: "Tools for checking your image output",
      list: [
        "Squoosh (by Google): Compare compression settings side by side before downloading",
        "ToolsHub Image Resizer: Resize to exact social media dimensions with presets",
        "ToolsHub Image Compressor: Fine-tune compression with a live quality preview",
        "Figma / Canva: Design assets at the correct dimensions from the start",
      ],
    },
    {
      heading: "The one-size-fits-all approach (if you must)",
      paragraphs: [
        "If you need a single image that works across Instagram, LinkedIn, and X without platform-specific versions, use 1200×1200px square at JPEG 82% quality. Square images display correctly on all three without cropping. This isn't optimal for any single platform but is acceptable across all of them — useful when time doesn't permit individual optimization.",
      ],
    },
  ],

  "batch-convert-images-webp-jpg-png": [
    {
      heading: "Building a conversion workflow",
      paragraphs: [
        "For recurring conversion tasks — like converting every week's product photos to WebP before uploading to your website — the most efficient approach is a structured workflow: collect source files in a folder, drag the whole folder into ToolsHub Image Converter, select output format, download ZIP, extract to the upload folder. Done in under two minutes regardless of file count.",
        "Name your source files descriptively before converting — ToolsHub preserves original names with only the extension changed. `product-blue-shirt-front.jpg` becomes `product-blue-shirt-front.webp`. This consistency makes file management predictable at scale.",
      ],
    },
    {
      heading: "WebP compatibility in 2025",
      paragraphs: [
        "WebP browser support is effectively universal: Chrome (2011), Firefox (2019), Safari (2020), Edge, Opera — all support WebP. Mobile support covers iOS 14+ and all modern Android. For email clients, WebP is not well supported — Gmail displays it on web but many desktop email clients don't. For website use, WebP is the right choice. For email attachments or cross-platform sharing, JPEG remains safer.",
      ],
    },
    {
      heading: "Quality settings for different source formats",
      list: [
        "PNG (lossless) → JPEG: Use 90%+ quality to preserve detail that PNG was preserving losslessly",
        "PNG → WebP: Use 85%+ quality for the same reason — don't introduce visible loss on already-lossless sources",
        "JPEG → WebP: 80–85% WebP is visually equivalent to the original JPEG quality (WebP compresses more efficiently)",
        "JPEG → JPEG (re-compress): Avoid unless necessary — each JPEG re-compression degrades quality",
        "HEIC → JPG: 85%+ quality to retain iPhone photo detail",
      ],
    },
  ],
};
