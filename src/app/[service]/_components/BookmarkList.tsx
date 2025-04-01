/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Bookmark = {
  title: string;
  description: string;
  favicon_url: string;
  twitter_image_url: string;
  url: string;
  uploaded_date: string;
  id: string;
  memo: string;
};

interface Bookmarks {
  bookmarks: Bookmark[];
}

export default function BookmarkList({ bookmarks }: Bookmarks) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    id: "",
    title: "",
    description: "",
    url: "",
    favicon_url: "",
    twitter_image_url: "",
    uploaded_date: "",
  });

  const router = useRouter();
  const supabase = createClient();

  const carouselRef = React.useRef<HTMLDivElement>(null);
  const prevRef = React.useRef<HTMLButtonElement>(null);
  const nextRef = React.useRef<HTMLButtonElement>(null);

  // Memoize sorted bookmarks to avoid re-sorting on every render.
  const sortedBookmarks = React.useMemo(() => {
    return [...bookmarks].sort(
      (a, b) =>
        new Date(b.uploaded_date).getTime() -
        new Date(a.uploaded_date).getTime()
    );
  }, [bookmarks]);

  // Set form data and open the edit sheet when an item is clicked.
  const handleItemClick = (bookmark: Bookmark) => {
    setFormData(bookmark);
    setSheetOpen(true);
  };

  const handleNext = React.useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === sortedBookmarks.length - 1) return prev;
      return prev + 1;
    });
    if (activeIndex !== sortedBookmarks.length - 1) {
      nextRef.current?.click();
    }
  }, [activeIndex, sortedBookmarks.length]);

  const handlePrev = React.useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === 0) return prev;
      return prev - 1;
    });
    if (activeIndex !== 0) {
      prevRef.current?.click();
    }
  }, [activeIndex]);

  // Throttle wheel event with requestAnimationFrame.
  React.useEffect(() => {
    let accumulatedDelta = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleWheel = (e: WheelEvent) => {
      accumulatedDelta += e.deltaY;

      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          if (accumulatedDelta > 32) {
            handleNext();
          } else if (accumulatedDelta < -32) {
            handlePrev();
          }
          accumulatedDelta = 0;
          timeoutId = null;
        }, 50);
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
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleNext, handlePrev]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    setFormData((prev) => ({ ...prev, [textarea.name]: textarea.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Uploading bookmark:", formData);

    const { error } = await supabase
      .from("bookmarks")
      .update({
        title: formData.title,
        description: formData.description,
        url: formData.url,
        favicon_url: formData.favicon_url,
        twitter_image_url: formData.twitter_image_url,
        uploaded_date: formData.uploaded_date,
      })
      .eq("id", formData.id);

    if (error) {
      console.error("Error updating bookmark:", error);
    } else {
      setSheetOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <div
        ref={carouselRef}
        className="w-full max-w-3xl mx-auto mt-6 font-bold"
      >
        <span className="text-2xl text-[#2E4A5A]">
          {sortedBookmarks[activeIndex]?.uploaded_date
            ? new Date(sortedBookmarks[activeIndex].uploaded_date)
                .toISOString()
                .slice(0, 7)
            : "ブックマークがありません。"}
        </span>

        <Carousel className="mt-4">
          <CarouselContent>
            {sortedBookmarks.map((bookmark, index) => (
              <CarouselItem key={index}>
                <div
                  className="rounded-xl shadow-md p-4 bg-[#2E4A5A] space-y-2 cursor-pointer"
                  onClick={() => handleItemClick(bookmark)}
                >
                  <Tabs defaultValue="details">
                    <TabsList
                      className="mx-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TabsTrigger
                        className=" text-md text-[#CED4DA] data-[state=active]:text-[#ffffff] data-[state=active]:bg-[#222222]"
                        value="details"
                      >
                        ブックマーク
                      </TabsTrigger>
                      <TabsTrigger
                        className=" text-md text-[#CED4DA] data-[state=active]:text-[#ffffff] data-[state=active]:bg-[#222222]"
                        value="memo"
                      >
                        メモ
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                      <div className="rounded-xl shadow-md bg-[#2E4A5A] space-y-2">
                        <div className="flex items-center gap-3 px-4">
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            {bookmark.title}
                          </a>
                        </div>
                        {bookmark.twitter_image_url && (
                          <div className="flex justify-center">
                            <img
                              src={bookmark.twitter_image_url}
                              alt="preview"
                              className="rounded-lg object-cover w-auto h-[30vh] mx-auto"
                            />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground py-4 px-4 text-[#CED4DA]">
                          {bookmark.description}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="memo">
                      <div className="rounded-xl shadow-md p-4 bg-[#2E4A5A] space-y-2">
                        <p className="text-sm text-muted-foreground py-4 px-4 text-[#CED4DA]">
                          {bookmark.memo || "空のメモです。"}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious ref={prevRef} />
          <CarouselNext ref={nextRef} />
        </Carousel>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-[#91AFBB] h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-[#222222]">
              ブックマークを編集
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-5 px-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <Textarea
                name="title"
                value={formData.title}
                onChange={handleChangeTextArea}
                className="content-center input mt-1 block w-full rounded-md px-4 bg-[#FFFFFF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChangeTextArea}
                className="input mt-1 block w-full rounded-md px-4 py-2 bg-[#FFFFFF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">URL</label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="input mt-1 block w-full rounded-md px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Favicon URL</label>
              <input
                type="text"
                name="favicon_url"
                value={formData.favicon_url}
                onChange={handleChange}
                className="input mt-1 block w-full rounded-md px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Twitter Image URL
              </label>
              <input
                type="text"
                name="twitter_image_url"
                value={formData.twitter_image_url}
                onChange={handleChange}
                className="input mt-1 block w-full rounded-md px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Uploaded Date</label>
              <input
                type="date"
                name="uploaded_date"
                value={formData.uploaded_date.split("T")[0] || ""}
                onChange={handleChange}
                className="input mt-1 block w-full rounded-md px-4 py-2"
              />
            </div>
            <button type="submit" className="btn w-full boarder">
              保存
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
