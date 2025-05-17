**Vue3函数式调用组件  createComponent**

== 调用结束要关闭 组件==

以调用 重写插槽为例

```
const openMonacoCode=async (row: TableColumnInfo)=>{
   //函数式组件 instance 为 ref , on 为 emit , unmount 为 destroy
   const { instance, on, unmount } = await  createComponent( MonacoCode, { modelValue: row.attrs,visible: true } )

   on('Change', (code:string) => {
    console.log(code);
     row.attrs = code;
   })
   on('update:visible', () => {
          unmount()
   })
}



```

**子组件内部 (monaco-code.vue)**

```
<script setup lang="tsx">
import type * as monaco from 'monaco-editor';
import { ref } from 'vue';
import { $t } from '@/locales';
import customRender from '@/utils/customRender';
const language = ref('javascript');

// 根据提示，将 defineModelValue 替换为 defineModel
const value = defineModel<string>({
  default: ''
});
const visible =defineModel<boolean>('visible', {
  default: false
})
interface Emits {
  (e: 'Change', value: string): void;

}
const emit = defineEmits<Emits>();
const columns = ref<Array<any>>([
  {
    type: 'selection',
    align: 'center'
  },
  {
    key: 'name',
    title: 'name',
    align: 'center'
    // render: row => {
    //   return h('p', Enum.MenuType[row.id]);
    // }
  }
]);

const editorMounted = (editor: monaco.editor.IStandaloneCodeEditor) => {
  editor.onDidChangeModelContent(() => {
    // const value = editor.getValue();
    // columns.value[2] = customRender(value || '', h, naive)[0];
  });
};
const title = ref('插槽编辑');

const handleSubmit = () => {
  emit('Change', value.value);
  visible.value = false;

};
const handleClose = () => {
  visible.value = false;
};
</script>

<template>
  <ElDialog v-model="visible" :title="title" :append-to-body="true" class="w-1400px" >
    <ElRow :gutter="24">
      <ElCol :span="24">
        <MonacoEditor
          v-bind="$attrs"
          v-model:value="value"
          :language="language"
          width="100%"
          height="650px"
          @editor-mounted="editorMounted"
        ></MonacoEditor>
      </ElCol>
    </ElRow>

    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="handleClose">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style lang="less" scoped></style>

```

**实现函数式组件 createComponent**

```
import { Component, createApp, DefineComponent, EmitsOptions } from "vue";

type Data = Record<string, unknown>;

/**
 * 推断组件的事件参数类型
 * @template T - 组件类型
 */
type EventParams<T> = T extends DefineComponent<any, any, any, any, any, any, any, infer Emits extends EmitsOptions>
  ? Emits extends Record<string, (...args: infer Args) => any>
    ? { [K in keyof Emits]: Parameters<Emits[K]> }
    : Emits extends string[]
      ? { [K in Emits[number]]: any[] }
      : { [key: string]: any[] }
  : { [key: string]: any[] };

/**
 * 创建一个 Vue 组件实例
 * @template T - 组件类型
 * @param {T} rootComponent - 要创建的根组件
 * @param {Data | null} [rootProps] - 传递给组件的 props
 * @returns {Promise<{
 *   instance: T;
 *   on: <K extends keyof EventParams<T>>(
 *     event: K,
 *     handler: (...args: EventParams<T>[K]) => void
 *   ) => void;
 *   unmount: () => void;
 * }>} - 返回包含组件实例、事件监听和卸载方法的对象
 */
async function createComponent<T extends Component>(
  rootComponent: T,
  rootProps?: Data | null
): Promise<{
  instance: T;
  on: <K extends keyof EventParams<T>>(
    event: K,
    handler: (...args: EventParams<T>[K]) => void
  ) => void;
  unmount: () => void;
}> {
  const mountNode = document.createElement('div');
  const app = createApp(rootComponent, rootProps);

  // 事件监听器存储
  const listeners = new Map<string, ((...args: any[]) => void)[]>();

  // 挂载实例
  const instance = app.mount(mountNode) as any;
  document.body.appendChild(mountNode);

  // 劫持 emit 方法
  const originalEmit = instance.$.emit;
  instance.$.emit = (event: string, ...args: any[]) => {
    originalEmit(event, ...args);
    listeners.get(event)?.forEach(fn => fn(...args));
  };

  return {
    instance: instance as T,
    on: (event, handler) => {
      const e = event as string;
      const h = handler as (...args: any[]) => void;
      const handlers = listeners.get(e) || [];
      listeners.set(e, [...handlers, h]);
    },
    unmount: () => {
      app.unmount();
      document.body.removeChild(mountNode);
      console.log("unmount");

    }
  };
}

export default createComponent;

```