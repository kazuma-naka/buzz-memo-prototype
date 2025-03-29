import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Bookmark",
  description: "公開ブックマーク作成サービス",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-[#91AFBB]">
        <main>{children}</main>
      </body>
    </html>
  );
}
