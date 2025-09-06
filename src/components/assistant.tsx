"use client";

import { useAssistant } from "@/hooks/use-assistant";
import { AssistantUI } from "@/components/assistant-ui";

export function Assistant() {
  const assistantProps = useAssistant();
  return <AssistantUI {...assistantProps} />;
}
