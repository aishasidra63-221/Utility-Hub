import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";

const Home = lazy(() => import("@/pages/Home"));
const ImageCompressor = lazy(() => import("@/pages/ImageCompressor"));
const ImageConverter = lazy(() => import("@/pages/ImageConverter"));
const PdfConverter = lazy(() => import("@/pages/PdfConverter"));
const QrGenerator = lazy(() => import("@/pages/QrGenerator"));
const TextCleaner = lazy(() => import("@/pages/TextCleaner"));
const WhatsappLink = lazy(() => import("@/pages/WhatsappLink"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/image-compressor" component={ImageCompressor} />
          <Route path="/image-converter" component={ImageConverter} />
          <Route path="/pdf-converter" component={PdfConverter} />
          <Route path="/qr-generator" component={QrGenerator} />
          <Route path="/text-cleaner" component={TextCleaner} />
          <Route path="/whatsapp-link" component={WhatsappLink} />
          <Route component={NotFound} />
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
