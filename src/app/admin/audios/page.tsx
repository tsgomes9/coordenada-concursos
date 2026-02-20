"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Headphones, Clock } from "lucide-react";

export default function AudiosPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition mb-4"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
        <div className="relative w-40 h-40 mx-auto mb-8">
          <div className="absolute inset-0 bg-orange-100 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Headphones className="w-20 h-20 text-orange-500" />
          </div>
        </div>

        <p className="text-xl text-gray-600 mb-4">Áudios e Podcasts</p>

        <div className="inline-flex items-center gap-2 text-orange-500 bg-orange-50 px-6 py-3 rounded-full">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Em desenvolvimento</span>
        </div>
      </div>
    </div>
  );
}
