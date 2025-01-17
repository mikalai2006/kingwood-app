import { playSoundMessage } from "@/utils/sound";
import { notification, NotificationPlacement } from "ant-design-vue";
import { useI18n } from "vue-i18n";

export default function () {
  const [api, contextHolder] = notification.useNotification();

  const { t } = useI18n();

  const onShowNotify = (
    description: string,
    title?: string,
    type?: "success" | "info" | "warning" | "error",
    placement?: NotificationPlacement,
    duration?: number
  ) => {
    type = type || "info";
    notification[type]({
      message: title || t(`notify.${type}`),
      description,
      placement: placement || "bottomRight",
      duration: duration || 0,
    });

    playSoundMessage();
  };

  return {
    onShowNotify,
    contextHolder,
  };
}
