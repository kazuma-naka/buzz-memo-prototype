"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type ListItemButtonProps = {
  onClick: () => void;
  buttonText: string;
};

export const ListItemInviteButton: React.FC<ListItemButtonProps> = ({
  onClick,
  buttonText,
}) => {
  return (
    <Button
      className="w-16 hover:shadow-lg text-[#1D343B] bg-[#91AFBB] border border-[#222222]"
      onClick={onClick}
    >
      {buttonText}
    </Button>
  );
};

export const ListItemDeleteButton: React.FC<ListItemButtonProps> = ({
  onClick,
  buttonText,
}) => {
  return (
    <Button
      className="w-16 hover:shadow-lg text-[#A05A5A] bg-[#91AFBB]  border border-[#222222]"
      onClick={onClick}
    >
      {buttonText}
    </Button>
  );
};
