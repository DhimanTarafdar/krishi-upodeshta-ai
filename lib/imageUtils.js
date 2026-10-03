export function prepareImage(file, max = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const url = c.toDataURL("image/jpeg", 0.85);
      resolve({ preview: url, base64: url.split(",")[1], mime: "image/jpeg" });
    };
    img.onerror = () => reject(new Error("ছবি খোলা যায়নি"));
    img.src = URL.createObjectURL(file);
  });
}
