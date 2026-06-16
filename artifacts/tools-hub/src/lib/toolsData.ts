export interface ToolFAQItem {
  q: string;
  a: string;
}

export interface ToolData {
  id: string;
  href: string;
  title: string;
  tagline: string;
  category: "image" | "pdf" | "generator" | "utility";
  iconBg: string;
  whatIsIt: string;
  howItWorks: string;
  isFree: string;
  isPrivate: string;
  useCases: string[];
  alternatives: string[];
  whyBrowserBased: string;
  faq: ToolFAQItem[];
  related: string[];
  features: string[];
}

export const TOOLS_DATA: ToolData[] = [
  {
    id: "image-compressor",
    href: "/image-compressor",
    title: "Image Compressor",
    tagline: "Compress JPG, PNG and WebP images instantly — no upload",
    category: "image",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    whatIsIt:
      "Image Compressor is a free browser-based tool that reduces the file size of JPG, PNG, and WebP images without visibly degrading quality. It uses efficient compression algorithms that run entirely on your device.",
    howItWorks:
      "Drop or select your image. The tool applies lossy or lossless compression algorithms directly in your browser using the Canvas API. You choose the quality level (1–100%) and download the compressed result instantly — no server involved.",
    isFree: "Yes. Image Compressor is completely free with no limits, no signup, and no watermark.",
    isPrivate:
      "Yes. Your images never leave your device. All compression happens locally in your browser using JavaScript and the HTML5 Canvas API.",
    useCases: [
      "Reduce image size before uploading to a website or CMS",
      "Compress photos before sending via email or WhatsApp",
      "Optimize product images for e-commerce stores",
      "Reduce storage space used by photos on your device",
      "Speed up web pages by serving lighter images",
      "Compress screenshots before adding to documents or presentations",
    ],
    alternatives: ["TinyPNG", "Squoosh", "Compressor.io", "ILoveIMG"],
    whyBrowserBased:
      "Unlike TinyPNG or Compressor.io, your image is never uploaded to a server. This means zero privacy risk, instant processing (no network round-trip), and it works offline after the page loads.",
    faq: [
      { q: "What image formats does the compressor support?", a: "JPG, PNG, and WebP. HEIC images must first be converted using the HEIC to JPG tool." },
      { q: "How much can I compress an image?", a: "Typically 40–85% file size reduction depending on the image content and quality setting. Photographic images compress more than flat graphics." },
      { q: "Will compression reduce image quality?", a: "Slight quality loss occurs at higher compression levels, but at 70–80% quality the difference is invisible to the human eye." },
      { q: "Is there a file size limit?", a: "No server-side limit. Very large images (50 MB+) may be slower as compression runs on your CPU." },
      { q: "Can I compress multiple images at once?", a: "Currently one image at a time. Use the Image Converter for batch operations." },
    ],
    related: ["/image-converter", "/image-resizer", "/exif-stripper", "/background-remover"],
    features: ["No upload", "Adjustable quality", "JPG/PNG/WebP", "Instant preview", "Free"],
  },
  {
    id: "image-converter",
    href: "/image-converter",
    title: "Image Converter",
    tagline: "Bulk convert images between JPG, PNG, WebP — all in your browser",
    category: "image",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    whatIsIt:
      "Image Converter is a free browser-based tool that converts images between JPG, PNG, and WebP formats in bulk. Upload multiple images, choose the target format, and download them all as a ZIP.",
    howItWorks:
      "Select multiple images and choose your target format (JPG, PNG, or WebP). The tool renders each image on an HTML5 Canvas, converts to the selected format, and packages all outputs into a ZIP file — entirely in your browser.",
    isFree: "Yes. Completely free, unlimited conversions, no signup required.",
    isPrivate: "Yes. Images are processed locally in your browser. Nothing is uploaded to any server.",
    useCases: [
      "Convert PNG screenshots to JPG to save space",
      "Convert JPG photos to WebP for faster websites",
      "Batch convert iPhone HEIC exports to JPG",
      "Convert WebP images to PNG for editing in Photoshop",
      "Convert product images to a consistent format for e-commerce",
      "Convert images for cross-browser compatibility",
    ],
    alternatives: ["CloudConvert", "ILoveIMG", "Squoosh", "GIMP"],
    whyBrowserBased:
      "CloudConvert uploads your files to their servers. ToolsHub Image Converter runs entirely in your browser — zero uploads, zero privacy risk, and instant results without internet once loaded.",
    faq: [
      { q: "What formats can I convert between?", a: "JPG, PNG, and WebP in any direction. You can also convert HEIC files using the dedicated HEIC Converter." },
      { q: "Can I convert multiple images at once?", a: "Yes. Select multiple files, convert them all, and download them in a single ZIP file." },
      { q: "Does converting JPG to PNG reduce quality?", a: "No. PNG is lossless, so converting JPG to PNG keeps the original quality (but increases file size)." },
      { q: "Does converting PNG to JPG reduce quality?", a: "Slightly. JPG is a lossy format. The tool defaults to 90% quality which is visually lossless." },
      { q: "Can I convert WebP back to JPG?", a: "Yes. Select your WebP images, choose JPG as the output, and download." },
    ],
    related: ["/image-compressor", "/image-resizer", "/heic-converter", "/image-cropper"],
    features: ["Batch convert", "ZIP download", "JPG/PNG/WebP", "No upload", "Free"],
  },
  {
    id: "image-resizer",
    href: "/image-resizer",
    title: "Image Resizer",
    tagline: "Resize images to exact dimensions — HD, Instagram, custom",
    category: "image",
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
    whatIsIt:
      "Image Resizer is a free browser-based tool to resize images to any dimension. It supports presets for HD (1920×1080), Full HD, Instagram, Twitter, and custom dimensions with aspect ratio lock.",
    howItWorks:
      "Upload your image, choose a preset or enter custom width and height. Toggle aspect ratio lock to maintain proportions. The tool resizes using Canvas API and lets you download the result instantly.",
    isFree: "Yes. Free with no limits, no signup, no watermark.",
    isPrivate: "Yes. All resizing happens in your browser. No image data is sent to any server.",
    useCases: [
      "Resize photos for social media (Instagram, Twitter, Facebook)",
      "Resize images to fit a specific web page layout",
      "Create thumbnail images for YouTube or blog posts",
      "Reduce image dimensions to lower file size",
      "Resize product images for e-commerce listings",
      "Batch resize images to a standard size for consistency",
    ],
    alternatives: ["Canva", "ILoveIMG", "ResizeImage.net", "PicResize"],
    whyBrowserBased:
      "Browser-based resizing is instant — no waiting for uploads or server processing. Your images stay on your device, completely private.",
    faq: [
      { q: "Can I resize to a specific pixel size?", a: "Yes. Enter any width and height in pixels. Use the aspect ratio lock to prevent distortion." },
      { q: "What presets are available?", a: "HD (1280×720), Full HD (1920×1080), 4K (3840×2160), Instagram square (1080×1080), Instagram story (1080×1920), Twitter post, and more." },
      { q: "Can I upscale a small image?", a: "Yes, but upscaling reduces quality. For better results use the AI Image Upscaler tool." },
      { q: "Does resizing preserve transparency?", a: "Yes for PNG output. JPG does not support transparency." },
      { q: "Can I batch resize multiple images?", a: "Yes, the tool supports batch resizing with consistent output dimensions." },
    ],
    related: ["/image-compressor", "/image-cropper", "/image-converter", "/image-upscaler"],
    features: ["Presets", "Custom dimensions", "Aspect ratio lock", "Batch resize", "No upload"],
  },
  {
    id: "image-cropper",
    href: "/image-cropper",
    title: "Image Cropper",
    tagline: "Crop images to any ratio — free, 1:1, 16:9, custom",
    category: "image",
    iconBg: "bg-gradient-to-br from-sky-500 to-indigo-600",
    whatIsIt:
      "Image Cropper is a free browser-based tool that lets you crop images to any area using a drag-and-drop interface. Supports free crop, fixed ratios (1:1, 4:3, 16:9), and custom selections.",
    howItWorks:
      "Upload an image, drag to select the crop area, and adjust using the handles. Choose a preset ratio or go freeform. Click download to get the cropped image — all processing happens in your browser.",
    isFree: "Yes. 100% free, unlimited crops, no signup.",
    isPrivate: "Yes. Images are processed locally. No uploads to any server.",
    useCases: [
      "Crop profile pictures to a perfect square (1:1)",
      "Crop images to 16:9 for YouTube thumbnails or presentations",
      "Remove unwanted borders or backgrounds from photos",
      "Crop product images to consistent sizes for online stores",
      "Prepare images for social media with the correct dimensions",
      "Extract a specific region from a screenshot",
    ],
    alternatives: ["Canva", "Photoshop", "Fotor", "PicMonkey"],
    whyBrowserBased:
      "Instant drag-and-drop cropping with no account, no waiting, and no server upload. Your images never leave your device.",
    faq: [
      { q: "What crop ratios are supported?", a: "Free crop, 1:1 (square), 4:3, 3:4, 16:9, 9:16, and custom dimensions." },
      { q: "What formats does the cropper output?", a: "PNG by default. You can choose JPG or WebP." },
      { q: "Can I crop multiple images?", a: "The cropper handles one image at a time for precise control." },
      { q: "Will cropping reduce image quality?", a: "No. Cropping only removes pixels — it does not compress or re-encode the kept area." },
    ],
    related: ["/image-resizer", "/image-compressor", "/image-converter", "/exif-stripper"],
    features: ["Drag & drop", "Fixed ratios", "Free crop", "Instant preview", "No upload"],
  },
  {
    id: "color-palette",
    href: "/color-palette",
    title: "Color Palette Extractor",
    tagline: "Extract dominant colors from any image as HEX codes",
    category: "image",
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
    whatIsIt:
      "Color Palette Extractor analyzes any image and extracts its 5–10 dominant colors as HEX, RGB, and HSL codes. Perfect for designers, brand teams, and developers.",
    howItWorks:
      "Upload an image and the tool samples thousands of pixels using a k-means clustering algorithm. It groups similar colors and returns the most dominant ones as exact color codes you can copy instantly.",
    isFree: "Yes. Completely free with no limits.",
    isPrivate: "Yes. Color analysis happens entirely in your browser — no image is uploaded.",
    useCases: [
      "Extract a brand's color palette from their logo",
      "Match colors from a photo for a design project",
      "Generate a color theme for a website from a hero image",
      "Find complementary colors for print designs",
      "Identify the dominant colors in product photography",
      "Create a color mood board from a reference image",
    ],
    alternatives: ["Coolors", "Adobe Color", "Canva Color Palette Generator", "Paletter"],
    whyBrowserBased:
      "No upload means your confidential design files and brand assets stay private. Results are instant — no waiting for server processing.",
    faq: [
      { q: "How many colors does it extract?", a: "Typically 5–10 dominant colors, configurable based on the image complexity." },
      { q: "What color formats are provided?", a: "HEX, RGB, and HSL values for each color, ready to copy with one click." },
      { q: "Does it work with logos with transparent backgrounds?", a: "Yes. Transparent areas are excluded from the analysis." },
      { q: "Can I use the extracted palette in Figma or CSS?", a: "Yes. Copy the HEX codes directly into Figma color pickers or CSS variables." },
    ],
    related: ["/color-picker", "/image-converter", "/background-remover", "/image-compressor"],
    features: ["HEX/RGB/HSL", "One-click copy", "Dominant colors", "No upload", "Free"],
  },
  {
    id: "heic-converter",
    href: "/heic-converter",
    title: "HEIC to JPG Converter",
    tagline: "Convert iPhone HEIC photos to JPG instantly — free, no upload",
    category: "image",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    whatIsIt:
      "HEIC to JPG Converter converts iPhone and iPad HEIC/HEIF photos to universally compatible JPG, PNG, or WebP format. It works entirely in your browser using the heic2any library.",
    howItWorks:
      "Drop your HEIC files onto the tool. The browser decodes each HEIC image using the heic2any WebAssembly library, converts to your chosen format, and lets you download individually or as a ZIP batch.",
    isFree: "Yes. Free for any number of files. No signup, no watermark.",
    isPrivate: "Yes. HEIC files are decoded locally in your browser. Nothing is uploaded.",
    useCases: [
      "Convert iPhone photos to JPG before sending to Windows users",
      "Convert HEIC photos to upload to social media platforms",
      "Convert HEIC files for use in non-Apple design tools",
      "Batch convert an iPhone photo export to JPG for archiving",
      "Convert HEIC to PNG to preserve transparency (if any)",
      "Convert HEIC to WebP for optimized web use",
    ],
    alternatives: ["iMazing HEIC Converter", "HEICtoJPEG.com", "FreeConvert.com", "Convertio"],
    whyBrowserBased:
      "Your private iPhone photos never touch a third-party server. Conversion is instant because it runs on your own device.",
    faq: [
      { q: "What is a HEIC file?", a: "HEIC (High Efficiency Image Container) is Apple's photo format used on iPhone and iPad. It's smaller than JPG but not supported by many apps and platforms." },
      { q: "Can I convert multiple HEIC files at once?", a: "Yes. Drop multiple files and download them all as a ZIP." },
      { q: "Is quality lost when converting HEIC to JPG?", a: "Minimal. JPG at 90% quality is visually identical to the HEIC original for most photos." },
      { q: "Why can't Windows open HEIC files?", a: "HEIC uses HEVC encoding, which requires a paid codec on Windows. Converting to JPG makes the file universally accessible." },
      { q: "Can I convert HEIC to PNG or WebP too?", a: "Yes. The tool supports JPG, PNG, and WebP output formats." },
    ],
    related: ["/image-converter", "/image-compressor", "/exif-stripper", "/image-resizer"],
    features: ["Batch convert", "ZIP download", "JPG/PNG/WebP output", "No upload", "Free"],
  },
  {
    id: "pdf-converter",
    href: "/pdf-converter",
    title: "PDF Tools",
    tagline: "13 PDF tools — compress, merge, split, watermark and more",
    category: "pdf",
    iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
    whatIsIt:
      "PDF Tools is an all-in-one browser-based PDF suite with 13 tools: compress, merge, split, protect, unlock, watermark, rotate, reorder pages, add page numbers, PDF to image, image to PDF, and more.",
    howItWorks:
      "Upload your PDF. Use the tabbed interface to choose your operation. The tool uses pdf-lib and PDF.js running entirely in your browser — no server processes your file at any point.",
    isFree: "Yes. All 13 PDF tools are completely free, no signup, no watermark on output.",
    isPrivate: "Yes. PDFs are processed 100% locally using pdf-lib and PDF.js. Your documents never leave your device.",
    useCases: [
      "Compress large PDF files before emailing",
      "Merge multiple PDFs into one document",
      "Split a large PDF into individual pages",
      "Add a watermark to protect PDF content",
      "Convert PDF pages to JPG or PNG images",
      "Password-protect sensitive PDF documents",
    ],
    alternatives: ["ILovePDF", "Smallpdf", "Adobe Acrobat", "PDF24"],
    whyBrowserBased:
      "ILovePDF and Smallpdf upload your documents to their servers. ToolsHub PDF Tools processes everything locally — critical for confidential documents, legal files, and financial PDFs.",
    faq: [
      { q: "What PDF operations does the tool support?", a: "Compress, merge, split, protect (add password), unlock, watermark, rotate, reorder pages, add page numbers, PDF to image, and image to PDF." },
      { q: "Is there a file size limit for PDFs?", a: "No server limit. Very large PDFs (100 MB+) may be slower as processing uses your device's CPU and RAM." },
      { q: "Can I password-protect a PDF?", a: "Yes. Use the Protect tab to add owner and user passwords with AES-128 encryption via pdf-lib." },
      { q: "Can I convert PDF pages to images?", a: "Yes. PDF to Image renders each page as a JPG or PNG using PDF.js." },
      { q: "Does merging PDFs preserve bookmarks and links?", a: "Basic text and images are preserved. Complex interactive elements may not carry over during merge." },
    ],
    related: ["/e-signature", "/pdf-annotator", "/ocr-tool", "/image-converter"],
    features: ["13 tools", "No upload", "Password protect", "Merge/Split", "Free"],
  },
  {
    id: "e-signature",
    href: "/e-signature",
    title: "E-Signature",
    tagline: "Draw or type your signature and embed it into any PDF",
    category: "pdf",
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    whatIsIt:
      "E-Signature is a free browser tool to create and embed digital signatures into PDF documents. Draw with your mouse/stylus, type your name, or upload a signature image.",
    howItWorks:
      "Upload your PDF, draw or type your signature on the signature pad, then drag it to the correct position on any PDF page. Download the signed PDF — all processing happens locally in your browser.",
    isFree: "Yes. Completely free. No subscription, no per-document fee.",
    isPrivate: "Yes. Your PDF and signature data never leave your browser — all processing uses pdf-lib locally.",
    useCases: [
      "Sign contracts and agreements digitally",
      "Sign rental or employment documents",
      "Add initials to legal pages in a PDF",
      "Sign invoices or proposals as a business",
      "Add a signature image to forms",
    ],
    alternatives: ["DocuSign", "HelloSign", "Adobe Sign", "SignNow"],
    whyBrowserBased:
      "DocuSign costs $10+/month and stores your signed documents on their servers. ToolsHub E-Signature is free, private, and your documents never leave your device.",
    faq: [
      { q: "Is a drawn signature legally valid?", a: "In many countries yes, under e-signature laws (eIDAS in EU, ESIGN Act in USA). Consult a legal professional for your specific use case." },
      { q: "Can I upload a signature image?", a: "Yes. Upload a PNG or JPG of your handwritten signature to embed it into the PDF." },
      { q: "Can I sign multiple pages?", a: "Yes. After placing a signature on one page, you can add additional signatures to other pages." },
      { q: "Does the tool add a digital certificate?", a: "Currently it embeds a visual signature. For cryptographic certificates, dedicated tools like Adobe Acrobat are required." },
    ],
    related: ["/pdf-converter", "/pdf-annotator", "/resume-builder", "/ocr-tool"],
    features: ["Draw/Type/Upload", "Multi-page", "No upload", "Free", "pdf-lib powered"],
  },
  {
    id: "pdf-annotator",
    href: "/pdf-annotator",
    title: "PDF Annotator",
    tagline: "Highlight, draw, and annotate PDFs directly in your browser",
    category: "pdf",
    iconBg: "bg-gradient-to-br from-yellow-500 to-amber-500",
    whatIsIt:
      "PDF Annotator is a browser-based tool to add highlights, drawings, arrows, text notes, and sticky notes to PDF pages. Download the annotated PDF with all markings embedded.",
    howItWorks:
      "Upload a PDF, select an annotation tool (highlight, pen, arrow, text), and annotate directly on the page using mouse or touch. When done, download the final PDF with all annotations saved.",
    isFree: "Yes. All annotation tools are free with no limits.",
    isPrivate: "Yes. PDFs are never uploaded. Annotation runs locally using PDF.js and Canvas API.",
    useCases: [
      "Highlight key sections of a research paper",
      "Add review comments to a design brief PDF",
      "Mark corrections on a student assignment PDF",
      "Draw arrows to explain specific parts of a technical document",
      "Add sticky notes to contract pages before signing",
    ],
    alternatives: ["Adobe Acrobat", "Foxit", "PDF Expert", "Kami"],
    whyBrowserBased:
      "No installation required. No expensive subscription. Your confidential PDFs never leave your device.",
    faq: [
      { q: "What annotation tools are available?", a: "Highlight (multiple colors), freehand pen, arrow, text box, and sticky notes." },
      { q: "Are annotations saved in the PDF?", a: "Yes. The downloaded PDF has annotations embedded as permanent markings." },
      { q: "Can I annotate on a mobile device?", a: "Yes. Touch/stylus drawing is supported on mobile browsers." },
      { q: "Can I remove annotations after adding them?", a: "Yes. Use the eraser tool or undo (Ctrl+Z) before downloading." },
    ],
    related: ["/e-signature", "/pdf-converter", "/ocr-tool", "/resume-builder"],
    features: ["Highlight", "Draw", "Text notes", "Sticky notes", "No upload"],
  },
  {
    id: "ocr-tool",
    href: "/ocr-tool",
    title: "OCR Text Extractor",
    tagline: "Extract text from images and scanned PDFs — 8 languages",
    category: "pdf",
    iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    whatIsIt:
      "OCR Text Extractor uses Tesseract.js to recognize and extract text from scanned images, photos of documents, screenshots, and PDFs entirely in your browser. Supports 8 languages including English and Hindi.",
    howItWorks:
      "Upload an image or screenshot. Tesseract.js (a WebAssembly OCR engine) analyzes the image, recognizes characters using trained models, and returns the extracted text. You can copy the result or download it as a .txt file.",
    isFree: "Yes. OCR processing is free for any number of images.",
    isPrivate: "Yes. Images are analyzed locally by Tesseract.js running in your browser — nothing is uploaded.",
    useCases: [
      "Extract text from scanned receipts or invoices",
      "Copy text from screenshots or photos of whiteboards",
      "Convert scanned PDF pages to editable text",
      "Extract text from book pages photographed with a phone",
      "Read text from images for accessibility purposes",
      "Extract data from charts or tables photographed at a meeting",
    ],
    alternatives: ["Google Docs OCR", "Adobe Acrobat", "ABBYY FineReader", "Tesseract CLI"],
    whyBrowserBased:
      "Google Docs uploads your file to Google's servers for OCR. ToolsHub runs Tesseract.js locally — your documents, receipts, and private images stay on your device.",
    faq: [
      { q: "What languages does OCR support?", a: "English, Hindi, Spanish, French, German, Arabic, Chinese, and Japanese." },
      { q: "What image formats work with OCR?", a: "JPG, PNG, WebP, BMP, and TIFF. For PDFs, convert to image first using PDF Tools." },
      { q: "How accurate is the OCR?", a: "Very accurate on printed text with good contrast. Handwriting and low-resolution images reduce accuracy." },
      { q: "Can it recognize text from photos taken with a phone?", a: "Yes, as long as the photo is clear and well-lit. Rotate if needed before uploading." },
      { q: "Does it extract text from tables?", a: "Text is extracted in reading order. Table formatting may not be preserved, but all text content is captured." },
    ],
    related: ["/pdf-converter", "/pdf-annotator", "/image-compressor", "/word-counter"],
    features: ["8 languages", "Tesseract.js", "No upload", "Copy/Download", "Free"],
  },
  {
    id: "password-generator",
    href: "/password-generator",
    title: "Password Generator",
    tagline: "Generate cryptographically secure passwords — nothing leaves your browser",
    category: "generator",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    whatIsIt:
      "Password Generator creates strong, random passwords using the browser's cryptographically secure random number generator (crypto.getRandomValues). Choose length, character sets, and generate instantly.",
    howItWorks:
      "Select your options: length (8–128 characters), uppercase, lowercase, numbers, and symbols. The tool calls crypto.getRandomValues to generate an unguessable password and displays it for copying.",
    isFree: "Yes. Always free, unlimited generations.",
    isPrivate: "Yes. Passwords are generated locally using the browser's crypto API. The tool has no network access during generation.",
    useCases: [
      "Generate a strong password for a new account",
      "Create a passphrase for a password manager master key",
      "Generate unique passwords for multiple accounts",
      "Create API keys and secret tokens for development",
      "Generate secure Wi-Fi passwords",
    ],
    alternatives: ["LastPass Generator", "1Password Generator", "Bitwarden Generator", "Norton Password Manager"],
    whyBrowserBased:
      "Online password generators that send your password to their server are a security risk. ToolsHub generates passwords entirely client-side using browser-native cryptography — the most secure approach.",
    faq: [
      { q: "Is the password truly random?", a: "Yes. Passwords are generated using crypto.getRandomValues, the same CSPRNG used by cryptographic libraries." },
      { q: "What is the maximum password length?", a: "128 characters. For most purposes, 16–24 characters with mixed character types is sufficient." },
      { q: "Should I use symbols in my password?", a: "Yes, if the service allows them. Symbols dramatically increase the time to crack a password by brute force." },
      { q: "Is this better than a password manager's generator?", a: "Security-wise, equivalent. Both use CSPRNG. A password manager additionally stores and fills passwords for you." },
    ],
    related: ["/base64", "/qr-generator", "/word-counter", "/text-cleaner"],
    features: ["Cryptographically secure", "8-128 chars", "Custom rules", "One-click copy", "No network"],
  },
  {
    id: "qr-generator",
    href: "/qr-generator",
    title: "QR Code Generator",
    tagline: "Generate QR codes for URLs, text, and contact info — free",
    category: "generator",
    iconBg: "bg-gradient-to-br from-teal-500 to-emerald-600",
    whatIsIt:
      "QR Code Generator creates scannable QR codes for URLs, plain text, phone numbers, email addresses, and Wi-Fi credentials. Download as PNG in seconds.",
    howItWorks:
      "Enter your URL or text. The tool uses the qrcode.js library to encode your data into a QR code grid locally in your browser. Choose size and error correction level, then download as PNG.",
    isFree: "Yes. Free for any QR code type and size.",
    isPrivate: "Yes. Your URL and text data are not sent anywhere. QR generation is entirely local.",
    useCases: [
      "Create a QR code for your website URL for print materials",
      "Generate a Wi-Fi QR code so guests can connect without typing a password",
      "Make a QR code for a restaurant menu or event program",
      "Create a QR code for a WhatsApp chat link",
      "Share contact information via a vCard QR code",
      "Add a QR code to a business card linking to your portfolio",
    ],
    alternatives: ["QR Code Monkey", "QRCode.com", "GoQR", "Adobe Express QR Generator"],
    whyBrowserBased:
      "Most QR generators track your URL and show ads. ToolsHub generates QR codes locally — no tracking, no ads, and your URL stays private.",
    faq: [
      { q: "What can I encode in a QR code?", a: "URLs, plain text, phone numbers, email addresses, SMS, Wi-Fi credentials, and vCard contact info." },
      { q: "What error correction levels are available?", a: "Low (7%), Medium (15%), Quartile (25%), and High (30%). Higher correction makes the QR scannable even if partially obscured." },
      { q: "What size can I download the QR code?", a: "From 100×100 to 1000×1000 pixels. For print, use at least 500×500 at 300 DPI." },
      { q: "Do QR codes expire?", a: "No. Static QR codes never expire — they are just encoded data. The URL you linked to must remain active." },
    ],
    related: ["/whatsapp-link", "/password-generator", "/base64", "/resume-builder"],
    features: ["All QR types", "Custom size", "PNG download", "No tracking", "Free"],
  },
  {
    id: "whatsapp-link",
    href: "/whatsapp-link",
    title: "WhatsApp Link Generator",
    tagline: "Create a direct WhatsApp chat link with a pre-filled message",
    category: "generator",
    iconBg: "bg-gradient-to-br from-green-500 to-lime-600",
    whatIsIt:
      "WhatsApp Link Generator creates a direct wa.me link that opens a WhatsApp chat with your number and a pre-filled message. Also generates a scannable QR code for the link.",
    howItWorks:
      "Enter your WhatsApp phone number (with country code) and an optional message. The tool formats the wa.me URL, creates a copyable link, and generates a QR code for the link — all in your browser.",
    isFree: "Yes. Completely free with no limits.",
    isPrivate: "Yes. Your phone number and message are never transmitted to any server.",
    useCases: [
      "Add a WhatsApp contact button to your website",
      "Share a direct WhatsApp chat link on Instagram bio",
      "Create a QR code for your WhatsApp number to put on business cards",
      "Generate a support chat link for customer service",
      "Share a booking link with a pre-filled appointment message",
    ],
    alternatives: ["Create.wa.link", "WhatsApp Business", "Timelines.ai"],
    whyBrowserBased:
      "Your phone number is personal data. ToolsHub generates the wa.me link locally — no one tracks your number or message.",
    faq: [
      { q: "What is a WhatsApp link (wa.me)?", a: "wa.me/[phone] is WhatsApp's official link format. Clicking it opens a chat with that number, optionally with a pre-filled message." },
      { q: "Do I need WhatsApp Business?", a: "No. The wa.me link works for both personal and Business WhatsApp accounts." },
      { q: "Can I include a message in the link?", a: "Yes. The message field is URL-encoded and included in the link, pre-filling the chat input for the user." },
      { q: "Can I put the QR code on a business card?", a: "Yes. Download the generated QR code and add it to any print or digital design." },
    ],
    related: ["/qr-generator", "/resume-builder", "/word-counter", "/text-cleaner"],
    features: ["wa.me link", "QR code", "Pre-filled message", "No tracking", "Free"],
  },
  {
    id: "unit-converter",
    href: "/unit-converter",
    title: "Unit Converter",
    tagline: "Convert length, weight, temperature, volume, area and speed",
    category: "utility",
    iconBg: "bg-gradient-to-br from-violet-500 to-indigo-600",
    whatIsIt:
      "Unit Converter converts between any measurement units across 6 categories: length, weight, temperature, volume, area, and speed. Includes a full reference table for all units in each category.",
    howItWorks:
      "Select a category, choose input and output units, enter a value. Conversions are calculated instantly using precise conversion factors stored in the browser — no internet required after page load.",
    isFree: "Yes. Always free.",
    isPrivate: "Yes. All conversions are pure calculations — no data is sent anywhere.",
    useCases: [
      "Convert miles to kilometers for travel planning",
      "Convert pounds to kilograms for fitness tracking",
      "Convert Fahrenheit to Celsius for international recipes",
      "Convert gallons to liters for fluid measurements",
      "Convert square feet to square meters for real estate",
      "Convert miles per hour to km/h for vehicle speeds",
    ],
    alternatives: ["Google Unit Converter", "ConvertUnits.com", "UnitConverters.net", "Wolfram Alpha"],
    whyBrowserBased:
      "Unit conversion is math — no server needed. ToolsHub does it instantly in your browser with a clean interface and full reference tables.",
    faq: [
      { q: "What unit categories are supported?", a: "Length, weight/mass, temperature, volume/capacity, area, and speed." },
      { q: "How accurate are the conversions?", a: "Conversions use standard international conversion factors and are accurate to many decimal places." },
      { q: "Can I convert unusual units like nautical miles or furlongs?", a: "Yes. The tool includes a comprehensive list of less common units in each category." },
      { q: "Does it work offline?", a: "Yes, once the page is loaded — all conversion logic is stored locally." },
    ],
    related: ["/bmi-calculator", "/emi-calculator", "/word-counter", "/text-cleaner"],
    features: ["6 categories", "Instant results", "Reference table", "Works offline", "Free"],
  },
  {
    id: "text-cleaner",
    href: "/text-cleaner",
    title: "Text Cleaner",
    tagline: "Remove extra spaces, normalize line breaks, change case, strip emojis",
    category: "utility",
    iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500",
    whatIsIt:
      "Text Cleaner is a browser-based tool that fixes messy text: removes extra spaces, normalizes line breaks, changes letter case, strips emojis and special characters, and removes HTML tags.",
    howItWorks:
      "Paste your text, toggle the cleaning options you need, and see the cleaned result instantly with live preview. Copy the output with one click.",
    isFree: "Yes. Free with no limits.",
    isPrivate: "Yes. Text is processed locally in your browser — never sent to a server.",
    useCases: [
      "Clean text copied from PDFs that has extra line breaks",
      "Normalize case for data entry or spreadsheets",
      "Remove emojis from user-generated content before processing",
      "Strip HTML tags from content copied from web pages",
      "Fix double spaces in a document before publishing",
      "Prepare text for databases by normalizing whitespace",
    ],
    alternatives: ["TextFixer.com", "TextCleanr.com", "Word online formatting tools"],
    whyBrowserBased:
      "Text you paste into web forms can be logged by third-party services. ToolsHub processes text locally — your confidential content never leaves your browser.",
    faq: [
      { q: "What text cleaning operations are available?", a: "Remove extra spaces, normalize line breaks, trim leading/trailing whitespace, UPPERCASE, lowercase, Title Case, strip emojis, strip HTML tags, and remove special characters." },
      { q: "Does it work with text in multiple languages?", a: "Yes. The tool is Unicode-aware and works with any language including Arabic, Chinese, and Hindi." },
      { q: "Can I clean text from a CSV or spreadsheet?", a: "Yes. Paste cell content directly and copy the cleaned result back." },
    ],
    related: ["/word-counter", "/base64", "/json-explorer", "/csv-explorer"],
    features: ["Live preview", "Case conversion", "Strip emojis", "Remove HTML", "Free"],
  },
  {
    id: "resume-builder",
    href: "/resume-builder",
    title: "Resume Builder",
    tagline: "Create a professional PDF resume with free templates",
    category: "utility",
    iconBg: "bg-gradient-to-br from-blue-600 to-indigo-600",
    whatIsIt:
      "Resume Builder is a free browser-based tool to create professional resumes. Choose from 8 templates, fill in your details with live preview, and download as a pixel-perfect PDF.",
    howItWorks:
      "Choose a template, fill in sections (contact, experience, education, skills, summary). See a live preview update as you type. Click Download PDF to get your resume — generated locally using jsPDF.",
    isFree: "Yes. All templates and PDF generation are free. No account required.",
    isPrivate: "Yes. Your personal details, work history, and contact information are never uploaded. The PDF is generated locally using jsPDF.",
    useCases: [
      "Create a resume for a job application quickly",
      "Update your existing resume with a new template",
      "Build a resume as a student or fresh graduate",
      "Generate a resume for freelance client proposals",
      "Create multiple resume versions for different job roles",
    ],
    alternatives: ["Canva Resume Builder", "Zety", "Resume.io", "Novoresume"],
    whyBrowserBased:
      "Canva and Zety require accounts and upload your data. ToolsHub Resume Builder keeps all your personal information on your device — and it's completely free.",
    faq: [
      { q: "How many resume templates are available?", a: "8 professional templates ranging from minimal to modern to creative." },
      { q: "Can I download the resume as a PDF?", a: "Yes. Click Download to get a print-ready PDF generated by jsPDF directly in your browser." },
      { q: "Can I save my resume and edit it later?", a: "Resume data is saved in localStorage. Returning to the same browser on the same device will restore your data." },
      { q: "Is the PDF ATS-friendly?", a: "Yes. Text in the PDF is machine-readable and compatible with Applicant Tracking Systems." },
    ],
    related: ["/word-counter", "/pdf-converter", "/e-signature", "/text-cleaner"],
    features: ["8 templates", "Live preview", "ATS-friendly PDF", "No upload", "Free"],
  },
  {
    id: "bg-remover",
    href: "/background-remover",
    title: "Background Remover",
    tagline: "AI removes image backgrounds instantly in your browser — free",
    category: "image",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    whatIsIt:
      "Background Remover uses AI (the ISNet neural network via ONNX Runtime) to remove image backgrounds entirely in your browser. Upload any photo and get a transparent PNG in seconds — no API key needed.",
    howItWorks:
      "Upload an image. The ISNet segmentation model runs locally via ONNX Runtime WebAssembly to detect the subject and separate it from the background. The result is a transparent PNG you can download immediately.",
    isFree: "Yes. Completely free. No subscription, no credits, no API key.",
    isPrivate: "Yes. The AI model runs locally in your browser. Your photos are never uploaded to any server.",
    useCases: [
      "Remove the background from product photos for e-commerce",
      "Create transparent PNG logos from photos",
      "Make profile photos with custom backgrounds for LinkedIn or Zoom",
      "Remove backgrounds from portrait photos for ID cards",
      "Prepare product cutouts for marketing materials",
      "Create stickers from photos by removing backgrounds",
    ],
    alternatives: ["Remove.bg", "Canva Background Remover", "Adobe Express", "Erase.bg"],
    whyBrowserBased:
      "Remove.bg charges per image and uploads your photos. ToolsHub Background Remover runs the ISNet AI model locally — unlimited use, zero cost, and your photos stay private.",
    faq: [
      { q: "How accurate is the background removal?", a: "Very accurate on photos with clear subjects (people, products, animals) against simple backgrounds. Complex scenes may need manual touch-up." },
      { q: "What image formats are supported?", a: "JPG, PNG, and WebP. The output is always a transparent PNG." },
      { q: "Why does it take a few seconds the first time?", a: "The AI model (~20 MB) downloads to your browser once, then it's cached for instant use on future visits." },
      { q: "What is the image size limit?", a: "No hard limit, but very large images (4000+ pixels) may be slower as AI inference runs on your CPU." },
      { q: "Is Remove.bg better?", a: "Remove.bg uses more powerful server-side AI. ToolsHub trades some accuracy for privacy and free unlimited use." },
    ],
    related: ["/image-compressor", "/image-converter", "/photo-colorizer", "/image-upscaler"],
    features: ["ISNet AI model", "Transparent PNG", "No API key", "No upload", "Free"],
  },
  {
    id: "word-counter",
    href: "/word-counter",
    title: "Word Counter",
    tagline: "Count words, characters, sentences and reading time instantly",
    category: "utility",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    whatIsIt:
      "Word Counter is a free browser-based tool that counts words, characters (with and without spaces), sentences, paragraphs, and estimates reading time. Great for writers, students, and content creators.",
    howItWorks:
      "Type or paste text into the editor. Counts update instantly as you type using JavaScript string analysis — no server required. Reading time is estimated at 200 words per minute.",
    isFree: "Yes. Always free.",
    isPrivate: "Yes. Your text stays in your browser — nothing is sent to a server.",
    useCases: [
      "Check word count for blog posts, essays, or articles",
      "Count characters to meet social media post limits",
      "Estimate reading time before publishing content",
      "Check word count requirements for academic assignments",
      "Monitor word count while writing a chapter or report",
    ],
    alternatives: ["WordCounter.net", "Word (Microsoft)", "Google Docs word count", "Hemingway App"],
    whyBrowserBased:
      "Privacy matters for unpublished writing. ToolsHub Word Counter never transmits your text — count words in your private notes, drafts, or sensitive documents safely.",
    faq: [
      { q: "What counts as a word?", a: "Any sequence of non-whitespace characters separated by spaces. Hyphenated words count as one word." },
      { q: "How is reading time calculated?", a: "Based on an average adult reading speed of 200 words per minute." },
      { q: "Does it count words in different languages?", a: "Yes. It counts space-separated tokens, which works for Latin-script languages. CJK (Chinese, Japanese, Korean) uses character count." },
      { q: "Is there a character limit?", a: "No. The tool handles texts of any size." },
    ],
    related: ["/text-cleaner", "/resume-builder", "/pdf-converter", "/ocr-tool"],
    features: ["Live count", "Reading time", "Paragraphs", "Characters", "Free"],
  },
  {
    id: "video-to-gif",
    href: "/video-to-gif",
    title: "Video to GIF",
    tagline: "Convert video clips to animated GIFs in your browser",
    category: "generator",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    whatIsIt:
      "Video to GIF converts video clips (MP4, WebM, MOV) to animated GIFs directly in your browser. Trim the clip, choose FPS and output size, and download a looping GIF.",
    howItWorks:
      "Upload a video, set start/end time, FPS (1–24), and output dimensions. The tool uses HTML5 Canvas to capture frames and the gif.js library to encode them into an animated GIF — all locally.",
    isFree: "Yes. Free with no size limits.",
    isPrivate: "Yes. Video files are processed locally — never uploaded.",
    useCases: [
      "Convert a funny video clip to a GIF for sharing on social media",
      "Create a GIF tutorial from a screen recording",
      "Convert a product demo video to a looping GIF for websites",
      "Make a meme GIF from a movie or TV clip",
      "Create a GIF from a sports highlight clip",
    ],
    alternatives: ["Giphy", "EZGIF.com", "CloudConvert", "Kapwing"],
    whyBrowserBased:
      "EZGIF.com uploads your video to their servers. ToolsHub creates GIFs locally — your videos, especially screen recordings of sensitive work, stay private.",
    faq: [
      { q: "What video formats are supported?", a: "MP4, WebM, MOV, and any format the browser's <video> element can play." },
      { q: "Why is GIF file size large?", a: "GIF uses an indexed 256-color palette which is inefficient for video. Lower FPS and smaller dimensions significantly reduce file size." },
      { q: "What is the maximum clip length for GIF conversion?", a: "Technically unlimited, but long clips at high FPS produce very large files. Recommend keeping clips under 10 seconds." },
    ],
    related: ["/image-compressor", "/image-converter", "/image-resizer", "/image-cropper"],
    features: ["Trim clip", "Custom FPS", "MP4/WebM/MOV", "No upload", "Free"],
  },
  {
    id: "pomodoro-timer",
    href: "/pomodoro-timer",
    title: "Pomodoro Timer",
    tagline: "Focus for 25 minutes, then break — the Pomodoro technique",
    category: "generator",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    whatIsIt:
      "Pomodoro Timer is a browser-based productivity timer based on the Pomodoro Technique: 25-minute work sessions followed by 5-minute short breaks and 15-minute long breaks after every 4 sessions.",
    howItWorks:
      "Click Start. The timer counts down 25 minutes with a visual progress ring. An audio alert sounds when the session ends. Sessions are tracked automatically and short/long breaks are scheduled.",
    isFree: "Yes. Always free.",
    isPrivate: "Yes. No data is collected. The timer runs entirely in your browser.",
    useCases: [
      "Stay focused while writing a blog post or essay",
      "Break large coding tasks into manageable sessions",
      "Study for exams using time-boxed sessions",
      "Manage deep work sessions to avoid burnout",
      "Track how many Pomodoros a task takes for future planning",
    ],
    alternatives: ["Pomofocus.io", "Be Focused", "Forest App", "Toggl Track"],
    whyBrowserBased:
      "No app installation, no account, no subscription. The Pomodoro Timer works instantly in any browser tab — perfect for quick focus sessions.",
    faq: [
      { q: "What is the Pomodoro Technique?", a: "A time management method developed by Francesco Cirillo: work for 25 minutes (one Pomodoro), take a 5-minute break. After 4 Pomodoros, take a 15-minute long break." },
      { q: "Can I customize the timer lengths?", a: "Yes. Work session, short break, and long break durations are all adjustable." },
      { q: "Does the timer work in a background tab?", a: "Yes. JavaScript timers continue running even when the tab is in the background." },
      { q: "Does it play a sound when the timer ends?", a: "Yes. An audio alert plays when each session or break ends." },
    ],
    related: ["/word-counter", "/text-cleaner", "/bmi-calculator", "/unit-converter"],
    features: ["25/5/15 min cycles", "Audio alert", "Session tracker", "Customizable", "Free"],
  },
  {
    id: "exif-stripper",
    href: "/exif-stripper",
    title: "EXIF Metadata Remover",
    tagline: "Remove GPS location, camera model and hidden metadata from photos",
    category: "utility",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    whatIsIt:
      "EXIF Metadata Remover strips all hidden EXIF data from photos before you share them: GPS location, device model, shooting settings, timestamp, and other metadata embedded by cameras and smartphones.",
    howItWorks:
      "Upload a JPG or PNG photo. The tool reads the file, removes all EXIF chunks using JavaScript, and returns a clean image with no metadata — processed entirely in your browser.",
    isFree: "Yes. Free for any number of photos.",
    isPrivate: "Yes. Photos are processed locally. No image is uploaded to any server.",
    useCases: [
      "Remove GPS location from photos before posting on social media",
      "Strip device information from photos before sharing with strangers",
      "Clean metadata from product photos before publishing",
      "Remove timestamp from photos for privacy",
      "Strip author information from images before sharing publicly",
      "Clean EXIF from photos before submitting to photo contests",
    ],
    alternatives: ["ExifTool", "VerExif.com", "Jeffrey's Exif Viewer", "ExifPurge"],
    whyBrowserBased:
      "Uploading photos with GPS data to a web service to strip the GPS is ironic and risky. ToolsHub removes EXIF locally — your location data never leaves your device.",
    faq: [
      { q: "What metadata does EXIF contain?", a: "GPS coordinates, device make/model, lens information, aperture, shutter speed, ISO, datetime, software version, and sometimes even thumbnail copies of the photo." },
      { q: "Does removing EXIF affect image quality?", a: "No. EXIF is metadata stored alongside the image data. Removing it does not change the pixels." },
      { q: "Can I remove EXIF from PNG files?", a: "PNG files contain different metadata chunks (iTXt, tEXt) which are also stripped." },
      { q: "Does social media strip EXIF automatically?", a: "Instagram and Facebook strip location data, but not always all metadata. Stripping before uploading is safest." },
    ],
    related: ["/image-compressor", "/image-converter", "/background-remover", "/image-cropper"],
    features: ["GPS removal", "All EXIF stripped", "JPG/PNG", "No upload", "Free"],
  },
  {
    id: "color-picker",
    href: "/color-picker",
    title: "Color Picker",
    tagline: "Click any pixel in an image to get its exact HEX, RGB, HSL value",
    category: "utility",
    iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    whatIsIt:
      "Color Picker is a browser tool that lets you click anywhere on an uploaded image to get the exact color at that pixel as HEX, RGB, HSL, and HSV values. Also supports the browser's native eyedropper API.",
    howItWorks:
      "Upload an image and hover over it. The tool reads pixel values from an HTML5 Canvas and displays the color code in real-time as you move your cursor. Click to lock a color and copy its value.",
    isFree: "Yes. Completely free.",
    isPrivate: "Yes. Images are loaded into a local canvas — nothing is uploaded.",
    useCases: [
      "Pick an exact color from a logo or brand image",
      "Match colors from a photo for a web or design project",
      "Identify the exact hex code of a UI element from a screenshot",
      "Get color codes from a mood board or reference image",
      "Verify color consistency in product photos",
    ],
    alternatives: ["ColorZilla", "Adobe Color", "Canva eyedropper", "DigitalColor Meter (macOS)"],
    whyBrowserBased:
      "No installation required — pick colors from any image directly in your browser, including screenshots and confidential design files.",
    faq: [
      { q: "What color formats does it show?", a: "HEX, RGB, HSL, and HSV. Copy any format with one click." },
      { q: "Can I use the screen eyedropper to pick colors outside the browser?", a: "Yes, if your browser supports the EyeDropper API (Chrome/Edge 95+). It can pick colors from anywhere on your screen." },
      { q: "How precise is the color picking?", a: "It reads exact pixel values from the image canvas — accurate to the single pixel." },
    ],
    related: ["/color-palette", "/image-compressor", "/background-remover", "/exif-stripper"],
    features: ["HEX/RGB/HSL", "Hover preview", "EyeDropper API", "No upload", "Free"],
  },
  {
    id: "image-upscaler",
    href: "/image-upscaler",
    title: "AI Image Upscaler",
    tagline: "Upscale images 2× or 4× using AI — free Topaz alternative",
    category: "image",
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    whatIsIt:
      "AI Image Upscaler increases image resolution by 2× or 4× using Lanczos resampling enhanced with AI sharpening, running entirely in your browser. A free alternative to Topaz Gigapixel.",
    howItWorks:
      "Upload an image, choose 2× or 4× upscaling. The tool applies Lanczos resampling on a Canvas to increase pixel count, then enhances edges and details with sharpening filters — all running on your CPU via WebAssembly.",
    isFree: "Yes. Unlimited upscaling, completely free.",
    isPrivate: "Yes. Images never leave your browser — all AI processing runs locally.",
    useCases: [
      "Upscale a small product photo for print materials",
      "Improve the quality of an old low-resolution photo",
      "Increase image resolution for large-format printing",
      "Upscale a thumbnail to full size for a presentation",
      "Improve a blurry screenshot for documentation",
    ],
    alternatives: ["Topaz Gigapixel AI", "Let's Enhance", "waifu2x", "Adobe Photoshop AI Upscale"],
    whyBrowserBased:
      "Topaz Gigapixel costs $99+/year and requires installation. Let's Enhance uploads your images. ToolsHub upscaler runs locally — free, private, and instantly accessible.",
    faq: [
      { q: "How much can I upscale an image?", a: "2× (doubles each dimension) or 4× (quadruples each dimension). A 500×500 image becomes 2000×2000 at 4×." },
      { q: "Is AI upscaling better than simple resize?", a: "Yes. Standard resize blurs the image. Lanczos + AI sharpening preserves edge detail and produces sharper results." },
      { q: "Does upscaling work on photos and graphics?", a: "Yes. Photos, illustrations, and UI screenshots all benefit from upscaling." },
      { q: "Is there a maximum input file size?", a: "No hard limit, but very large images may be slow as processing runs on your CPU." },
    ],
    related: ["/image-resizer", "/image-compressor", "/background-remover", "/image-converter"],
    features: ["2× / 4× upscale", "Lanczos + AI", "No upload", "Free Topaz alternative", "Free"],
  },
  {
    id: "photo-colorizer",
    href: "/photo-colorizer",
    title: "Photo Colorizer",
    tagline: "AI adds color to black & white photos — 100% browser-based",
    category: "image",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    whatIsIt:
      "Photo Colorizer uses an AI model to automatically colorize black and white photos, producing natural-looking color results. The before/after slider lets you compare the original and colorized versions.",
    howItWorks:
      "Upload a black and white photo. The AI colorization model (running via WebAssembly in your browser) analyzes the content and predicts natural colors for each region. The result is displayed with a before/after comparison slider.",
    isFree: "Yes. Completely free, no credits required.",
    isPrivate: "Yes. Photos never leave your device — AI inference runs locally.",
    useCases: [
      "Colorize old family black and white photos",
      "Restore historical photographs with natural colors",
      "Add color to vintage portrait or landscape photos",
      "Colorize scanned black and white documents for visual interest",
      "Create colorized versions of classic film stills",
    ],
    alternatives: ["Palette.fm", "DeepAI Photo Colorizer", "MyHeritage In Color", "Colorize.cc"],
    whyBrowserBased:
      "MyHeritage In Color uploads family photos to their servers. ToolsHub Photo Colorizer runs AI locally — your private family memories stay on your device.",
    faq: [
      { q: "How accurate is the colorization?", a: "AI colorization produces plausible natural colors but may not match the original scene's exact colors. Skin tones, foliage, and sky are typically very accurate." },
      { q: "Does it work on photos with partial color?", a: "It works best on fully grayscale images. Partially colored images may produce inconsistent results." },
      { q: "Why does colorization take a moment?", a: "AI inference runs on your CPU via WebAssembly. The model processes millions of pixels — 5–15 seconds is normal." },
      { q: "Can I compare before and after?", a: "Yes. Use the interactive slider to drag between the original black and white and the colorized version." },
    ],
    related: ["/background-remover", "/image-upscaler", "/image-compressor", "/exif-stripper"],
    features: ["AI colorization", "Before/after slider", "No upload", "Free", "Browser AI"],
  },
  {
    id: "watermark-remover",
    href: "/watermark-remover",
    title: "Watermark Remover",
    tagline: "AI detects and removes watermarks using content-aware fill",
    category: "image",
    iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    whatIsIt:
      "Watermark Remover uses content-aware inpainting to detect and remove watermarks from images. Select the watermark area manually or let the AI detect it automatically. All processing is browser-based.",
    howItWorks:
      "Upload an image. The AI scans for common watermark patterns or you manually select the watermark area. A content-aware fill algorithm reconstructs the image behind the watermark using surrounding pixel data — locally in your browser.",
    isFree: "Yes. Free to use.",
    isPrivate: "Yes. Images are processed locally — no uploads.",
    useCases: [
      "Remove text overlays or logos from personal photos",
      "Clean up screenshots with unwanted overlay text",
      "Remove branding from stock photos you own a license for",
      "Restore a photo that has a date/time stamp burned in",
    ],
    alternatives: ["Inpaint", "Remove.bg", "Photoshop Content-Aware Fill", "Cleanup.pictures"],
    whyBrowserBased:
      "Cleanup.pictures uploads your images. ToolsHub processes watermark removal locally — your images stay on your device.",
    faq: [
      { q: "Can it remove any watermark?", a: "Best results on semi-transparent text watermarks against simple backgrounds. Complex or large watermarks may leave artifacts." },
      { q: "Does it work on diagonal or rotated watermarks?", a: "Yes, manual selection mode lets you draw around any shaped watermark area." },
      { q: "Is watermark removal legal?", a: "Only remove watermarks from images you own or have explicit rights to modify. Removing copyright watermarks from others' work may be illegal." },
    ],
    related: ["/background-remover", "/image-compressor", "/photo-colorizer", "/exif-stripper"],
    features: ["AI detection", "Manual mode", "Content-aware fill", "No upload", "Free"],
  },
  {
    id: "face-blur",
    href: "/face-blur",
    title: "AI Face Blur",
    tagline: "Automatically blur all faces in any photo — privacy-first",
    category: "image",
    iconBg: "bg-gradient-to-br from-slate-500 to-gray-600",
    whatIsIt:
      "AI Face Blur automatically detects all human faces in a photo using a browser-based face detection model and applies a blur effect. Useful for protecting the privacy of people in shared photos.",
    howItWorks:
      "Upload a photo. A face detection model (running locally via WebAssembly) identifies all face regions. A Gaussian blur is applied to each detected region. Adjust blur intensity and download the result.",
    isFree: "Yes. Free for any number of images.",
    isPrivate: "Yes. Facial detection and blurring happen entirely in your browser — your photos never leave your device.",
    useCases: [
      "Blur faces in event photos before sharing on social media",
      "Anonymize people in street photography",
      "Blur faces in screenshots for blog posts or tutorials",
      "Protect minors' faces in photos shared online",
      "Anonymize medical or research photos showing patients",
    ],
    alternatives: ["Google Photos face blur", "Pixelator", "Facepixelizer.com"],
    whyBrowserBased:
      "Sending photos with unblurred faces to a server for blurring defeats the privacy purpose. ToolsHub detects and blurs faces locally — your photos and the people in them stay private.",
    faq: [
      { q: "How accurate is face detection?", a: "Very accurate for frontal faces in good lighting. Side profiles and small faces in group photos may occasionally be missed." },
      { q: "Can I adjust the blur intensity?", a: "Yes. Slider controls let you choose from a light blur to a heavy pixelation effect." },
      { q: "Can I blur faces manually?", a: "Yes. Manual mode lets you draw rectangles over areas to blur, in addition to automatic detection." },
      { q: "What image formats are supported?", a: "JPG, PNG, and WebP." },
    ],
    related: ["/exif-stripper", "/background-remover", "/image-compressor", "/image-converter"],
    features: ["Auto face detection", "Adjustable blur", "Manual mode", "No upload", "Free"],
  },
  {
    id: "csv-explorer",
    href: "/csv-explorer",
    title: "CSV Explorer",
    tagline: "Explore CSV data in your browser — sort, filter, visualize",
    category: "utility",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    whatIsIt:
      "CSV Explorer loads any CSV file into an interactive, sortable table with column statistics (mean, median, min, max, null count) and bar charts. Explore data without uploading it to any server.",
    howItWorks:
      "Upload or paste a CSV. It's parsed using PapaParse in your browser and rendered as an interactive table. Click column headers to sort, view stats per column, and see bar chart distributions.",
    isFree: "Yes. Completely free.",
    isPrivate: "Yes. CSV data is never uploaded. PapaParse runs locally.",
    useCases: [
      "Explore a sales or analytics CSV export before opening in Excel",
      "Quick data inspection to check for null values or outliers",
      "View a large CSV file that Excel struggles to open",
      "Share a CSV analysis without setting up a database",
      "Inspect survey results or user data exports privately",
    ],
    alternatives: ["Google Sheets", "Excel", "Airtable", "Datasette"],
    whyBrowserBased:
      "Uploading sensitive business data to Google Sheets or online CSV tools is a privacy risk. CSV Explorer analyzes data locally — no data leaves your browser.",
    faq: [
      { q: "What size CSV files can it handle?", a: "Tested up to 100,000 rows. Very large files may slow rendering but all data is processed locally." },
      { q: "Does it support CSV files with different delimiters?", a: "Yes. Comma, semicolon, tab, and pipe delimiters are auto-detected using PapaParse." },
      { q: "Can I filter or search within the CSV?", a: "Yes. A search box filters rows in real-time as you type." },
      { q: "Can I export the filtered view?", a: "Yes. Download the current filtered view as a new CSV." },
    ],
    related: ["/json-explorer", "/text-cleaner", "/word-counter", "/bmi-calculator"],
    features: ["Sort & filter", "Column stats", "Bar charts", "No upload", "Free"],
  },
  {
    id: "bmi-calculator",
    href: "/bmi-calculator",
    title: "BMI Calculator",
    tagline: "Calculate Body Mass Index with metric or imperial units",
    category: "utility",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    whatIsIt:
      "BMI Calculator computes your Body Mass Index from height and weight in metric (kg/cm) or imperial (lbs/ft) units. Shows your BMI category, ideal weight range, and health context.",
    howItWorks:
      "Enter height and weight. The tool calculates BMI = weight(kg) / height(m)². Displays your category (Underweight, Normal, Overweight, Obese) with range context and health notes.",
    isFree: "Yes. Always free.",
    isPrivate: "Yes. Health data is calculated locally and never sent to a server.",
    useCases: [
      "Check your BMI as a quick health reference",
      "Monitor BMI changes over a fitness journey",
      "Calculate BMI for a medical appointment",
      "Understand weight range for your height",
    ],
    alternatives: ["CDC BMI Calculator", "NIH BMI Calculator", "WebMD BMI Calculator"],
    whyBrowserBased:
      "Your health data is personal. ToolsHub BMI Calculator computes results locally — your weight and height are never stored or shared.",
    faq: [
      { q: "What is a healthy BMI range?", a: "18.5 to 24.9 is considered healthy for most adults. Under 18.5 is underweight, 25–29.9 is overweight, 30+ is obese." },
      { q: "Is BMI accurate for everyone?", a: "BMI is a population-level screening tool. It may over- or under-estimate health risk for athletes, elderly people, or different ethnic groups." },
      { q: "Does it support imperial units?", a: "Yes. Switch between metric (kg, cm) and imperial (lbs, ft/in) with one click." },
    ],
    related: ["/emi-calculator", "/unit-converter", "/pomodoro-timer", "/word-counter"],
    features: ["Metric & Imperial", "Category display", "Ideal weight range", "Free", "Private"],
  },
  {
    id: "emi-calculator",
    href: "/emi-calculator",
    title: "EMI Calculator",
    tagline: "Calculate loan EMI, total interest and amortization schedule",
    category: "utility",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    whatIsIt:
      "EMI Calculator computes monthly loan EMI, total interest payable, and a full amortization schedule for home, car, or personal loans. Includes interactive charts for principal vs interest breakdown.",
    howItWorks:
      "Enter loan amount, annual interest rate, and tenure (months or years). The tool computes EMI using the standard formula and generates a month-by-month amortization table and pie chart.",
    isFree: "Yes. Always free.",
    isPrivate: "Yes. Financial data is computed locally — nothing is transmitted.",
    useCases: [
      "Calculate home loan EMI before applying to a bank",
      "Compare EMIs for different loan tenures",
      "Calculate car loan repayments",
      "Plan a personal loan for a large purchase",
      "Understand total interest cost over the loan period",
    ],
    alternatives: ["BankBazaar EMI Calculator", "ET Money EMI Calculator", "NerdWallet Loan Calculator"],
    whyBrowserBased:
      "Your loan amount and financial details are private. ToolsHub EMI Calculator computes everything locally — no financial data is collected.",
    faq: [
      { q: "What is EMI?", a: "Equated Monthly Installment — a fixed monthly payment that includes both principal repayment and interest." },
      { q: "What formula is used?", a: "EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly interest rate, n is number of months." },
      { q: "Can I calculate partial prepayment impact?", a: "Enter the reduced principal after prepayment to see the new EMI and remaining schedule." },
    ],
    related: ["/bmi-calculator", "/unit-converter", "/word-counter", "/resume-builder"],
    features: ["Amortization table", "Charts", "All loan types", "Free", "Private"],
  },
  {
    id: "json-explorer",
    href: "/json-explorer",
    title: "JSON Explorer",
    tagline: "Explore, format and visualize JSON with a collapsible tree",
    category: "utility",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    whatIsIt:
      "JSON Explorer parses and visualizes JSON data as a collapsible tree with type annotations, value counts, and an array table view. Also formats (prettifies) and minifies JSON.",
    howItWorks:
      "Paste or upload JSON. The tool parses it using JSON.parse, builds a collapsible tree UI, shows type information (string, number, boolean, null, array, object) for each node, and lets you copy formatted or minified JSON.",
    isFree: "Yes. Completely free.",
    isPrivate: "Yes. JSON data is parsed locally — never uploaded.",
    useCases: [
      "Explore API responses to understand the data structure",
      "Find a specific key in a large complex JSON file",
      "Format minified JSON for readability",
      "Minify formatted JSON for production use",
      "Validate JSON syntax before using in code",
      "View array data as a sortable table",
    ],
    alternatives: ["JSONFormatter.org", "jsoneditoronline.org", "Postman", "jq CLI"],
    whyBrowserBased:
      "API responses often contain sensitive tokens or user data. JSON Explorer parses data locally — your tokens, user data, and API responses never leave your browser.",
    faq: [
      { q: "What size JSON files can it handle?", a: "Tested up to 10 MB. Very large files may be slower to render as a tree." },
      { q: "Can it format and minify JSON?", a: "Yes. Format (pretty-print with 2-space indent) and minify (remove all whitespace) with one click." },
      { q: "Can it detect JSON syntax errors?", a: "Yes. If the input is invalid JSON, it shows the error message with the line and character position." },
      { q: "Can I view arrays as a table?", a: "Yes. Arrays of objects are automatically rendered as a sortable table." },
    ],
    related: ["/csv-explorer", "/base64", "/text-cleaner", "/word-counter"],
    features: ["Collapsible tree", "Array table", "Format/Minify", "No upload", "Free"],
  },
  {
    id: "base64-tool",
    href: "/base64",
    title: "Base64 Encoder / Decoder",
    tagline: "Encode text, images and any file to Base64 — or decode back",
    category: "utility",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    whatIsIt:
      "Base64 Encoder/Decoder converts text or any file (images, PDFs, documents) to Base64 encoding, and decodes Base64 back to the original format. Essential for developers working with data URIs and API payloads.",
    howItWorks:
      "Type or paste text, or upload a file. The tool uses atob/btoa and FileReader APIs to encode or decode instantly in your browser. For files, it generates a data URI or download link.",
    isFree: "Yes. Completely free.",
    isPrivate: "Yes. All encoding/decoding happens locally — files are never uploaded.",
    useCases: [
      "Encode images as Base64 data URIs for inline HTML/CSS",
      "Decode Base64-encoded API responses for inspection",
      "Encode files to Base64 for embedding in JSON payloads",
      "Decode JWT token payloads to read their contents",
      "Test API endpoints that require Base64-encoded input",
      "Encode authentication credentials for HTTP Basic Auth headers",
    ],
    alternatives: ["Base64Encode.org", "Base64Guru.com", "developer console (btoa/atob)", "CyberChef"],
    whyBrowserBased:
      "Encoding sensitive API keys or credentials on a third-party site is a security risk. ToolsHub Base64 tool runs locally — your tokens and credentials never leave your browser.",
    faq: [
      { q: "What is Base64 encoding?", a: "Base64 converts binary data to ASCII text using 64 printable characters. It's used to safely embed binary data in text-based formats like JSON, XML, or email." },
      { q: "Can I encode image files to Base64?", a: "Yes. Upload any image and get a Base64 data URI (data:image/png;base64,...) for use in HTML or CSS." },
      { q: "Can I decode a Base64 string back to a file?", a: "Yes. Paste a Base64 string and download the decoded file." },
      { q: "Does Base64 compress data?", a: "No. Base64 increases data size by ~33%. It's for encoding compatibility, not compression." },
    ],
    related: ["/json-explorer", "/text-cleaner", "/password-generator", "/word-counter"],
    features: ["Text & file encode", "File decode", "Data URI", "No upload", "Free"],
  },
];

export const TOOL_BY_HREF = new Map(TOOLS_DATA.map((t) => [t.href, t]));
export const TOOL_BY_ID = new Map(TOOLS_DATA.map((t) => [t.id, t]));

export const POPULAR_TOOL_HREFS = [
  "/image-compressor",
  "/background-remover",
  "/heic-converter",
  "/pdf-converter",
  "/ocr-tool",
  "/qr-generator",
  "/word-counter",
  "/image-converter",
];

export const NON_TOOL_PATHS = new Set([
  "/",
  "/settings",
  "/about",
  "/privacy-policy",
  "/terms",
  "/faq",
  "/security",
  "/future",
  "/contact",
  "/not-found",
]);
