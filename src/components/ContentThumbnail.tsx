"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { mediaUrl } from "@/lib/api";

export default function ContentThumbnail({
  src,
  title,
  className = "",
  sizes = "80px",
}: {
  src?: string;
  title: string;
  className?: string;
  sizes?: string;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-[#eef4f8] ${className}`}
    >
      {src && failedSource !== src ? (
        <Image
          src={mediaUrl(src)}
          alt={title}
          fill
          sizes={sizes}
          className="content-card-image object-cover"
          onError={() => setFailedSource(src)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-sky-300"
          aria-label="Sin imagen"
        >
          <ImageIcon size={25} strokeWidth={1.4} />
        </div>
      )}
    </div>
  );
}
