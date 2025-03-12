<script setup lang="ts">
import { TimerData } from "@/api/types";
import { useI18n } from "vue-i18n";

export type TaskWorkerTimeProps = {
  time: TimerData;
  className?: string;
  short?: boolean;
  hideSeconds?: boolean;
};

defineProps<TaskWorkerTimeProps>();

const { t } = useI18n();
</script>

<template>
  <span>
    {{ time.days > 0 ? (!short ? time.days : time.days) : "" }}
    {{ time.days > 0 ? (!short ? t("time.days") + " " : ":") : "" }}
    {{ time.hours > 0 ? (!short ? time.hours0 : time.hours) : "" }}
    {{ time.hours > 0 ? (!short ? t("time.hours") + " " : ":") : "" }}
    {{
      !short && time.minutes > 0
        ? time.minutes
        : time.minutes > 0
        ? time.minutes0
        : ""
    }}
    {{
      !short && time.minutes > 0
        ? t("time.minutes") + " "
        : time.minutes > 0
        ? ":"
        : ""
    }}
    {{ !hideSeconds && time.seconds > 0 ? time.seconds0 : "" }}
    {{
      !hideSeconds && time.seconds > 0
        ? !short
          ? t("time.seconds") + " "
          : ""
        : ""
    }}
  </span>
</template>
