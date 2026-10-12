const params = new URLSearchParams(window.location.search);

if (params.get("alertJason") === "true") {
  alert("yes");
} else {
  console.log("yes");
}
