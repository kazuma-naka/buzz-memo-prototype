import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ListItemInviteButton, ListItemDeleteButton } from "./ListItemButton";

type ItemProps = {
  texts: string[];
  onInviteClick: (index: number) => void;
  onDeleteClick: (index: number) => void;
  isShowDeleteButton: boolean;
};

export const HorizontalItem = ({
  texts,
  onInviteClick,
  onDeleteClick,
  isShowDeleteButton,
}: ItemProps) => {
  return (
    <Card className="bg-[#91AFBB] transition-transform border border-[#91AFBB]">
      <CardContent className="flex flex-col gap-y-6 bg-[#91AFBB] text-[#F8F9FA] font-semibold text-lg">
        {texts.map((text, i) => (
          <div
            key={i}
            className="flex justify-around items-center gap-4 whitespace-nowrap"
          >
            <Link href={`/${text.toLowerCase().replaceAll(" ", "_")}`}>
              <span className="w-40 truncate inline-block text-left text-xl cursor-pointer hover:underline">
                {text}
              </span>
            </Link>
            <div className="flex justify-around items-center gap-6">
              {isShowDeleteButton && (
                <ListItemInviteButton
                  onClick={() => onInviteClick(i)}
                  buttonText="招待する"
                />
              )}
              <ListItemDeleteButton
                onClick={() => onDeleteClick(i)}
                buttonText="削除する"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
