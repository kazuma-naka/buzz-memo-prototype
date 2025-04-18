/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Bookmark = {
  title: string;
  description: string;
  favicon_url: string;
  twitter_image_url: string;
  url: string;
  uploaded_date: string;
};

interface BookmarkListNotLoggedInProps {
  bookmarks: Bookmark[];
}

export default function BookmarkListNotLoggedIn({
  bookmarks,
}: BookmarkListNotLoggedInProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const prevRef = React.useRef<HTMLButtonElement>(null);
  const nextRef = React.useRef<HTMLButtonElement>(null);

  const sortedBookmarks = [...bookmarks].sort(
    (a, b) =>
      new Date(b.uploaded_date).getTime() - new Date(a.uploaded_date).getTime()
  );

  const handleNext = React.useCallback(() => {
    setActiveIndex((prev) => {
      // If at the last item, do not change index.
      if (prev === sortedBookmarks.length - 1) {
        return prev;
      }
      return prev + 1;
    });
    // Optionally trigger the carousel button click only when moving.
    if (activeIndex !== sortedBookmarks.length - 1) {
      nextRef.current?.click();
    }
  }, [activeIndex, sortedBookmarks.length]);

  const handlePrev = React.useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === 0) {
        return prev;
      }
      return prev - 1;
    });
    if (activeIndex !== 0) {
      prevRef.current?.click();
    }
  }, [activeIndex]);

  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        handleNext();
      } else if (e.deltaY < 0) {
        handlePrev();
      }
    };

    const node = carouselRef.current;
    if (node) {
      node.addEventListener("wheel", handleWheel, { passive: true });
    }
    return () => {
      if (node) {
        node.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleNext, handlePrev, sortedBookmarks.length]);

  return (
    <div ref={carouselRef} className="w-full max-w-3xl mx-auto mt-6 font-bold">
      <span className="text-[#222222]">
        {
          new Date(sortedBookmarks[activeIndex]?.uploaded_date)
            .toISOString()
            .split("T")[0]
        }
      </span>

      <Carousel>
        <CarouselContent>
          {sortedBookmarks.map((bookmark, index) => (
            <CarouselItem key={index} className="p-4">
              <div className="rounded-xl shadow-md p-4 bg-[#2E4A5A] space-y-2 ">
                <div className="flex items-center gap-3 pt-4 px-4">
                  {bookmark.favicon_url && (
                    <img
                      src={bookmark.favicon_url}
                      alt="favicon"
                      width={40}
                      height={40}
                      className="rounded"
                    />
                  )}
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold hover:underline text-[#E0E1DD]"
                  >
                    {bookmark.title}
                  </a>
                </div>
                {bookmark.twitter_image_url && (
                  <div className="flex justify-center pt-4">
                    <img
                      src={bookmark.twitter_image_url}
                      alt="preview"
                      className="w-120 h-60 rounded-lg object-cover"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground py-4 px-4 text-[#CED4DA]">
                  {bookmark.description}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious ref={prevRef} />
        <CarouselNext ref={nextRef} />
      </Carousel>
    </div>
  );
}
