import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from "vite-plugin-dts";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),     dts({
    entryRoot: "./src",
    outputDir: ["dist"],
    //指定使用的tsconfig.json为我们整个项目根目录下,如果不配置,你也可以在components下新建tsconfig.json
    tsConfigFilePath: "./tsconfig.app.json",
  }),
 ],
  build: {
    //打包后文件目录
    outDir: "es",
    //压缩
    minify: false,
    rollupOptions: {
      //忽略打包vue文件
      external: ["vue"],
      //input: ["index.ts"],
      output: {
        globals: {
          vue: "Vue",
        },
        dir: "dist",
      },
    },
    lib: {
      entry: "./src/index.ts",
      name: "vue3-number-scroll",
      fileName: "vue3-number-scroll",
      formats: ["es", "umd", "cjs"],
    },

  },
})
