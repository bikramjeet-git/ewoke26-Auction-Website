import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        login: "login.html",
        register: "register.html",
        dashboard: "dashboard.html",
        dashboardhome: "dashboard-home.html",
        admin: "admin.html",
        team: "team.html"
      }
    }
  }
});