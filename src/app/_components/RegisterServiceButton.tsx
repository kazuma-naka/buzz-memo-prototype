"use client";

import { useState } from "react";
import { createClient } from "@/lib/client";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type RegisterServiceButtonProps = {
  userId: string | undefined;
  userEmail: string;
  onRegistered?: () => void;
};

export default function RegisterServiceButton({
  userId,
  userEmail,
  onRegistered,
}: RegisterServiceButtonProps) {
  const [open, setOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [serviceUrl, setServiceUrl] = useState("");
  const [nameError, setNameError] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleSubmit = async () => {
    let hasError = false;

    if (!serviceName.trim()) {
      setNameError("サービス名を入力してください。");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!serviceUrl.trim()) {
      setUrlError("Pathを入力してください。");
      hasError = true;
    } else {
      setUrlError("");
    }

    if (hasError) return;

    const { data: existing, error: selectError } = await createClient()
      .from("services")
      .select("id")
      .eq("path", serviceUrl)
      .maybeSingle();

    const { count, error: countError } = await createClient()
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("created_user_id", userId);

    if (countError) {
      console.error("Count check failed:", countError.message);
      return;
    }

    if ((count ?? 0) >= 2) {
      setUrlError("サービスの登録は2件までです。");
      return;
    }

    if (selectError) {
      console.error("Check failed:", selectError.message);
      return;
    }

    if (existing) {
      setUrlError("このPathは既に登録されています。");
      return;
    }

    const { error } = await createClient()
      .from("services")
      .insert([
        {
          created_user_id: userId,
          title: serviceName,
          path: serviceUrl,
          user_email: userEmail,
        },
      ]);

    if (error) {
      console.error("Insert failed:", error.message);
      return;
    }

    setServiceName("");
    setServiceUrl("");
    setOpen(false);

    if (onRegistered) onRegistered();
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setNameError("");
          setUrlError("");
          setServiceName("");
          setServiceUrl("");
        }
      }}
    >
      <DrawerTrigger asChild>
        <button className="h-12 max-w-xs bg-[#2E4A5A] text-[#F8F9FA] hover:text-[#B0BCC2] text-xl font-bold cursor-pointer rounded-md border border-[#222222] shadow-lg">
          サービスの新規登録
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-w-lg mx-auto flex flex-col gap-4 h-auto bg-[#2E4A5A] text-[#F8F9FA] px-8 pb-8">
        <DrawerHeader>
          <DrawerTitle className="text-[#F8F9FA] font-bold">
            サービス登録
          </DrawerTitle>
          <DrawerDescription className="text-[#B0BCC2]">
            <>
              <span>
                登録したいサービスの名前とページIDを入力してください。
              </span>
              <span className="block text-sm text-red-500">
                ※ページIDは後から変更できませんのでご注意ください。
              </span>
            </>
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="serviceName" className="mb-2">
              サービス名
            </Label>
            <Input
              id="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="例: Buzz Memo"
            />
            {nameError && (
              <span className="text-[#A05A5A] text-sm">{nameError}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="serviceUrl" className="mb-2">
              ページID
            </Label>
            <Input
              id="serviceUrl"
              type="url"
              value={serviceUrl}
              onChange={(e) => setServiceUrl(e.target.value)}
              placeholder="例: buzzmemo.com/buzz_memo"
            />
            {urlError && (
              <span className="text-red-400 text-sm">{urlError}</span>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            className="bg-[#FFCF56] text-[#222222] w-[50%] mx-auto mt-2"
          >
            登録する
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
