export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/ui",
  ],
  app: {
    baseURL: "/",
    head: {
      title: "Echo Browser",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
  css: ["@/assets/css/global.css"],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ["webview"].includes(tag),
    },
  },
});
