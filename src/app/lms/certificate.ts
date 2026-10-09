import logoUrl from "../../imports/WAVE (6).png";
// Render text with browser fonts so Sinhala and other Unicode names are preserved.
export async function certificatePdf(c: any, _settings: any = {}) {
  const [{ jsPDF }, { default: QRCode }] = await Promise.all([
    import("jspdf"),
    import("qrcode"),
  ]);
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 2376;
  canvas.height = 1680;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to generate certificate.");
  const ctx = context;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 2376, 1680);
  ctx.strokeStyle = "#245b4d";
  ctx.lineWidth = 7;
  ctx.strokeRect(96, 96, 2184, 1488);
  ctx.lineWidth = 2;
  ctx.strokeRect(128, 128, 2120, 1424);
  function text(value: string, y: number, size: number, bold = false) {
    ctx.font = `${bold ? "700" : "400"} ${size}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#245b4d";
    ctx.fillText(value, 1188, y, 1950);
  }
  const load = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("Unable to load certificate artwork."));
      img.src = src;
    });
  const logo = await load(logoUrl);
  ctx.drawImage(logo, 1116, 155, 144, 144);
  text("SKILLWAVE ACADEMY", 360, 48, true);
  text("CERTIFICATE OF COMPLETION", 530, 76, true);
  text("This certifies that", 690, 34);
  text(c.student_name, 840, 72, true);
  text("has successfully completed the final assessment for", 980, 32);
  text(c.course_title, 1100, 52, true);
  ctx.textAlign = "left";
  ctx.font = "28px sans-serif";
  ctx.fillText(
    "Issued: " + new Date(c.issued_at).toLocaleDateString("en-GB"),
    240,
    1310,
  );
  ctx.fillText(
    c.signatory || "Approved by SkillWave Superadmin",
    240,
    1390,
    1350,
  );
  if (c.signatory_title) ctx.fillText(c.signatory_title, 240, 1435, 1350);
  const url =
    (import.meta.env.VITE_SITE_URL || location.origin) + "/verify/" + c.id;
  ctx.drawImage(
    await load(await QRCode.toDataURL(url, { width: 300 })),
    1850,
    1220,
    230,
    230,
  );
  text("Certificate ID: " + c.id, 1510, 22);
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 297, 210);
  pdf.link(231, 152, 29, 29, { url });
  pdf.save("SkillWave-Certificate-" + c.id.slice(0, 8) + ".pdf");
}
