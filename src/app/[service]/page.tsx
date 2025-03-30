import { auth } from "@/auth";
import Header from "@/components/Header";
import { createClient } from "@/lib/server";
import BookmarkList from "./_components/BookmarkList";
import BookmarkListNotLoggedIn from "./_components/BookmarkListNotLoggedIn";

type Props = {
  params: {
    service: string;
  };
};

export default async function ServicePage({ params }: Props) {
  const servicePath = params.service;
  const session = await auth();
  const supabase = await createClient();
  
  if (session) {
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id")
      .eq("path", servicePath)
      .maybeSingle();

    const { data: bookmarksData, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select(
        `
        title,
        last_updated_user_id,
        description,
        favicon_url,
        twitter_image_url,
        uploaded_date,
        is_visible,
        memo,
        url,
        created_at,
        updated_at
      `
      )
      .eq("service_id", services?.id);

    const bookmarks = bookmarksData ?? [];
    return (
      <div>
        <Header />
        <BookmarkListNotLoggedIn bookmarks={bookmarks} />
      </div>
    );
  } else {
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id")
      .eq("path", servicePath)
      .maybeSingle();

    const { data: bookmarksData, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select(
        `
        title,
        description,
        favicon_url,
        twitter_image_url,
        uploaded_date,
        is_visible,
        url
      `
      )
      .eq("service_id", services?.id);

    const bookmarks = bookmarksData ?? [];
    return (
      <div>
        <Header />
        <BookmarkList bookmarks={bookmarks} />
      </div>
    );
  }
}
