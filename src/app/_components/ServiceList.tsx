"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ListItemInviteButton, ListItemDeleteButton } from "./ListItemButton";
import { useServices, deleteService } from "@/hooks/useServices";
import RegisterServiceButton from "./RegisterServiceButton";

type ServiceListProps = {
  userId: string;
  userEmail: string;
};

export default function ServiceList({ userId, userEmail }: ServiceListProps) {
  const { data: services, error, mutate } = useServices(userId);

  if (error) {
    return (
      <div className="text-red-500">エラーが発生しました: {error.message}</div>
    );
  }

  if (!services) {
    return <div className="text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col gap-6 ml-8">
      <RegisterServiceButton
        userId={userId}
        userEmail={userEmail}
        onRegistered={mutate}
      />
      <span className="text-lg text-[#1D343B] font-bold mt-6">
        登録したサービス
      </span>
      <Card className="bg-[#91AFBB] transition-transform border border-[#91AFBB]">
        <CardContent className="flex flex-col gap-y-6 bg-[#91AFBB] text-[#F8F9FA] font-semibold text-lg">
          {services.length === 0 ? (
            <span className="text-[#F8F9FA]">まだ登録されていません。</span>
          ) : (
            services.map((service, i) => (
              <div
                key={i}
                className="flex justify-around items-center gap-4 whitespace-nowrap"
              >
                <Link
                  href={`/${service.title.toLowerCase().replaceAll(" ", "_")}`}
                >
                  <span className="w-40 truncate inline-block text-left text-xl cursor-pointer hover:underline">
                    {service.title}
                  </span>
                </Link>
                <div className="flex justify-around items-center gap-6">
                  <ListItemInviteButton
                    onClick={() => {
                      console.log("invite");
                    }}
                    buttonText="招待する"
                  />
                  <ListItemDeleteButton
                    onClick={() => {
                      deleteService(service.path, userId);
                    }}
                    buttonText="削除する"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <span className="text-lg text-[#1D343B] font-bold mt-6">
        招待されたサービス
      </span>
      <Card className="bg-[#91AFBB] transition-transform border border-[#91AFBB]">
        <CardContent className="text-[#F8F9FA] text-lg">
          （まだありません）
        </CardContent>
      </Card>
    </div>
  );
}
