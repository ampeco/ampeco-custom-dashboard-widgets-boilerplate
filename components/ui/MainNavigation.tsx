"use client";

import { Tabs, Tab } from "@ampeco/ampeco-ui";
import { usePathname, useRouter } from "next/navigation";
import { preserveToken } from "@/lib/utils/preserve-token";

export function MainNavigation({ token }: { token: string | null }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Tabs
      selected={pathname.split("/").pop()}
      onSelectedChange={(value) =>
        router.push(preserveToken(`/${value}`, token))
      }
    >
      <Tab id="dashboard" title="Dashboard" />
      <Tab id="listings" title="Listings" />
      <Tab id="form" title="Form Demo" />
      <Tab id="edit-charge-point" title="Edit Charge Point" />
    </Tabs>
  );
}
