try {
  const raw = localStorage.getItem("vidora-ui")
  const theme = raw ? JSON.parse(raw).state.theme : "system"
  const dark =
    theme === "dark" ||
    (theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", dark)
  document.documentElement.style.colorScheme = dark ? "dark" : "light"
} catch {
  // Keep the default theme if stored preferences cannot be read.
}
