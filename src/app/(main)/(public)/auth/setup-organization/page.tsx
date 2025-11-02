import Link from "next/link";
import { IconWorld } from "@tabler/icons-react";
import { APP_CONFIG } from "@/config/app-config";
import { OrganizationSetupForm } from "../_components/organization-setup-form";

export default function SetupOrganizationPage() {
  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium">Set Up Your Organization</h1>
          <p className="text-muted-foreground text-sm">
            Create or select an organization to get started with Lending OS.
          </p>
        </div>
        <div className="space-y-4">
          <OrganizationSetupForm />
        </div>
      </div>
      <div className="absolute top-5 flex w-full justify-end px-10">
        <div className="text-muted-foreground text-sm">
          Already have access?{" "}
          <Link className="text-foreground" href="/auth/v2/login">
            Sign In
          </Link>
        </div>
      </div>
      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
        <div className="flex items-center gap-1 text-sm">
          <IconWorld size={20} stroke={2} className="text-muted-foreground" />
          ENG
        </div>
      </div>
    </>
  );
}
