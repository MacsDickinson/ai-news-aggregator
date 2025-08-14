import type { MetaFunction } from "@remix-run/node";
import { createLogger } from "@shared/utils/logger";

export const meta: MetaFunction = () => {
  return [
    { title: "AI News Commentator" },
    { name: "description", content: "AI-driven platform that curates news from RSS feeds and APIs" },
  ];
};

export default function Index() {
  const logger = createLogger('frontend');
  logger.debug('Rendering index route');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            AI News Commentator
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            AI-driven platform that curates news from RSS feeds and APIs, provides AI-powered elaborations with strict attribution, and enables personal commentary capture.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/feed"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              View Feed
            </a>
            <a
              href="/settings"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Settings <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900">Curated Feed</h3>
            <p className="mt-2 text-gray-600">Get news from RSS feeds and APIs with trust scoring</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900">AI Elaboration</h3>
            <p className="mt-2 text-gray-600">One-click summaries with citations and takeaways</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900">Personal Commentary</h3>
            <p className="mt-2 text-gray-600">Capture your POV through guided Q&A</p>
          </div>
        </div>
      </div>
    </div>
  );
}