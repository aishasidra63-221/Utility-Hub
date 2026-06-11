import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import ImageCompressor from "@/pages/ImageCompressor";
import PdfConverter from "@/pages/PdfConverter";
import QrGenerator from "@/pages/QrGenerator";
import TextCleaner from "@/pages/TextCleaner";
import WhatsappLink from "@/pages/WhatsappLink";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/image-compressor" component={ImageCompressor} />
        <Route path="/pdf-converter" component={PdfConverter} />
        <Route path="/qr-generator" component={QrGenerator} />
        <Route path="/text-cleaner" component={TextCleaner} />
        <Route path="/whatsapp-link" component={WhatsappLink} />
        <Route component={NotFound} />
      </Switch>
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
