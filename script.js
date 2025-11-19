let model;
const imageInput = document.getElementById("imageInput");
const scanBtn = document.getElementById("scanBtn");
const resultsDiv = document.getElementById("results");

// โหลดโมเดลจากโฟลเดอร์ my_model
async function loadModel() {
  try {
    resultsDiv.innerHTML = "<p>กำลังโหลดโมเดล...</p>";
    model = await tf.loadLayersModel("my_model/model.json");
    resultsDiv.innerHTML = "<p>✅ โหลดโมเดลสำเร็จ พร้อมสแกนภาพ!</p>";
  } catch (err) {
    resultsDiv.innerHTML = "<p style='color:red;'>❌ โหลดโมเดลไม่สำเร็จ ตรวจสอบว่า my_model/model.json อยู่ในโฟลเดอร์เดียวกับ index.html</p>";
    console.error(err);
  }
}

loadModel();

scanBtn.addEventListener("click", async () => {
  const files = imageInput.files;
  if (!files.length) {
    alert("กรุณาเลือกรูปก่อนครับ");
    return;
  }
  if (!model) {
    alert("โมเดลยังโหลดไม่เสร็จ รอสักครู่...");
    return;
  }

  resultsDiv.innerHTML = "";

  for (const file of files) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => (img.onload = resolve));

    const tensor = tf.browser
      .fromPixels(img)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims();

    const prediction = await model.predict(tensor).data();
    const labelIndex = prediction.indexOf(Math.max(...prediction));

    const label = labelIndex === 0 ? "🍎 Apple" : "🍌 Banana";
    const confidence = Math.max(...prediction) * 100;

    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <img src="${img.src}">
      <div class="label">${label}</div>
      <div class="confidence">ความมั่นใจ: ${confidence.toFixed(2)}%</div>
    `;
    resultsDiv.appendChild(card);

    tensor.dispose();
  }
});
