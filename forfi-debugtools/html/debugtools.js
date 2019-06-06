document.addEventListener("DOMContentLoaded", () => {

  const debugtools = document.getElementsByClassName("debugtools")[0];

  // Message Listener
  window.addEventListener("message", function(event) {
    const data = event.data;
    if (data && data.action) {
      if (data.action == "OPEN_TEXTBOX") {
        debugtools.style.display = "block";
        debugtools.getElementsByTagName("textarea")[0].value = data.text;
      }
    }
  });

  debugtools.getElementsByClassName("close")[0].addEventListener("click", (event) => {
    fetch("http://forfi-debugtools/debugtools:close", {
      method: "POST",
      body: "{}"
    });
    debugtools.style.display = "none";
  });

});