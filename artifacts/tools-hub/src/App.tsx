import { lazy, Suspense, useEffect, Component, type ReactNode } from "react";
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
const WordCounter          = lazy(() => import("@/pages/WordCounter"));
const VideoToGif           = lazy(() => import("@/pages/VideoToGif"));
const PomodoroTimer        = lazy(() => import("@/pages/PomodoroTimer"));
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

interface EBState { hasError: boolean; error: Error | null }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-2xl">⚠️</div>
          <div>
            <p className="font-semibold text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground mt-1">
              {this.state.error?.message?.includes("Loading chunk")
                ? "Failed to load — please check your connection and refresh."
                : "An unexpected error occurred. Try refreshing the page."}
            </p>
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
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

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Layout>
      <KeyboardShortcuts />
      <ScrollToTop />
      <ErrorBoundary>
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
            <Route path="/word-counter"          component={WordCounter} />
            <Route path="/video-to-gif"          component={VideoToGif} />
            <Route path="/pomodoro-timer"        component={PomodoroTimer} />
            <Route path="/exif-stripper"         component={ExifStripper} />
            <Route path="/color-picker"          component={ColorPicker} />
            <Route path="/settings"          component={Settings} />
            <Route path="/privacy-policy"    component={PrivacyPolicy} />
            <Route path="/terms"             component={TermsConditions} />
            <Route path="/faq"               component={FAQ} />
            <Route                           component={NotFound} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
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
