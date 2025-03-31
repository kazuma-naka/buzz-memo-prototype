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

  const sortedBookmarks = [...bookmarks].sort(
    (a, b) =>
      new Date(b.uploaded_date).getTime() - new Date(a.uploaded_date).getTime()
  );

  // New click handler to set form data from the clicked bookmark
  const handleItemClick = (bookmark: Bookmark) => {
    setFormData(bookmark);
    setSheetOpen(true);
  };

  const handleNext = React.useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === sortedBookmarks.length - 1) {
        return prev;
      }
      return prev + 1;
    });
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
  }, [handleNext, handlePrev]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    setFormData({
      ...formData,
      [textarea.name]: textarea.value,
    });
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
        <span>
          {sortedBookmarks[activeIndex]?.uploaded_date
            ? new Date(sortedBookmarks[activeIndex].uploaded_date)
                .toISOString()
                .split("T")[0]
            : "ブックマークがありません。"}
        </span>

        <Carousel>
          <CarouselContent className="cursor-pointer">
            {sortedBookmarks.map((bookmark, index) => (
              <CarouselItem
                key={index}
                className="p-4"
                onClick={() => handleItemClick(bookmark)}
              >
                <div className="rounded-xl shadow-md p-4 bg-[#2E4A5A] space-y-2">
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      {bookmark.title}
                    </a>
                    <Image
                      src="/file.svg"
                      alt="ブックマークのメモ"
                      width={32}
                      height={32}
                      className="ml-6"
                    />
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
                value={formData.uploaded_date.split("T")[0] || ""} // Use formData here
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
