import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";

const Home          = lazy(() => import("@/pages/Home"));
const ImageCompressor = lazy(() => import("@/pages/ImageCompressor"));
const ImageConverter  = lazy(() => import("@/pages/ImageConverter"));
const PdfConverter    = lazy(() => import("@/pages/PdfConverter"));
const QrGenerator     = lazy(() => import("@/pages/QrGenerator"));
const TextCleaner     = lazy(() => import("@/pages/TextCleaner"));
const WhatsappLink    = lazy(() => import("@/pages/WhatsappLink"));
const ImageResizer    = lazy(() => import("@/pages/ImageResizer"));
const ImageCropper        = lazy(() => import("@/pages/ImageCropper"));
const PasswordGenerator   = lazy(() => import("@/pages/PasswordGenerator"));
const UnitConverter       = lazy(() => import("@/pages/UnitConverter"));
const ColorPalette        = lazy(() => import("@/pages/ColorPalette"));
const HeicConverter       = lazy(() => import("@/pages/HeicConverter"));
const ESignature      = lazy(() => import("@/pages/ESignature"));
const OcrTool         = lazy(() => import("@/pages/OcrTool"));
const PdfAnnotator    = lazy(() => import("@/pages/PdfAnnotator"));
const Settings        = lazy(() => import("@/pages/Settings"));
const PrivacyPolicy   = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("@/pages/TermsConditions"));
const FAQ             = lazy(() => import("@/pages/FAQ"));
const ResumeBuilder        = lazy(() => import("@/pages/ResumeBuilder"));
const BackgroundRemover    = lazy(() => import("@/pages/BackgroundRemover"));
const ScreenshotBeautifier = lazy(() => import("@/pages/ScreenshotBeautifier"));
const FaviconGenerator     = lazy(() => import("@/pages/FaviconGenerator"));
const TargetSizeCompressor = lazy(() => import("@/pages/TargetSizeCompressor"));
const ExifStripper         = lazy(() => import("@/pages/ExifStripper"));
const ColorPicker          = lazy(() => import("@/pages/ColorPicker"));
const NotFound             = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const SHORTCUT_MAP: Record<string, string> = {
  "1": "/image-compressor",
  "2": "/image-converter",
  "3": "/pdf-converter",
  "4": "/qr-generator",
  "5": "/text-cleaner",
  "6": "/whatsapp-link",
  "s": "/settings",
  "S": "/settings",
  "h": "/",
  "H": "/",
};

function KeyboardShortcuts() {
  const [, navigate] = useLocation();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const route = SHORTCUT_MAP[e.key];
      if (route) { e.preventDefault(); navigate(route); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);
  return null;
}

function Router() {
  return (
    <Layout>
      <KeyboardShortcuts />
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/"                  component={Home} />
          <Route path="/image-compressor"  component={ImageCompressor} />
          <Route path="/image-converter"   component={ImageConverter} />
          <Route path="/pdf-converter"     component={PdfConverter} />
          <Route path="/qr-generator"      component={QrGenerator} />
          <Route path="/text-cleaner"      component={TextCleaner} />
          <Route path="/whatsapp-link"     component={WhatsappLink} />
          <Route path="/image-resizer"     component={ImageResizer} />
          <Route path="/image-cropper"        component={ImageCropper} />
          <Route path="/password-generator"  component={PasswordGenerator} />
          <Route path="/unit-converter"       component={UnitConverter} />
          <Route path="/color-palette"       component={ColorPalette} />
          <Route path="/heic-converter"      component={HeicConverter} />
          <Route path="/e-signature"         component={ESignature} />
          <Route path="/ocr-tool"            component={OcrTool} />
          <Route path="/pdf-annotator"       component={PdfAnnotator} />
          <Route path="/resume-builder"          component={ResumeBuilder} />
          <Route path="/background-remover"    component={BackgroundRemover} />
          <Route path="/screenshot-beautifier" component={ScreenshotBeautifier} />
          <Route path="/favicon-generator"     component={FaviconGenerator} />
          <Route path="/target-compressor"     component={TargetSizeCompressor} />
          <Route path="/exif-stripper"         component={ExifStripper} />
          <Route path="/color-picker"          component={ColorPicker} />
          <Route path="/settings"          component={Settings} />
          <Route path="/privacy-policy"    component={PrivacyPolicy} />
          <Route path="/terms"             component={TermsConditions} />
          <Route path="/faq"               component={FAQ} />
          <Route                           component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
