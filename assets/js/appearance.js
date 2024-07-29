const sitePreference = document.documentElement.getAttribute("data-default-appearance");
const userPreference = localStorage.getItem("appearance");

if ((sitePreference === "dark" && userPreference === null) || userPreference === "dark") {
  document.documentElement.classList.add("dark");
}

if (document.documentElement.getAttribute("data-auto-appearance") === "true") {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches &&
    userPreference !== "light"
  ) {
    document.documentElement.classList.add("dark");
  }
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (event.matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });
}

window.addEventListener("DOMContentLoaded", (event) => {
  const switcher = document.getElementById("appearance-switcher");
  const switcherMobile = document.getElementById("appearance-switcher-mobile");
  const lightModeCSS = document.getElementById("light-mode-css");
  const darkModeCSS = document.getElementById("dark-mode-css");

  function updateAppearance(targetAppearance) {
    document.documentElement.classList.toggle("dark", targetAppearance === "dark");
    lightModeCSS.disabled = targetAppearance === "dark";
    darkModeCSS.disabled = targetAppearance === "light";
    localStorage.setItem("appearance", targetAppearance);
    updateMeta();
    this.updateLogo?.(targetAppearance);
  }

  function toggleAppearance() {
    const targetAppearance = getTargetAppearance() === "dark" ? "light" : "dark";
    updateAppearance(targetAppearance);
  }

  function handleContextMenu(event) {
    event.preventDefault();
    localStorage.removeItem("appearance");
    updateAppearance(getTargetAppearance());
  }

  // 初始化
  updateAppearance(getTargetAppearance());

  if (switcher) {
    switcher.addEventListener("click", toggleAppearance);
    switcher.addEventListener("contextmenu", handleContextMenu);
  }

  if (switcherMobile) {
    switcherMobile.addEventListener("click", toggleAppearance);
    switcherMobile.addEventListener("contextmenu", handleContextMenu);
  }
});


var updateMeta = () => {
  var elem, style;
  elem = document.querySelector('body');
  style = getComputedStyle(elem);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', style.backgroundColor);
}

{{ if and (.Site.Params.Logo) (.Site.Params.SecondaryLogo) }}
{{ $primaryLogo := resources.Get .Site.Params.Logo }}
{{ $secondaryLogo := resources.Get .Site.Params.SecondaryLogo }}
{{ if and ($primaryLogo) ($secondaryLogo) }}
var updateLogo = (targetAppearance) => {
  var elems;
  elems = document.querySelectorAll("img.logo")
  targetLogoPath = 
    targetAppearance == "{{ .Site.Params.DefaultAppearance }}" ?
    "{{ $primaryLogo.RelPermalink }}" : "{{ $secondaryLogo.RelPermalink }}"
  for (const elem of elems) {
    elem.setAttribute("src", targetLogoPath)
  }
}
{{ end }}
{{- end }}

var getTargetAppearance = () => {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

window.addEventListener("DOMContentLoaded", (event) => {
  const scroller = document.getElementById("top-scroller");
  const footer = document.getElementById("site-footer");
  if(scroller && footer && scroller.getBoundingClientRect().top > footer.getBoundingClientRect().top) {
    scroller.hidden = true;
  }
});
