<script setup lang="ts" async>
import { computed, onMounted, ref } from "vue";
import dayjs from "@/utils/dayjs";

import { useI18n } from "vue-i18n";

import FinancyPane from "@/components/Financy/FinancyPane.vue";
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import { Colors } from "@/utils/colors";
import { useGeneralStore } from "@/store";

dayjs.locale("ru");

const generalStore = useGeneralStore();

const { t } = useI18n();

const activeKey = ref("");
const panes = ref<IPaneOptionFinancy[]>([]);

const newTabIndex = ref(0);

const nameKeyLocalStorage = computed(() => `financy.panes`);

const onSavePanes = () => {
  localStorage.setItem(nameKeyLocalStorage.value, JSON.stringify(panes.value));
};

const onChangeTabPane = (option: IPaneOptionFinancyInput) => {
  const _index = panes.value.findIndex((x) => x.key == option.key);
  if (_index != -1) {
    panes.value[_index] = Object.assign({}, panes.value[_index], option);
    onSavePanes();
  }
};

const add = () => {
  let nextIndex = (panes.value[panes.value.length - 1]?.index || 0) + 1;
  activeKey.value = `newTab${nextIndex}`;
  panes.value.push({
    title: t("form.financy.newReport"),
    key: activeKey.value,
    index: nextIndex,
  });
};

const remove = (targetKey: string) => {
  let lastIndex = 0;
  panes.value.forEach((pane, i) => {
    if (pane.key === targetKey) {
      lastIndex = i - 1;
    }
  });
  panes.value = panes.value.filter((pane) => pane.key !== targetKey);
  if (panes.value.length && activeKey.value === targetKey) {
    if (lastIndex >= 0) {
      activeKey.value = panes.value[lastIndex].key;
    } else {
      activeKey.value = panes.value[0].key;
    }
  }
  onSavePanes();
};

const onEdit = (targetKey: string | MouseEvent, action: string) => {
  if (action === "add") {
    add();
  } else {
    remove(targetKey as string);
  }
};

onMounted(async () => {
  const _panes = localStorage.getItem(nameKeyLocalStorage.value);
  if (_panes) {
    const _panesData: IPaneOptionFinancy[] = JSON.parse(_panes);

    panes.value = _panesData.sort((a, b) => a.index - b.index);
    activeKey.value = panes.value[0]?.key || "";
    newTabIndex.value = panes.value.length;
  }
});
</script>

<template>
  <div class="flex-auto overflow-hidden max-h-screen">
    <VHeader :title="$t('page.financyWorker.title')">
      <template #back>&nbsp;</template>
    </VHeader>
    <div class="flex-auto">
      <a-tabs
        v-model:activeKey="activeKey"
        type="editable-card"
        hide-add
        :tabBarGutter="2"
        destroyInactiveTabPane
        :tabBarStyle="{
          position: 'sticky',
          top: 0,
          'padding-left': '15px',
          margin: '0px',
          'z-index': 50,
          background:
            generalStore.themeMode === 'dark' ? Colors.g[951] : Colors.s[200],
        }"
        @edit="onEdit"
      >
        <template #leftExtra>
          <div class="p-2">
            <a-button
              class="tabs-extra-demo-button"
              type="primary"
              @click="add"
            >
              {{ $t("form.financy.addReport") }}
            </a-button>
          </div>
        </template>
        <a-tab-pane
          v-for="pane in panes"
          :key="pane.key"
          :tab="pane.title"
          :closable="pane.closable"
        >
          <FinancyPane :pane="pane" @onChangeTabPane="onChangeTabPane" />
        </a-tab-pane>
      </a-tabs>
    </div>
    <!-- <div class="flex flex-row">
        <div
          v-for="i in countDays"
          :key="i"
          class="p-2 text-center w-16 border-r border-b border-s-100 dark:border-g-700"
        >
          <template v-if="listDataGroupDays[i]">
            order
            {{ listDataGroupDays[i].reduce((a, b) => a + b.totalMinutes, 0) }}
            <a-divider />
            work
            {{
              listDataGroupDays[i].reduce(
                (a, b) => a + dayjs(b.to).diff(b.from, "minutes"),
                0
              )
            }}
          </template>
        </div>
      </div> -->
  </div>
  <!-- 
  <a-modal
    v-model:open="openTaskWorker"
    :key="`${dataFormTaskWorker?.id}_${dataFormTaskWorker.from}`"
    :title="
      dataFormTaskWorker.id
        ? $t('form.taskWorker.edit')
        : $t('form.taskWorker.new')
    "
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    @ok="
      () => {
        openTaskWorker = false;
      }
    "
  >
    <VFormTaskWorker
      :data="dataFormTaskWorker"
      :default-data="defaultDataTaskWorker"
      @callback="
        () => {
          openTaskWorker = false;
        }
      "
    />
  </a-modal> -->
</template>
