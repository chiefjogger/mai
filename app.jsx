import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import {
  Camera, Phone, FolderClosed, Check, ShieldCheck, Banknote, FileText, Car,
  GraduationCap, Syringe, Zap, ScanFace, ArrowUp, ChevronRight, ChevronLeft,
  BadgeCheck, ShieldAlert, ArrowBigUp, MessageCircle, Hash, ShoppingCart, Mic,
  TriangleAlert, Music, Ticket, X, Plus, Minus, Clock, MapPin, Bell, Download,
  CircleAlert, Sparkles, Wallet, CreditCard, Store, PhoneOff, Flag, Users,
} from "lucide-react";
import { matchMai, pickFallback, fold, GREETING_CHIPS } from "./brain.js";

// ————————————————————————————————————————————————————————————
// m.ai · v19 · trợ lý riêng nằm trong tin nhắn: việc nhà, việc cơ quan, hội nhóm.
// Bản demo kể một buổi chiều của nhà anh Hải, nhưng sản phẩm không chỉ cho gia đình.
// Mọi thứ chạm được đều mở một luồng 6–7 bước thật:
// trả học bơi (7) · đón Bin (6) · đơn dã ngoại (7) · giỏ WinMart+ (7)
// vé concert (7) · sang nhượng vé escrow (6) · đăng kiểm (6) · cuộc gọi giả (6)
// Cộng: bài kênh → bình luận → hồ sơ người đăng · hồ sơ nhà → chi tiết từng giấy tờ.
// Mai trả lời bằng bộ não tại chỗ trong brain.js: không gọi mạng, không chờ,
// và câu nào cũng đẻ ra gợi ý kế tiếp để anh đi hết demo mà không cần gõ.
// Không có cú chạm nào chết.
// ————————————————————————————————————————————————————————————

const T = {
  ink: "#241F1A", sub: "#6E665C", faint: "#A79E92", hair: "#E9E2D6",
  bg: "#F7F4ED", surf: "#FFFDF9", brand: "#C2552F", brandSoft: "#FBEDE4",
  brandInk: "#9C3F1F", dark: "#2C2822", green: "#1B7A4E", greenBg: "#E6F4EC",
  amber: "#B54708", amberBg: "#FCF0DE", red: "#B42318", redBg: "#FDECEA",
};
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, "Helvetica Neue", Arial, sans-serif';
const DISPLAY = 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif';
const num = { fontVariantNumeric: "tabular-nums" };
const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    if (this.state.err)
      return (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: T.bg, fontFamily: FONT }}>
          <div style={{ fontSize: 14, color: T.sub }}>Chỗ này vừa bị lỗi, Mai xin lỗi anh. Không có khoản nào bị trừ đâu.</div>
          <button onClick={() => this.setState({ err: false })} style={{ border: "none", borderRadius: 11, padding: "10px 18px", background: T.brand, color: "#FFFDF9", fontWeight: 650, fontSize: 13, fontFamily: FONT, cursor: "pointer" }}>Thử lại</button>
        </div>
      );
    return this.props.children;
  }
}

let _ac = null;
const ding = (hi) => {
  try {
    if (navigator.vibrate) navigator.vibrate(hi ? [14, 40, 22] : 18);
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_ac) _ac = new AC();
    const ac = _ac, o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(hi ? 660 : 880, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(hi ? 1180 : 1318, ac.currentTime + 0.09);
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.09, ac.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.2);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.22);
  } catch (e) {}
};

// ————— intro —————
const Intro = ({ onDone }) => {
  const holder = useRef(null);
  const [label, setLabel] = useState(false);
  useEffect(() => {
    let cleanup = () => {};
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { onDone(); return cleanup; }
      const el = holder.current;
      if (!el) { onDone(); return cleanup; }
      let W = el.clientWidth || 430, H = el.clientHeight || 900;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      el.appendChild(renderer.domElement);
      const FOV = 50, Z0 = 4.5, Z1 = 3.95;
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 60);
      cam.position.z = Z0;
      const pxPerWorld = H / (2 * Z1 * Math.tan((FOV * Math.PI) / 360));
      const S = (0.31 * Math.min(W, H)) / pxPerWorld;
      const N = 2800;
      const pos = new Float32Array(N * 3), st = new Float32Array(N * 3), tg = new Float32Array(N * 3), dl = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const r = S * (2.4 + Math.random() * 2), th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        st[i * 3] = r * Math.sin(ph) * Math.cos(th);
        st[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.75;
        st[i * 3 + 2] = (Math.random() - 0.5) * S * 1.8;
        const a = Math.random() * Math.PI * 2, rr = S * (1 + (Math.random() - 0.5) * 0.075);
        tg[i * 3] = rr * Math.cos(a); tg[i * 3 + 1] = rr * Math.sin(a); tg[i * 3 + 2] = (Math.random() - 0.5) * S * 0.06;
        dl[i] = Math.random() * 0.32;
        pos[i * 3] = st[i * 3]; pos[i * 3 + 1] = st[i * 3 + 1]; pos[i * 3 + 2] = st[i * 3 + 2];
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const c0 = new THREE.Color("#9C8F7E"), c1 = new THREE.Color("#E8825A"), c2 = new THREE.Color("#FBEDE4");
      const base = S * 0.02;
      const mat = new THREE.PointsMaterial({ color: c0.clone(), size: base, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);
      const CONV = 0.62, PULSE = 0.82, END = 1.05, DUR = 1;
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const cl = (x) => Math.max(0, Math.min(1, x));
      let raf = 0, fin = false, shown = false;
      const t0 = performance.now();
      const finish = () => {
        if (fin) return;
        fin = true;
        cancelAnimationFrame(raf);
        onDone();
        setTimeout(() => { try { geo.dispose(); mat.dispose(); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); } catch (e) {} }, 60);
      };
      const tick = () => {
        const t = (performance.now() - t0) / 1000, attr = geo.attributes.position;
        for (let i = 0; i < N; i++) {
          const k = ease(cl((t - dl[i]) / DUR));
          attr.array[i * 3] = st[i * 3] + (tg[i * 3] - st[i * 3]) * k;
          attr.array[i * 3 + 1] = st[i * 3 + 1] + (tg[i * 3 + 1] - st[i * 3 + 1]) * k;
          attr.array[i * 3 + 2] = st[i * 3 + 2] + (tg[i * 3 + 2] - st[i * 3 + 2]) * k;
        }
        attr.needsUpdate = true;
        pts.rotation.z = 0.35 * (1 - cl(t / CONV));
        cam.position.z = Z0 - (Z0 - Z1) * cl(t / PULSE);
        if (!shown && t > 0.3) { shown = true; setLabel(true); }
        if (t > CONV && t <= PULSE) {
          const k = cl((t - CONV) / (PULSE - CONV));
          mat.color.copy(c0).lerp(c1, k);
          mat.size = base + S * 0.014 * Math.sin(k * Math.PI);
        }
        if (t > PULSE) {
          const k = cl((t - PULSE) / (END - PULSE));
          mat.color.copy(c1).lerp(c2, k * 0.6);
          mat.opacity = 0.95 * (1 - k);
          el.style.opacity = String(1 - k);
        }
        renderer.render(scene, cam);
        if (t >= END) finish(); else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const skip = () => { finish(); };
      el.addEventListener("pointerdown", skip);
      const onResize = () => { W = el.clientWidth || W; H = el.clientHeight || H; renderer.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix(); };
      window.addEventListener("resize", onResize);
      cleanup = () => { el.removeEventListener("pointerdown", skip); window.removeEventListener("resize", onResize); finish(); };
      return cleanup;
    } catch (e) { onDone(); return cleanup; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div ref={holder} style={{ position: "absolute", inset: 0, zIndex: 90, background: "#171310", transition: "opacity .2s linear" }}>
      {label && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", fontFamily: FONT }}>
          <div className="wordmark" style={{ fontFamily: DISPLAY, fontSize: 40, fontWeight: 600, letterSpacing: -1.4, lineHeight: 1, color: "#FBF7F1" }}>m.ai</div>
          <div className="wordmark" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1, color: "#B9A997", marginTop: 13, animationDelay: ".08s" }}>xem thử một buổi chiều</div>
        </div>
      )}
    </div>
  );
};

// ————————————————————————————————————————————————————————————
// HÌNH VẼ · minh hoạ vector và biểu đồ nhỏ, thay cho emoji trên gradient
// ————————————————————————————————————————————————————————————

// ————————————————————————————————————————————————————————————
// SCENES · bộ minh hoạ vector thay cho emoji-trên-gradient
//
// Một ngôn ngữ hình duy nhất: hình phẳng, không đổ bóng thật, không gradient
// trên chủ thể. Mỗi cảnh có đúng một lớp nền chuyển sắc và đúng một chi tiết
// biết cử động. Terracotta #C2552F xuất hiện trong cả 14 cảnh, dù chỉ một mảng
// nhỏ, để cả bộ trông như do một người vẽ.
//
// Hệ toạ độ: viewBox "0 0 120 84", preserveAspectRatio="xMidYMid slice".
//   · biến 56×56 (small) cắt còn 70% bề ngang  → vùng an toàn x ∈ [20, 100]
//   · biến rộng (h=128 trên khung ~370px) cắt trên/dưới → y ∈ [21, 63]
// Chủ thể của mọi cảnh nằm gọn trong x[22,98] × y[20,64]; nền luôn tràn viền
// (-10 → 130) nên không có mép trắng ở bất kỳ tỉ lệ nào.
//
// Dán khối SCENE_CSS vào <style> sẵn có. Media query prefers-reduced-motion
// toàn cục đã xử lý phần giảm chuyển động, nên ở đây chỉ dùng animation thường.
// ————————————————————————————————————————————————————————————

// Nét: 2 đơn vị, đầu và khớp bo tròn, dùng thống nhất cho cả bộ.
const SW = 2;
const ST = { strokeWidth: SW, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

// Nền chuyển sắc, luôn userSpaceOnUse để mọi hình khác tô cùng id sẽ khớp liền mạch.
const wash = (id, c1, c2, p) => {
  const q = p || [0, 0, 0, 84];
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={q[0]} y1={q[1]} x2={q[2]} y2={q[3]}>
      <stop offset="0" stopColor={c1} />
      <stop offset="1" stopColor={c2} />
    </linearGradient>
  );
};
const Bg = ({ u }) => <rect x="-10" y="-10" width="140" height="104" fill={`url(#${u}a)`} />;

const SCENES = {

  // ————— swim · làn bơi, mặt nước, một người bơi nhỏ —————
  swim: (u) => (
    <>
      <defs>
        {wash(u + "a", "#EFE8DA", "#DCEAEF")}
        {wash(u + "b", "#4F9DBA", "#175A78", [0, 27, 0, 90])}
        <pattern id={u + "r"} x="0" y="0" width="14" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="2.1" fill={T.brand} />
          <circle cx="7" cy="2.5" r="2.1" fill="#F4E8DA" />
          <circle cx="11.5" cy="2.5" r="2.1" fill={T.brand} />
        </pattern>
      </defs>
      <Bg u={u} />
      <rect x="-10" y="-10" width="140" height="32" fill="#EBE1CE" />
      <rect x="-10" y="22" width="140" height="5" fill="#F8F2E5" />
      <rect x="10" y="12" width="16" height="10" rx="1.5" fill="#DCCFB6" />
      <rect x="10" y="9.5" width="16" height="3" rx="1.5" fill={T.brand} />
      <rect x="-10" y="27" width="140" height="65" fill={`url(#${u}b)`} />

      <g className="sn-water" opacity=".45">
        {[[8, 33, 22], [66, 40, 26], [24, 58, 18], [84, 70, 24], [40, 78, 20]].map((s, i) => (
          <rect key={i} x={s[0]} y={s[1]} width={s[2]} height="2.2" rx="1.1" fill="#FFFDF9" />
        ))}
      </g>

      <rect x="-10" y="32" width="140" height="5" fill={`url(#${u}r)`} />

      {/* thân chìm dưới mặt nước, vẽ trước để lớp mặt nước phủ lên */}
      <ellipse cx="42" cy="51" rx="16" ry="4.2" fill="#FFFDF9" opacity=".5" transform="rotate(-5 42 51)" />
      <ellipse cx="26" cy="49" rx="7" ry="2.6" fill="#FFFDF9" opacity=".38" transform="rotate(-14 26 49)" />

      {/* mặt nước gần */}
      <path d="M-10 46 q10 -2.4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V92 H-10 Z" fill="#3E8CAA" opacity=".55" />
      <path d="M-10 46 q10 -2.4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#EAF7FB" strokeWidth={SW} fill="none" opacity=".7" />

      {/* tay vung qua đầu */}
      <path d="M55 47 C54.4 32.4 71 29.4 76.6 38.4 L73 40.6 C69.4 34.4 58.4 36.4 58.6 47 Z" fill="#FFFDF9" />
      <circle cx="62" cy="41.5" r="5.2" fill={T.brand} />
      <path d="M64.6 37.4 a5.2 5.2 0 0 1 1.6 5.4" stroke="#F3DAC6" strokeWidth={SW} fill="none" strokeLinecap="round" />
      <circle cx="79" cy="36.5" r="2.1" fill="#FFFDF9" />
      <circle cx="82.5" cy="32.5" r="1.3" fill="#FFFDF9" opacity=".8" />
      <circle cx="30" cy="46.5" r="2.4" fill="#FFFDF9" opacity=".9" />
      <circle cx="24.5" cy="43.5" r="1.5" fill="#FFFDF9" opacity=".7" />

      <rect x="-10" y="63.5" width="140" height="5" fill={`url(#${u}r)`} />
    </>
  ),

  // ————— pickup · cổng trường, xe chờ, nắng chiều —————
  pickup: (u) => (
    <>
      <defs>{wash(u + "a", "#FFF0D2", "#F4C179")}</defs>
      <Bg u={u} />
      <circle className="sn-glow" cx="101" cy="19" r="12" fill="#FFF7E2" opacity=".8" />
      <rect x="-10" y="64" width="140" height="30" fill="#E1D0AF" />
      <rect x="-10" y="64" width="140" height="2.4" fill="#CDB68B" />

      <polygon points="18,27 86,27 80,18 24,18" fill={T.brand} />
      <rect x="22" y="27" width="60" height="37" fill="#F5E9D1" />
      {[27, 42, 57, 70].map((x) => (
        <rect key={x} x={x} y="33" width="10" height="9" rx="1.2" fill="#EFD9A8" />
      ))}
      <rect x="46" y="46" width="13" height="18" rx="1.5" fill="#D8C4A0" />

      <circle cx="30" cy="45.5" r="3.6" fill="#EBCBA6" />
      <rect x="26.8" y="49.5" width="6.6" height="10" rx="2.4" fill={T.brandInk} />
      <rect x="24.6" y="50.6" width="3.4" height="6.4" rx="1.2" fill={T.brand} />
      <g stroke={T.dark} {...ST}><path d="M28.4 59.5 V64" /><path d="M31.8 59.5 V64" /></g>

      <path d="M34 59 V52 Q34 48.6 37.6 48 L48 46.6 L55.6 40.6 Q57.6 39 60.6 39 H82 Q85.6 39 87.6 41.6 L93 48 L97 48.8 Q101 49.6 101 53 V59 Z" fill={T.dark} />
      <polygon points="49,47.4 56.6,41.9 67,41.6 67,47.1" fill="#F7D89A" />
      <polygon points="70,41.6 81.6,41.6 86,47.1 70,47.1" fill="#F7D89A" />
      <rect x="34.2" y="50.6" width="3.6" height="3.4" rx="1.2" fill={T.brand} />
      <circle cx="48" cy="58.5" r="6" fill="#1B1713" />
      <circle cx="48" cy="58.5" r="2.5" fill="#CDB68B" />
      <circle cx="88" cy="58.5" r="6" fill="#1B1713" />
      <circle cx="88" cy="58.5" r="2.5" fill="#CDB68B" />
    </>
  ),

  // ————— form · tờ đơn đã ký, có con dấu —————
  form: (u) => (
    <>
      <defs>{wash(u + "a", "#FBEEE5", "#F0E4D2")}</defs>
      <Bg u={u} />
      <circle cx="60" cy="42" r="33" fill="#FFFDF9" opacity=".55" />
      <g transform="rotate(-3 60 42)">
        <rect x="37" y="17" width="47" height="54" rx="2.5" fill={T.surf} stroke={T.hair} strokeWidth={SW} />
        <rect x="37" y="17" width="47" height="5" rx="2.5" fill={T.brand} />
        <rect x="43" y="28" width="27" height="2.8" rx="1.4" fill={T.hair} />
        <rect x="43" y="34" width="33" height="2.8" rx="1.4" fill={T.hair} />
        <rect x="43" y="40" width="19" height="2.8" rx="1.4" fill={T.hair} />
        <path className="sn-sign" d="M43 51 c4 -6.4 7 5 10.2 -1 c2.4 -4.8 5 6 8.4 -1.4 c2 -4.4 4.8 4.6 8.2 0.2"
          stroke={T.ink} {...ST} />
        <rect x="43" y="58" width="15" height="2.2" rx="1.1" fill={T.faint} />
      </g>
      <g transform="rotate(8 77 55)">
        <polygon fill={T.brand} opacity=".95" points="77,45 79.4,47.6 82.9,46.8 83.4,50.4 86.6,52 84.6,55 86.6,58 83.4,59.6 82.9,63.2 79.4,62.4 77,65 74.6,62.4 71.1,63.2 70.6,59.6 67.4,58 69.4,55 67.4,52 70.6,50.4 71.1,46.8 74.6,47.6" />
        <circle cx="77" cy="55" r="6.6" fill={T.brandSoft} />
        <path d="M73.6 55.2 L76 57.6 L80.4 52.6" stroke={T.brandInk} {...ST} />
      </g>
    </>
  ),

  // ————— cart · túi giấy đi chợ, rau củ nhô lên —————
  cart: (u) => (
    <>
      <defs>{wash(u + "a", "#EAF3E9", "#F7F4ED")}</defs>
      <Bg u={u} />
      <rect x="-10" y="68" width="140" height="26" fill="#E9DFCB" />
      <rect x="-10" y="68" width="140" height="2.2" fill="#D8CBB1" />

      <g className="sn-bob">
        <ellipse cx="46" cy="27" rx="4.4" ry="8" fill="#3E9B76" transform="rotate(-24 46 27)" />
        <ellipse cx="53" cy="23.5" rx="4.2" ry="8.6" fill={T.green} transform="rotate(-6 53 23.5)" />
        <ellipse cx="59.5" cy="27" rx="4.2" ry="7.6" fill="#3E9B76" transform="rotate(16 59.5 27)" />
        <path d="M53 22 V36" stroke="#2C6B4F" {...ST} opacity=".55" />
      </g>
      <rect x="68" y="18" width="7" height="22" rx="3.5" fill="#D9A96A" transform="rotate(15 71.5 29)" />
      <g stroke="#B98A4E" strokeWidth="1.6" strokeLinecap="round" opacity=".8">
        <path d="M69.6 23 l3.4 1" transform="rotate(15 71.5 29)" />
        <path d="M69.6 28 l3.4 1" transform="rotate(15 71.5 29)" />
        <path d="M69.6 33 l3.4 1" transform="rotate(15 71.5 29)" />
      </g>
      <circle cx="64" cy="31.5" r="6" fill={T.brand} />
      <path d="M64 26 q3 -3.4 6 -1.6" stroke={T.green} {...ST} />

      <polygon points="36,34 84,34 80,70 40,70" fill="#DCBF97" />
      <polygon points="36,34 84,34 84,40.5 36,40.5" fill="#C9A87B" />
      <path d="M60 40.5 V70" stroke="#CBAB80" strokeWidth="1.4" opacity=".7" />
      <rect x="41" y="50" width="38" height="10" rx="1.6" fill={T.brand} />
      <rect x="45" y="53.4" width="17" height="1.9" rx="0.95" fill="#FFEFE4" opacity=".9" />
      <rect x="45" y="56.4" width="10" height="1.6" rx="0.8" fill="#FFEFE4" opacity=".6" />
    </>
  ),

  // ————— concert · dàn đèn sân khấu, đám đông đổ bóng —————
  concert: (u) => (
    <>
      <defs>{wash(u + "a", "#3C2A6B", "#150C29")}</defs>
      <Bg u={u} />
      <g className="sn-beam" style={{ transformOrigin: "60px -6px" }}>
        <path d="M26 -6 L2 64 L42 64 Z" fill="#FFF3D6" opacity=".13" />
        <path d="M60 -6 L44 64 L78 64 Z" fill="#FFF3D6" opacity=".10" />
        <path d="M94 -6 L76 64 L116 64 Z" fill={T.brand} opacity=".24" />
      </g>

      <ellipse cx="60" cy="58" rx="34" ry="7" fill="#F0D49A" opacity=".35" />
      <rect x="-10" y="57.5" width="140" height="8.5" fill="#E8C98A" />
      <rect x="-10" y="57.5" width="140" height="2" fill="#F6E3BB" />

      <g fill="#120A22">
        <circle cx="60" cy="37" r="5" />
        <path d="M52.5 57.5 V48.5 Q52.5 43.5 60 43.5 Q67.5 43.5 67.5 48.5 V57.5 Z" />
        <path d="M53.5 46 L46 40" stroke="#120A22" {...ST} />
      </g>
      <path d="M69 44.5 V57.5" stroke="#120A22" {...ST} />
      <circle cx="69" cy="43" r="2.6" fill={T.brand} />

      <g fill="#0B0618">
        <rect x="22" y="54" width="3.4" height="12" rx="1.7" />
        <rect x="80" y="51.5" width="3.4" height="14" rx="1.7" />
        <rect x="99" y="56" width="3.4" height="10" rx="1.7" />
        <rect x="-10" y="63" width="140" height="31" />
        {[-8, 1, 10, 19, 28, 37, 46, 55, 64, 73, 82, 91, 100, 109, 118, 127].map((x, i) => (
          <circle key={i} cx={x} cy="63" r="4.9" />
        ))}
      </g>
      <rect x="80" y="49" width="3.4" height="4" rx="1.7" fill={T.brand} />
    </>
  ),

  // ————— ticket · cuống vé, đường răng cưa xé rời —————
  ticket: (u) => (
    <>
      <defs>{wash(u + "a", "#FBEEE5", "#F1E1CE")}</defs>
      <Bg u={u} />
      <circle cx="60" cy="42" r="31" fill="#FFFDF9" opacity=".4" />

      <rect x="22" y="26" width="76" height="33" rx="3.5" fill={T.surf} stroke={T.brand} strokeWidth={SW} />
      <rect x="26" y="31" width="14" height="14" rx="2.2" fill={T.brand} />
      <circle cx="31.5" cy="41" r="2.4" fill="#FFEFE4" />
      <rect x="33.2" y="34" width="1.9" height="7.4" rx="0.95" fill="#FFEFE4" />
      <path d="M35.1 34 q2.6 0.6 2.6 3" stroke="#FFEFE4" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="45" y="32" width="25" height="3.2" rx="1.6" fill={T.faint} />
      <rect x="45" y="38.5" width="19" height="2.6" rx="1.3" fill={T.hair} />
      <rect x="45" y="44" width="23" height="2.6" rx="1.3" fill={T.hair} />
      <rect x="45" y="50" width="13" height="4" rx="1.4" fill={T.brandSoft} />

      <g className="sn-tear">
        <rect x="80" y="31" width="13" height="8" rx="1.6" fill={T.brandSoft} />
        <rect x="80" y="42" width="13" height="2.4" rx="1.2" fill={T.hair} />
        <rect x="80" y="46.5" width="9" height="2.4" rx="1.2" fill={T.hair} />
        <rect x="80" y="51.5" width="13" height="2.4" rx="1.2" fill={T.hair} />
      </g>
      <path d="M76 29.5 V55.5" stroke={T.brand} strokeWidth={SW} strokeLinecap="round" strokeDasharray="0.2 4" opacity=".75" />
      <circle cx="76" cy="26" r="4.2" fill={`url(#${u}a)`} />
      <circle cx="76" cy="59" r="4.2" fill={`url(#${u}a)`} />
    </>
  ),

  // ————— inspect · xe nhìn ngang trong xưởng đăng kiểm —————
  inspect: (u) => (
    <>
      <defs>
        {wash(u + "a", "#E8EDF1", "#C4CFD9")}
        <clipPath id={u + "c"}><rect x="24" y="24" width="72" height="40" /></clipPath>
      </defs>
      <Bg u={u} />
      <rect x="-10" y="14" width="140" height="7" fill="#9BA6B1" />
      <rect x="12" y="18" width="7" height="46" fill="#AAB5BF" />
      <rect x="101" y="18" width="7" height="46" fill="#AAB5BF" />
      <g fill="#8E99A4">
        <rect x="36" y="21" width="3" height="5" /><rect x="81" y="21" width="3" height="5" />
      </g>
      <ellipse cx="37.5" cy="27.5" rx="5.4" ry="2.6" fill="#F5EFDF" />
      <ellipse cx="82.5" cy="27.5" rx="5.4" ry="2.6" fill="#F5EFDF" />

      <rect x="-10" y="62" width="140" height="32" fill="#B7C1CA" />
      <rect x="30" y="62" width="60" height="6" rx="1" fill="#8C97A2" />
      <rect x="-10" y="62" width="140" height="1.8" fill="#9BA6B1" />

      <path d="M30 56 V50 Q30 46.4 33.6 45.6 L44 44 L52 35.6 Q54 33.6 57.6 33.6 H74 Q77.6 33.6 79.6 36 L86 44 L88.6 44.6 Q92 45.4 92 49 V56 Z" fill={T.brand} />
      <path d="M32 50.4 H90" stroke={T.brandInk} strokeWidth="1.6" opacity=".5" />
      <polygon points="46,43.6 53.4,36.4 60,36.2 60,43.4" fill="#D3E3EC" />
      <polygon points="63,36.2 73.4,36.2 78,43.4 63,43.4" fill="#D3E3EC" />
      <rect x="88.6" y="46.6" width="4.4" height="3" rx="1.4" fill="#FFF1CB" />
      <circle cx="43" cy="56" r="6.2" fill={T.dark} />
      <circle cx="43" cy="56" r="2.6" fill="#D7DEE4" />
      <circle cx="79" cy="56" r="6.2" fill={T.dark} />
      <circle cx="79" cy="56" r="2.6" fill="#D7DEE4" />

      <g clipPath={`url(#${u}c)`}>
        <rect className="sn-scan" x="24" y="28" width="72" height="2.6" rx="1.3" fill="#EAF8FF" />
      </g>
    </>
  ),

  // ————— call · điện thoại đổ chuông, khiên cảnh báo —————
  call: (u) => (
    <>
      <defs>{wash(u + "a", "#F7F0E6", "#EBDCC7")}</defs>
      <Bg u={u} />
      <g stroke={T.brand} {...ST}>
        <path className="sn-ring" d="M39.3 32.3 A8 8 0 0 0 39.3 43.7" />
        <path className="sn-ring" style={{ animationDelay: "-.45s" }} d="M35.8 28.8 A13 13 0 0 0 35.8 47.2" />
        <path className="sn-ring" style={{ animationDelay: "-.9s" }} d="M32.3 25.3 A18 18 0 0 0 32.3 50.7" />
      </g>

      <rect x="45" y="20" width="29" height="44" rx="5" fill={T.dark} />
      <rect x="47.4" y="23.6" width="24.2" height="36.8" rx="3.2" fill="#F4EEE4" />
      <rect x="54.5" y="21.4" width="10" height="1.6" rx="0.8" fill="#544D44" />
      <circle cx="59.5" cy="33" r="6" fill={T.hair} />
      <circle cx="59.5" cy="31.2" r="2.3" fill={T.faint} />
      <path d="M55.7 36.8 q3.8 -3.9 7.6 0" fill={T.faint} />
      <rect x="50" y="42.6" width="19" height="3" rx="1.5" fill={T.faint} />
      <rect x="53.5" y="47.8" width="12" height="2.2" rx="1.1" fill={T.hair} />
      <circle cx="53" cy="55.6" r="4" fill={T.green} opacity=".5" />
      <circle cx="66" cy="55.6" r="4" fill={T.red} opacity=".5" />

      <path d="M84 30 L96 34.2 V46 Q96 55.8 84 60.4 Q72 55.8 72 46 V34.2 Z" fill={T.brand} stroke={T.brandInk} strokeWidth={SW} />
      <rect x="82.4" y="38.4" width="3.2" height="9.6" rx="1.6" fill="#FFF3EC" />
      <circle cx="84" cy="52.4" r="1.9" fill="#FFF3EC" />
    </>
  ),

  // ————— tea · hộp quà trà sen —————
  tea: (u) => (
    <>
      <defs>
        {wash(u + "a", "#E9F2EB", "#F7F4ED")}
        <clipPath id={u + "c"}><polygon points="38,34 78,34 78,62 38,62" /></clipPath>
      </defs>
      <Bg u={u} />
      <rect x="-10" y="62" width="140" height="32" fill="#E7DCC7" />
      <rect x="-10" y="62" width="140" height="2.2" fill="#D6C9AE" />
      <ellipse cx="63" cy="63" rx="30" ry="3.2" fill="#C9BCA1" opacity=".5" />

      <polygon points="78,34 92,26.5 92,54.5 78,62" fill="#17563F" />
      <polygon points="38,34 52,26.5 92,26.5 78,34" fill="#2E8A64" />
      <polygon points="38,34 78,34 78,62 38,62" fill="#1E6B4F" />

      <g clipPath={`url(#${u}c)`}>
        <g transform="skewX(-18)">
          <rect className="sn-glint" x="-4" y="24" width="10" height="48" fill="#FFFDF9" opacity=".16" />
        </g>
      </g>

      <g opacity=".92">
        {[-52, -26, 0, 26, 52].map((r, i) => (
          <ellipse key={i} cx="52" cy="45" rx="2.9" ry="7.4" fill={i === 2 ? "#FFF1EA" : "#F5DCD1"} transform={`rotate(${r} 52 50)`} />
        ))}
        <circle cx="52" cy="50" r="2.2" fill={T.brand} />
      </g>

      <rect x="62" y="34" width="8" height="28" fill={T.brand} />
      <polygon points="62,34 70,34 84,26.5 76,26.5" fill={T.brand} opacity=".82" />
      <polygon points="78,34 78,62 82,59.8 82,31.9" fill={T.brandInk} />
      <ellipse cx="70.4" cy="27" rx="4.2" ry="2.4" fill={T.brand} transform="rotate(-18 70.4 27)" />
      <ellipse cx="78.4" cy="24.6" rx="4.2" ry="2.4" fill={T.brand} transform="rotate(18 78.4 24.6)" />
      <circle cx="74.6" cy="26.4" r="2.1" fill={T.brandInk} />
    </>
  ),

  // ————— meal · nồi cơm tối, hơi bốc lên —————
  meal: (u) => (
    <>
      <defs>{wash(u + "a", "#F8EBD7", "#EDD5B2")}</defs>
      <Bg u={u} />
      <rect x="-10" y="64" width="140" height="30" fill="#DCC4A0" />
      <rect x="-10" y="64" width="140" height="2.4" fill="#C7AC85" />
      <ellipse cx="60" cy="65" rx="30" ry="3.2" fill="#BFA37B" opacity=".5" />

      {[[48, "0s"], [60, "-1.3s"], [72, "-2.5s"]].map((s, i) => (
        <path key={i} className="sn-steam" style={{ animationDelay: s[1] }}
          d={`M${s[0]} 36 c-3.4 -3 -3.4 -6 0 -9 c3.4 -3 3.4 -6 0 -9`}
          stroke="#FFFDF9" strokeWidth={SW} strokeLinecap="round" fill="none" opacity=".8" />
      ))}

      <g stroke={T.brandInk} {...ST}>
        <path d="M34 48 q-5 0 -5 4.4 q0 4.4 5 4.4" />
        <path d="M86 48 q5 0 5 4.4 q0 4.4 -5 4.4" />
      </g>
      <path d="M36 45 H84 V56 Q84 65 75 65 H45 Q36 65 36 56 Z" fill={T.brand} />
      <path d="M36 57 H84 Q84 65 75 65 H45 Q36 65 36 57 Z" fill={T.brandInk} opacity=".55" />
      <rect x="41.5" y="49" width="4" height="10" rx="2" fill="#FFFDF9" opacity=".2" />
      <path d="M32 44.6 Q32 38.6 60 38.6 Q88 38.6 88 44.6 Z" fill={T.brandInk} />
      <rect x="31" y="44.4" width="58" height="3.4" rx="1.7" fill={T.brandInk} />
      <rect x="55" y="34.4" width="10" height="4.4" rx="2.2" fill="#F3E7D5" />
    </>
  ),

  // ————— car · sedan góc ba phần tư —————
  car: (u) => {
    const body = "M27 56 V48.4 Q27 44.6 31 43.8 L42.6 42 L51 32.4 Q53.2 30 57 30 H76 Q80 30 82.2 32.6 L89 41.2 L94 42.2 Q98.4 43.2 98.4 47.2 V56 Z";
    return (
      <>
        <defs>
          {wash(u + "a", "#EBF1F6", "#CAD6E1")}
          <clipPath id={u + "c"}><path d={body} /></clipPath>
        </defs>
        <Bg u={u} />
        <rect x="-10" y="62" width="140" height="32" fill="#C3CFD8" />
        <rect x="-10" y="62" width="140" height="1.8" fill="#AEBBC6" />
        <ellipse cx="62" cy="63" rx="40" ry="4" fill="#94A5B4" opacity=".45" />

        <path d="M33 44 L52.6 29.4 Q54.8 27.6 58.6 27.6 H78 Q82 27.6 84.2 30.2 L92 40.2 L94 43 L88 42.4 Z" fill={T.brandInk} />
        <path d={body} fill={T.brand} />
        <polygon points="45,42.2 53.4,33 62,32.6 62,42" fill="#D5E4EE" />
        <polygon points="65,32.6 75.4,32.6 81,42 65,42" fill="#D5E4EE" />
        <polygon points="65,32.6 70,32.6 65.6,42 65,42" fill="#EFF6FA" opacity=".8" />
        <path d="M29 49.4 H97" stroke={T.brandInk} strokeWidth="1.6" opacity=".45" />
        <rect x="93.6" y="45" width="5" height="3.4" rx="1.7" fill="#FFF1CB" />
        <rect x="27" y="45.4" width="3.6" height="3.2" rx="1.4" fill={T.brandInk} />

        <g clipPath={`url(#${u}c)`}>
          <g transform="skewX(-22)">
            <rect className="sn-glint" x="-10" y="24" width="11" height="40" fill="#FFFDF9" opacity=".22" />
          </g>
        </g>

        <circle cx="41" cy="56" r="6.4" fill={T.dark} />
        <circle cx="41" cy="56" r="2.7" fill="#D3DCE4" />
        <circle cx="83" cy="56" r="6.4" fill={T.dark} />
        <circle cx="83" cy="56" r="2.7" fill="#D3DCE4" />
      </>
    );
  },

  // ————— doc · chồng giấy tờ nhà —————
  doc: (u) => (
    <>
      <defs>{wash(u + "a", "#F8F5EE", "#E8DFCF")}</defs>
      <Bg u={u} />
      <ellipse cx="60" cy="74" rx="30" ry="3.6" fill="#CFC4AE" opacity=".45" />
      <g className="sn-riffle" style={{ transformOrigin: "60px 74px" }}>
        <rect x="40" y="21" width="41" height="52" rx="2.5" fill="#EDE4D3" stroke={T.hair} strokeWidth={SW} transform="rotate(11 60 68)" />
      </g>
      <rect x="39" y="20" width="41" height="52" rx="2.5" fill="#F5EEE0" stroke={T.hair} strokeWidth={SW} transform="rotate(-9 60 68)" />
      <g transform="rotate(1.5 60 68)">
        <rect x="39" y="19" width="43" height="53" rx="2.5" fill={T.surf} stroke={T.hair} strokeWidth={SW} />
        <rect x="45" y="26" width="19" height="4.2" rx="2.1" fill={T.brand} />
        <rect x="45" y="35" width="31" height="2.6" rx="1.3" fill={T.hair} />
        <rect x="45" y="40.6" width="25" height="2.6" rx="1.3" fill={T.hair} />
        <rect x="45" y="46.2" width="29" height="2.6" rx="1.3" fill={T.hair} />
        <rect x="45" y="53.6" width="14" height="10" rx="1.6" fill={T.brandSoft} />
        <path d="M48.2 58.8 L51.2 61.8 L56 55.8" stroke={T.brand} {...ST} />
        <rect x="62" y="54" width="14" height="2.4" rx="1.2" fill={T.hair} />
        <rect x="62" y="58.6" width="10" height="2.4" rx="1.2" fill={T.hair} />
      </g>
      <path d="M70.5 14 V24.6 q0 3 -3 3 q-3 0 -3 -3 V17.6 q0 -1.8 1.8 -1.8 q1.8 0 1.8 1.8 V24.6"
        stroke={T.brand} {...ST} />
    </>
  ),

  // ————— shield · xác thực CCCD —————
  shield: (u) => (
    <>
      <defs>
        {wash(u + "a", "#E9F3EC", "#F7F4ED")}
        <clipPath id={u + "c"}>
          <path d="M60 19 L83 27 V45.4 Q83 58.6 60 67 Q37 58.6 37 45.4 V27 Z" />
        </clipPath>
      </defs>
      <Bg u={u} />
      <path d="M60 19 L83 27 V45.4 Q83 58.6 60 67 Q37 58.6 37 45.4 V27 Z" fill={T.surf} stroke={T.brand} strokeWidth={SW} />
      <rect x="45" y="33" width="30" height="19" rx="2.2" fill={T.brandSoft} />
      <rect x="47.6" y="36" width="9" height="11" rx="1.4" fill={T.brand} />
      <circle cx="52.1" cy="39.6" r="2" fill="#FFEFE4" />
      <path d="M48.8 45.6 q3.3 -4 6.6 0" fill="#FFEFE4" />
      <rect x="59.4" y="36.4" width="13" height="2.2" rx="1.1" fill={T.faint} />
      <rect x="59.4" y="40.6" width="10" height="2.2" rx="1.1" fill={T.hair} />
      <rect x="59.4" y="44.8" width="12" height="2.2" rx="1.1" fill={T.hair} />
      <g clipPath={`url(#${u}c)`}>
        <rect className="sn-scan" x="34" y="24" width="52" height="2.8" rx="1.4" fill="#FFFDF9" opacity=".7" />
      </g>
      <circle cx="75" cy="54" r="7.6" fill={T.green} stroke={T.surf} strokeWidth={SW} />
      <path d="M71.6 54.2 L74.2 56.8 L78.6 51.2" stroke="#FFFDF9" {...ST} />
    </>
  ),

  // ————— win · xong việc, ăn mừng —————
  win: (u) => (
    <>
      <defs>{wash(u + "a", "#FCEFE6", "#F7F4ED")}</defs>
      <Bg u={u} />
      <g className="sn-rays" style={{ transformOrigin: "60px 40px" }}>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((r) => (
          <path key={r} d="M60 40 L56.6 -6 L63.4 -6 Z" fill={T.brand} opacity=".08" transform={`rotate(${r} 60 40)`} />
        ))}
      </g>

      <polygon points="52,52 60,48 60,68 52,62" fill={T.brandInk} />
      <polygon points="68,52 60,48 60,68 68,62" fill={T.brand} />
      <circle cx="60" cy="40" r="17.5" fill={T.brandSoft} stroke={T.brand} strokeWidth={SW} />
      <circle cx="60" cy="40" r="12" fill={T.brand} />
      <path d="M54.4 40.4 L58.6 44.8 L66.4 34.8" stroke="#FFFDF9" {...ST} />

      <g>
        <rect x="26" y="24" width="5" height="3.4" rx="1.2" fill={T.green} transform="rotate(-24 28.5 25.7)" />
        <rect x="88" y="28" width="5" height="3.4" rx="1.2" fill="#E8A33D" transform="rotate(32 90.5 29.7)" />
        <rect x="33" y="54" width="4.6" height="3.2" rx="1.2" fill="#E8A33D" transform="rotate(18 35.3 55.6)" />
        <rect x="92" y="52" width="4.6" height="3.2" rx="1.2" fill={T.green} transform="rotate(-14 94.3 53.6)" />
        <circle cx="36" cy="38" r="2.1" fill={T.brand} />
        <circle cx="86" cy="44" r="1.8" fill={T.brandInk} />
        <circle cx="46" cy="20" r="1.7" fill="#E8A33D" />
        <circle cx="74" cy="21" r="2" fill={T.green} />
      </g>
    </>
  ),
};

const SCENE_NAMES = Object.keys(SCENES);

// Mỗi instance cần id gradient/clip riêng, nếu không hai cảnh cùng loại trên
// một màn hình sẽ giẫm lên nhau.
let _sceneSeq = 0;

const Scene = ({ name, h = 128, small, style }) => {
  const ref = React.useRef(null);
  if (ref.current === null) ref.current = "sn" + ++_sceneSeq + "_";
  const draw = SCENES[name] || SCENES.doc;
  return (
    <div
      style={{
        height: small ? 56 : h,
        width: small ? 56 : "100%",
        borderRadius: small ? 12 : 14,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        background: T.hair,
        boxShadow: "inset 0 0 0 1px rgba(36,31,26,.06)",
        ...style,
      }}
    >
      <svg
        viewBox="0 0 120 84"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        style={{ display: "block" }}
        aria-hidden="true"
        focusable="false"
      >
        {draw(ref.current)}
      </svg>
    </div>
  );
};

// ————————————————————————————————————————————————————————————
// Dán vào khối <style> sẵn có. Media query prefers-reduced-motion toàn cục
// (`*{animation-duration:.001s !important}`) sẽ ghim mọi cảnh về trạng thái
// cuối, nên các keyframe ping-pong dùng `alternate` để trạng thái cuối vẫn đẹp.
// ————————————————————————————————————————————————————————————
const SCENE_CSS = `
.sn-water{animation:sn-water 5s ease-in-out infinite alternate}
.sn-glow{animation:sn-glow 4.6s ease-in-out infinite alternate}
.sn-sign{stroke-dasharray:80;animation:sn-sign 1.5s ease-out .3s both}
.sn-bob{transform-box:view-box;animation:sn-bob 3.4s ease-in-out infinite alternate}
.sn-beam{transform-box:view-box;animation:sn-beam 7s ease-in-out infinite alternate}
.sn-tear{transform-box:view-box;animation:sn-tear 3.8s ease-in-out infinite alternate}
.sn-scan{transform-box:view-box;animation:sn-scan 3.6s cubic-bezier(.45,0,.55,1) infinite}
.sn-ring{animation:sn-ring 1.5s ease-in-out infinite alternate}
.sn-glint{transform-box:view-box;animation:sn-glint 5.4s ease-in-out infinite}
.sn-steam{transform-box:view-box;animation:sn-steam 3.6s ease-in-out infinite alternate}
.sn-riffle{transform-box:view-box;animation:sn-riffle 6s ease-in-out infinite alternate}
.sn-rays{transform-box:view-box;animation:sn-rays 34s linear infinite}
@keyframes sn-water{from{transform:translateX(-3px);opacity:.3}to{transform:translateX(3px);opacity:.6}}
@keyframes sn-glow{from{opacity:.55}to{opacity:1}}
@keyframes sn-sign{from{stroke-dashoffset:80}to{stroke-dashoffset:0}}
@keyframes sn-bob{from{transform:translateY(0)}to{transform:translateY(-1.8px)}}
@keyframes sn-beam{from{transform:rotate(-4.5deg)}to{transform:rotate(5.5deg)}}
@keyframes sn-tear{from{transform:translateX(0)}to{transform:translateX(1.8px)}}
@keyframes sn-scan{0%{transform:translateY(0);opacity:0}14%{opacity:.7}86%{opacity:.7}100%{transform:translateY(32px);opacity:0}}
@keyframes sn-ring{from{opacity:.22}to{opacity:1}}
@keyframes sn-glint{0%{transform:translateX(-8px)}60%,100%{transform:translateX(112px)}}
@keyframes sn-steam{from{transform:translateY(3px);opacity:.18}to{transform:translateY(-7px);opacity:.6}}
@keyframes sn-riffle{from{transform:rotate(0)}to{transform:rotate(-2.4deg)}}
@keyframes sn-rays{from{transform:rotate(0)}to{transform:rotate(360deg)}}
`;

// ————————————————————————————————————————————————————————————
// m.ai · viz — SVG primitives: Logo · Donut · Countdown · Spark · Avatar · Bars
//
// Pure SVG. No deps beyond react. Every glyph is drawn in a unit viewBox and
// scaled by `size`, so it is crisp at 1x, 2x, 3x. Nothing here holds a timer,
// listens on window, or allocates per frame: safe to render dozens of times
// in a list. All mount motion lives in VIZ_CSS, injected once by the host.
//
//   import { Logo, Donut, Countdown, Spark, Avatar, Bars, VIZ_CSS } from "./viz.jsx";
//   <style>{VIZ_CSS}</style>
//
// Logo is a drop-in for the old <Mark size={26} alive /> blob.
// ————————————————————————————————————————————————————————————

// ————— tokens (mirror of T in app.jsx, kept local so this file stands alone) —————
const VT = {
  ink: "#241F1A", sub: "#6E665C", faint: "#A79E92", hair: "#E9E2D6",
  bg: "#F7F4ED", surf: "#FFFDF9", brand: "#C2552F", brandLit: "#E8825A",
  brandSoft: "#FBEDE4", brandInk: "#9C3F1F", cream: "#FFFDF9",
  green: "#1B7A4E", amber: "#B54708", red: "#B42318",
  muted: "#DED3C3", mutedInk: "#C9BCA9",
};
// DISPLAY: dùng chung với khai báo phía trên

// ————— tiny helpers —————
const r2 = (n) => Math.round(n * 100) / 100;
const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);

// Stable per-instance id for <defs>. useId is not assumed to exist.
let _seq = 0;
const useUid = (p) => {
  const ref = useRef(null);
  if (ref.current === null) ref.current = p + (++_seq).toString(36);
  return ref.current;
};

// One frame after mount. Used to drive CSS transitions from a rest state.
const useMounted = () => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setOn(true)); });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, []);
  return on;
};

// FNV-1a. Same string in, same number out, forever.
const hash32 = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

// Catmull-Rom through the points, emitted as cubic beziers.
// Control points are clamped into the box so a steep series never clips.
const smoothPath = (pts, lo, hi, tension = 1) => {
  if (!pts.length) return "";
  if (pts.length === 1) return `M ${r2(pts[0][0])} ${r2(pts[0][1])}`;
  const cy = (y) => clamp(y, lo, hi);
  let d = `M ${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
    const k = tension / 6;
    const c1x = p1[0] + (p2[0] - p0[0]) * k, c1y = cy(p1[1] + (p2[1] - p0[1]) * k);
    const c2x = p2[0] - (p3[0] - p1[0]) * k, c2y = cy(p2[1] - (p3[1] - p1[1]) * k);
    d += ` C ${r2(c1x)} ${r2(c1y)}, ${r2(c2x)} ${r2(c2y)}, ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d;
};

// ————————————————————————————————————————————————————————————
// 1 · Logo — the m. wordmark as real geometry
//
// Drawn in a 32 box. Squircle tile, then a monoline "m": one stem, two
// half-round counters of identical radius, then the period. Stroke is 2.6 at
// 32 units, i.e. 1.95px at size 24 and 7.8px at size 96 — heavy enough to hold
// at a chat avatar, light enough to look drawn at hero size.
//
//   <Logo size={26} alive />         drop-in for <Mark size={26} alive />
//   <Logo size={96} tone="mono" />   glyph only, inherits currentColor
// ————————————————————————————————————————————————————————————
const M_GLYPH = "M6.6 21 V14.6 a3.6 3.6 0 0 1 7.2 0 V21 M13.8 14.6 a3.6 3.6 0 0 1 7.2 0 V21";
const TILE_R = 11.2; // 0.35 of the 32 box — the old Mark's border-radius, kept

const Logo = ({ size = 26, alive, tone = "solid", color, title }) => {
  const uid = useUid("mai");
  const mono = tone === "mono";
  const ink = color || (mono ? "currentColor" : VT.cream);

  return (
    <svg
      width={size} height={size} viewBox="0 0 32 32"
      className={"viz-in" + (alive ? " viz-alive" : "")}
      role={title ? "img" : "presentation"} aria-label={title || undefined} aria-hidden={title ? undefined : true}
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
      shapeRendering="geometricPrecision"
    >
      {!mono && (
        <defs>
          <linearGradient id={uid} x1="0.12" y1="0" x2="0.86" y2="1">
            <stop offset="0" stopColor={VT.brandLit} />
            <stop offset="1" stopColor={color || VT.brand} />
          </linearGradient>
        </defs>
      )}

      {/* halo — only while Mai is thinking */}
      {alive && !mono && (
        <rect className="viz-halo" x="0.7" y="0.7" width="30.6" height="30.6" rx={TILE_R - 0.5}
          fill="none" stroke={color || VT.brand} strokeWidth="1.4" style={{ transformOrigin: "16px 16px" }} />
      )}

      {!mono && <rect x="0" y="0" width="32" height="32" rx={TILE_R} fill={`url(#${uid})`} />}

      <path d={M_GLYPH} fill="none" stroke={ink} strokeWidth={mono ? 3 : 2.6}
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25.2" cy="20.1" r={mono ? 1.9 : 1.75} fill={ink} className={alive ? "viz-dot" : undefined}
        style={{ transformOrigin: "25.2px 20.1px" }} />
    </svg>
  );
};

// ————————————————————————————————————————————————————————————
// 2 · Donut — progress ring
//   <Donut value={14} total={32} size={44} label="14" />   "14/32 phụ huynh đã đóng"
// Sweeps in from empty on mount and transitions again whenever value moves.
// ————————————————————————————————————————————————————————————
const Donut = ({
  value = 0, total = 1, size = 44, color = VT.brand, track = VT.hair,
  label, sub, stroke, delay = 0, title,
}) => {
  const on = useMounted();
  const sw = stroke || clamp(size * 0.115, 3, 7);
  const rad = (size - sw) / 2;
  const c = 2 * Math.PI * rad;
  const pct = total > 0 ? clamp(value / total, 0, 1) : 0;
  const off = on ? c * (1 - pct) : c;
  const cx = size / 2;

  const txt = label === true ? String(value) : label;
  const fs = sub ? size * 0.3 : size * 0.34;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      role={title ? "img" : "presentation"} aria-label={title || undefined} aria-hidden={title ? undefined : true}
      style={{ display: "block", flexShrink: 0 }} shapeRendering="geometricPrecision"
    >
      <circle cx={cx} cy={cx} r={r2(rad)} fill="none" stroke={track} strokeWidth={r2(sw)} />
      {pct > 0 && (
        <circle
          className="viz-ring" cx={cx} cy={cx} r={r2(rad)} fill="none"
          stroke={color} strokeWidth={r2(sw)} strokeLinecap="round"
          strokeDasharray={r2(c)} strokeDashoffset={r2(off)}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transitionDelay: delay ? delay + "ms" : undefined }}
        />
      )}
      {txt != null && txt !== false && (
        <text x={cx} y={r2(cx + fs * 0.34 - (sub ? fs * 0.26 : 0))} textAnchor="middle"
          fontFamily={DISPLAY} fontSize={r2(fs)} fontWeight="600" fill={color}
          style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{txt}</text>
      )}
      {sub && (
        <text x={cx} y={r2(cx + fs * 0.34 + size * 0.21)} textAnchor="middle"
          fontSize={r2(size * 0.17)} fontWeight="650" fill={VT.faint}>{sub}</text>
      )}
    </svg>
  );
};

// ————————————————————————————————————————————————————————————
// 3 · Countdown — a ring that empties, time in the middle
//   <Countdown minutes={48} total={180} size={52} />   "còn 48 phút" trước giờ đón Bin
// Terracotta above an hour, amber under 60 minutes, red under 15 (and the red
// state breathes, so it reads as pressure without a badge).
// ————————————————————————————————————————————————————————————
const fmtLeft = (m) => {
  if (m <= 0) return ["0", "phút"];
  if (m < 60) return [String(Math.round(m)), "phút"];
  const h = Math.floor(m / 60), mm = Math.round(m % 60);
  return mm ? [`${h}g${String(mm).padStart(2, "0")}`, ""] : [`${h}g`, "còn lại"];
};

const Countdown = ({
  minutes = 0, total = 60, size = 52, stroke, track = VT.hair, color, unit, title,
}) => {
  const on = useMounted();
  const left = Math.max(0, minutes);
  const urgent = left < 15, warn = left < 60;
  const tint = color || (urgent ? VT.red : warn ? VT.amber : VT.brand);
  const sw = stroke || clamp(size * 0.105, 3, 7);
  const rad = (size - sw) / 2;
  const c = 2 * Math.PI * rad;
  const pct = total > 0 ? clamp(left / total, 0, 1) : 0;
  const off = on ? c * (1 - pct) : 0; // depletes: starts full, drains to remaining
  const cx = size / 2;
  const [big, small] = fmtLeft(left);
  // the number owns the counter: shrink it as the string grows so 1g48 still fits
  const fs = size * (big.length <= 2 ? 0.33 : big.length === 3 ? 0.27 : 0.225);
  const unitTxt = unit != null ? unit : small;
  const showUnit = !!unitTxt && size >= 34 && big.length <= 3;
  const uy = cx + fs * (showUnit ? 0.06 : 0.34);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      className={urgent ? "viz-urgent" : undefined}
      role={title ? "img" : "presentation"} aria-label={title || undefined} aria-hidden={title ? undefined : true}
      style={{ display: "block", flexShrink: 0, transformOrigin: "50% 50%" }} shapeRendering="geometricPrecision"
    >
      <circle cx={cx} cy={cx} r={r2(rad)} fill="none" stroke={track} strokeWidth={r2(sw)} />
      {pct > 0 && (
        <circle className="viz-ring" cx={cx} cy={cx} r={r2(rad)} fill="none"
          stroke={tint} strokeWidth={r2(sw)} strokeLinecap="round"
          strokeDasharray={r2(c)} strokeDashoffset={r2(off)}
          transform={`rotate(-90 ${cx} ${cx})`} />
      )}
      <text x={cx} y={r2(uy)} textAnchor="middle"
        fontFamily={DISPLAY} fontSize={r2(fs)} fontWeight="600" fill={tint}
        style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>{big}</text>
      {showUnit && (
        <text x={cx} y={r2(uy + size * 0.175)} textAnchor="middle"
          fontSize={r2(clamp(size * 0.145, 6.5, 9.5))} fontWeight="650" fill={VT.faint}>{unitTxt}</text>
      )}
    </svg>
  );
};

// ————————————————————————————————————————————————————————————
// 4 · Spark — sparkline, Catmull-Rom smoothed, soft area beneath
//   <Spark points={[12,9,14,11,17,15,21]} w={64} h={20} />
// pathLength=1 normalises the draw-in so every series takes the same time.
// ————————————————————————————————————————————————————————————
const Spark = ({
  points = [], w = 64, h = 20, color = "currentColor", fill, cap = true, strokeWidth = 1.5, title,
}) => {
  const uid = useUid("spk");
  const geo = useMemo(() => {
    const raw = (points || []).filter((n) => typeof n === "number" && isFinite(n));
    if (raw.length < 2) return null;
    const pad = strokeWidth / 2 + (cap ? 1.4 : 0.4);
    const min = Math.min(...raw), max = Math.max(...raw);
    const span = max - min || 1;
    const stepX = (w - pad * 2) / (raw.length - 1);
    const pts = raw.map((v, i) => [pad + i * stepX, pad + (1 - (v - min) / span) * (h - pad * 2)]);
    const line = smoothPath(pts, pad * 0.4, h - pad * 0.4);
    const area = `${line} L ${r2(pts[pts.length - 1][0])} ${r2(h)} L ${r2(pts[0][0])} ${r2(h)} Z`;
    return { line, area, last: pts[pts.length - 1], rising: raw[raw.length - 1] >= raw[0] };
  }, [points, w, h, strokeWidth, cap]);

  if (!geo) return <svg width={w} height={h} aria-hidden="true" style={{ display: "block" }} />;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}
      role={title ? "img" : "presentation"} aria-label={title || undefined} aria-hidden={title ? undefined : true}
      style={{ display: "block", flexShrink: 0, color: color === "currentColor" ? undefined : color, overflow: "visible" }}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fill || color} stopOpacity="0.14" />
          <stop offset="1" stopColor={fill || color} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path className="viz-fade" d={geo.area} fill={`url(#${uid})`} />
      <path className="viz-draw" d={geo.line} pathLength="1" fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {cap && (
        <circle className="viz-cap" cx={r2(geo.last[0])} cy={r2(geo.last[1])} r={strokeWidth * 1.1}
          fill={color} style={{ transformOrigin: `${r2(geo.last[0])}px ${r2(geo.last[1])}px` }} />
      )}
    </svg>
  );
};

// ————————————————————————————————————————————————————————————
// 5 · Avatar — deterministic, generated, not an emoji
//   <Avatar name="Vy" size={34} />  <Avatar name="cô Lan" tone="cool" />
// Two hues are hashed out of the name and clamped to a warm band (15-45°) plus
// an optional muted teal band (150-190°), so a whole family list still sits
// inside the terracotta palette. Shape is a squircle blob or a hexagon, picked
// by the same hash. Initial is the last word's first letter, in the DISPLAY serif.
// ————————————————————————————————————————————————————————————
const AV_BLOB = "M20 2.2 C29.4 2.2 37.8 7.4 37.8 20 C37.8 32.2 30.2 37.8 20 37.8 C9.4 37.8 2.2 31.4 2.2 20 C2.2 8.2 10.6 2.2 20 2.2 Z";
const AV_HEX = "M20 2.6 C21.3 2.6 22.5 2.95 23.6 3.6 L32.6 8.8 C34.8 10.1 35.8 11.8 35.8 14.3 L35.8 25.7 C35.8 28.2 34.8 29.9 32.6 31.2 L23.6 36.4 C21.4 37.7 18.6 37.7 16.4 36.4 L7.4 31.2 C5.2 29.9 4.2 28.2 4.2 25.7 L4.2 14.3 C4.2 11.8 5.2 10.1 7.4 8.8 L16.4 3.6 C17.5 2.95 18.7 2.6 20 2.6 Z";

const initialOf = (name) => {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return words[words.length - 1].charAt(0).toUpperCase();
};

// `initial` để ghi đè: quy tắc lấy chữ cuối đúng cho tên người Việt
// ("Nguyễn Thị Vy" → V) nhưng sai cho tên nhóm ("Nhà mình" → M).
const Avatar = ({ name = "", size = 34, tone, ring, title, initial }) => {
  const uid = useUid("av");
  const g = useMemo(() => {
    const h = hash32(String(name).toLowerCase());
    const warm = 14 + (h % 23);                       // 14-36°  clay/terracotta band
    const cool = 150 + ((h >>> 11) % 41);             // 150-190° muted teal band
    const wantsCool = ((h >>> 8) & 1) === 1;
    let hA = warm, hB = wantsCool ? cool : 14 + ((h >>> 17) % 23);
    if (tone === "warm") hB = 14 + ((h >>> 17) % 23);
    if (tone === "cool") hB = cool;
    if (tone === "brand") { hA = 16; hB = 28; }
    return {
      hA, hB,
      hex: ((h >>> 3) & 1) === 1,
      tilt: ((h >>> 5) % 9) - 4,                      // -4..4 deg, so no two blobs sit identically
      // the accent is a corner wash, never the field: warm always wins
      ax: ((h >>> 13) & 1) ? 3 + ((h >>> 14) % 9) : 28 + ((h >>> 14) % 9),
      ay: 29 + ((h >>> 19) % 10),
      ar: 10 + ((h >>> 23) % 6),
    };
  }, [name, tone]);

  const shape = g.hex ? AV_HEX : AV_BLOB;
  const fs = size * (g.hex ? 0.4 : 0.42);

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="viz-in"
      role={title || name ? "img" : "presentation"} aria-label={title || (name ? String(name) : undefined)}
      style={{ display: "block", flexShrink: 0 }} shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={uid + "g"} x1="0.15" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={`hsl(${g.hA} 56% 63%)`} />
          <stop offset="1" stopColor={`hsl(${g.hA} 60% 45%)`} />
        </linearGradient>
        <clipPath id={uid + "c"}><path d={shape} /></clipPath>
      </defs>
      <g transform={`rotate(${g.tilt} 20 20)`}>
        <path d={shape} fill={`url(#${uid}g)`} />
        <g clipPath={`url(#${uid}c)`}>
          <circle cx={g.ax} cy={g.ay} r={g.ar} fill={`hsl(${g.hB} 44% 48%)`} opacity="0.26" />
          <path d="M0 0 H40 V13 C28 19 12 9 0 15 Z" fill="#FFFFFF" opacity="0.11" />
        </g>
      </g>
      <text x="20" y={r2(20 + (fs / size) * 40 * 0.34)} textAnchor="middle"
        fontFamily={DISPLAY} fontSize={r2((fs / size) * 40)} fontWeight="600" fill={VT.cream}
        style={{ letterSpacing: "-0.01em" }}>{initial || initialOf(name)}</text>
      {ring && <path d={shape} fill="none" stroke={ring === true ? VT.surf : ring} strokeWidth="2.4" />}
    </svg>
  );
};

// ————————————————————————————————————————————————————————————
// 6 · Bars — 5-7 bar micro chart
//   <Bars data={[8,3,11,9,14,17]} highlight={1} labels={["T2","T3","T4","T5","T6","T7"]} />
//   "sáng thứ Ba vắng nhất" — the highlighted bar carries the brand colour.
// Bars grow from the baseline, staggered 34ms apart.
// ————————————————————————————————————————————————————————————
const Bars = ({
  data = [], w = 68, h = 26, color = VT.brand, muted = VT.muted, highlight = -1,
  labels, gap = 3, radius, title,
}) => {
  const vals = (data || []).filter((n) => typeof n === "number" && isFinite(n));
  const n = vals.length;
  const labH = labels && labels.length ? clamp(h * 0.42, 9, 13) : 0;
  if (!n) return <svg width={w} height={h + labH} aria-hidden="true" style={{ display: "block" }} />;

  const max = Math.max(...vals, 1);
  const bw = (w - gap * (n - 1)) / n;
  const rx = radius != null ? radius : Math.min(bw / 2, 2.5);
  const labFs = clamp(labH * 0.72, 7, 9.5);

  return (
    <svg width={w} height={r2(h + labH)} viewBox={`0 0 ${r2(w)} ${r2(h + labH)}`}
      role={title ? "img" : "presentation"} aria-label={title || undefined} aria-hidden={title ? undefined : true}
      style={{ display: "block", flexShrink: 0 }} shapeRendering="geometricPrecision"
    >
      {vals.map((v, i) => {
        const bh = Math.max(2, (v / max) * h);
        const x = r2(i * (bw + gap));
        const hot = i === highlight;
        return (
          <g key={i}>
            <rect className="viz-bar" x={x} y={r2(h - bh)} width={r2(bw)} height={r2(bh)} rx={r2(rx)}
              fill={hot ? color : muted}
              style={{ animationDelay: i * 34 + "ms" }} />
            {labH > 0 && (
              <text x={r2(x + bw / 2)} y={r2(h + labFs + 1)} textAnchor="middle"
                fontSize={r2(labFs)} fontWeight={hot ? 750 : 600} fill={hot ? VT.brandInk : VT.faint}>
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ————————————————————————————————————————————————————————————
// VIZ_CSS — inject once, next to the app's own <style> block.
// Every class is viz- prefixed so nothing collides with app.jsx.
// ————————————————————————————————————————————————————————————
const VIZ_CSS = `
.viz-in{animation:viz-in .32s cubic-bezier(.22,1.2,.36,1) both}
.viz-alive{animation:viz-in .32s cubic-bezier(.22,1.2,.36,1) both,viz-breathe 2.6s ease-in-out .32s infinite;transform-origin:50% 50%}
.viz-halo{transform-origin:50% 50%;animation:viz-halo 2.6s ease-in-out infinite}
.viz-dot{animation:viz-dot 2.6s ease-in-out infinite}
.viz-ring{transition:stroke-dashoffset .9s cubic-bezier(.22,1,.36,1),stroke .3s ease}
.viz-urgent{animation:viz-urgent 1.8s ease-in-out infinite}
.viz-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:viz-draw .7s cubic-bezier(.3,.9,.4,1) both}
.viz-fade{opacity:0;animation:viz-fade .5s ease-out .28s both}
.viz-cap{opacity:0;transform:scale(.4);animation:viz-cap .3s cubic-bezier(.34,1.7,.5,1) .58s both}
.viz-bar{transform-box:fill-box;transform-origin:50% 100%;animation:viz-grow .46s cubic-bezier(.22,1.2,.36,1) both}
@keyframes viz-in{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:none}}
@keyframes viz-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.055)}}
@keyframes viz-halo{0%,100%{transform:scale(1);opacity:.32}50%{transform:scale(1.22);opacity:0}}
@keyframes viz-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.7}}
@keyframes viz-urgent{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
@keyframes viz-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes viz-fade{from{opacity:0}to{opacity:1}}
@keyframes viz-cap{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
@keyframes viz-grow{from{transform:scaleY(0);opacity:.4}to{transform:scaleY(1);opacity:1}}
@media (prefers-reduced-motion:reduce){
  .viz-in,.viz-alive,.viz-halo,.viz-dot,.viz-urgent,.viz-draw,.viz-fade,.viz-cap,.viz-bar{animation:none!important;opacity:1!important;transform:none!important;stroke-dashoffset:0!important}
  .viz-ring{transition:none!important}
}
`;

// (bộ biểu đồ dùng trực tiếp trong file này, không cần export)

// ————— primitives —————
const Pill = ({ tone, children }) => {
  const m = { green: [T.green, T.greenBg], amber: [T.amber, T.amberBg], red: [T.red, T.redBg], brand: [T.brandInk, T.brandSoft], gray: [T.sub, "#F1EBE1"] }[tone || "gray"];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: m[0], background: m[1], borderRadius: 999, padding: "3px 9px", fontSize: 11.5, fontWeight: 650, whiteSpace: "nowrap" }}>{children}</span>;
};
const IconSq = ({ Icon, tint, color, size = 32 }) => (
  <span style={{ width: size, height: size, borderRadius: size * 0.36, background: tint || "#F1EBE1", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Icon size={size / 2} color={color || T.sub} strokeWidth={2} />
  </span>
);
// Emoji cũ ánh xạ sang cảnh vector. Chỗ nào chưa có cảnh thì vẫn rơi về
// gradient cũ, nên không màn hình nào bị trống.
const EMOJI_SCENE = {
  "🚗": "car", "🛞": "inspect", "🍲": "meal", "🥘": "meal", "🎤": "concert",
  "🎫": "ticket", "🎟️": "ticket", "🍵": "tea", "📞": "call", "🧾": "doc",
  "🚫": "shield", "⚠️": "call", "✅": "win", "⚡": "win", "🏊": "swim",
};
const Thumb = ({ from, to, emoji, small, h = 128, scene }) => {
  const name = scene || EMOJI_SCENE[emoji];
  if (name) return <Scene name={name} h={h} small={small} />;
  return (
    <div style={{ height: small ? 56 : h, width: small ? 56 : "100%", borderRadius: small ? 12 : 14, background: `linear-gradient(140deg, ${from}, ${to})`, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: small ? 26 : 46, filter: "drop-shadow(0 5px 12px rgba(0,0,0,.3))" }}>{emoji}</span>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 90% at 18% 0%, rgba(255,255,255,.22), transparent 52%)" }} />
    </div>
  );
};
// Dấu của Mai giờ là một chữ m vẽ tay, không còn là chữ "m." nhét trong ô bo tròn.
const Mark = ({ size = 26, alive }) => <Logo size={size} alive={alive} />;
// ————— con lăn số dư —————
// Dùng đúng một lần trong cả app, ở màn biên lai. Số tiền đã trả là con số
// trừu tượng; số dư bị trừ đi mới là thứ anh thật sự cảm. Chữ số hàng đơn vị
// quay trước, chữ số dẫn đầu hạ cánh sau cùng, đúng cơ học máy đếm.
// Ràng buộc: hai giá trị phải cùng độ dài chuỗi.
const Odometer = ({ from, to, size = 22, delay = 420 }) => {
  const [v, setV] = useState(from);
  useEffect(() => {
    const t = setTimeout(() => { setV(to); if (navigator.vibrate) navigator.vibrate(8); }, delay);
    return () => clearTimeout(t);
  }, [to, delay]);
  const s = fmt(v), sizer = fmt(Math.max(from, to)), D = "0123456789";
  return (
    <span style={{ fontFamily: DISPLAY, fontWeight: 600, ...num, fontSize: size, color: T.ink, display: "inline-grid", lineHeight: 1.1 }}>
      <span style={{ gridArea: "1/1", visibility: "hidden", whiteSpace: "pre" }}>{sizer}</span>
      <span style={{ gridArea: "1/1", display: "inline-flex", justifyContent: "flex-end" }}>
        {s.split("").map((ch, i) => {
          const d = D.indexOf(ch);
          if (d < 0) return <span key={i} style={{ opacity: ch === "." ? 0.45 : 1 }}>{ch}</span>;
          return (
            <span key={i} className="odo" style={{ "--d": d, "--i": s.length - 1 - i }}>
              <span className="odoCol">{D.split("").map((n) => <span key={n} style={{ height: "1.1em" }}>{n}</span>)}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
};
// Giao cả câu cho layout một lần, rồi mở từng chữ bằng CSS. Animate cách
// trình bày, đừng animate nội dung: khung không giật, và cả câu trả lời tốn
// đúng hai lần render thay vì một lần cho mỗi chữ.
const Reveal = ({ text, on }) => {
  if (!on) return text;
  const w = String(text).split(" ");
  return w.map((s, i) => (
    <span key={i} className="wordIn" style={{ "--i": Math.min(i, 26) }}>{s}{i < w.length - 1 ? " " : ""}</span>
  ));
};
const Thinking = () => (
  <div className="rise" style={{ display: "flex", gap: 9, padding: "8px 0 6px" }}>
    <Mark size={26} alive />
    <div style={{ flex: 1, paddingTop: 5 }}>
      <div className="shim" style={{ height: 9, width: "72%" }} />
      <div className="shim" style={{ height: 9, width: "44%", marginTop: 7 }} />
    </div>
  </div>
);
const Burst = () => {
  // Thành tựu ở đây là không bị phạt và không bị cô nhắc tên trước 32 phụ
  // huynh. Đó là sự nhẹ nhõm, không phải tiệc tùng. Một quầng sáng ấm nở ra
  // một lần, và một nét check được vẽ ra. Không có giấy vụn.
  return <div style={{ position: "relative", height: 0 }}><span className="bloom" /></div>;
};
const StrokeCheck = ({ size = 30, color = T.green, delay = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: "inline-block", overflow: "visible", verticalAlign: "middle" }}>
    <circle cx="16" cy="16" r="14.4" stroke={color} strokeWidth="1.4" opacity=".32" className="ring" style={{ animationDelay: delay + "ms" }} />
    <path d="M9.6 16.4 L14 20.7 L22.5 11.7" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="tick" style={{ animationDelay: (delay + 150) + "ms" }} />
  </svg>
);
const CardBox = ({ children, style, onClick }) => (
  <div onClick={onClick} className={"rise" + (onClick ? " press" : "")} style={{ background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 16, boxShadow: "var(--e1)", ...style }}>{children}</div>
);
const Btn = ({ children, onClick, kind, style, wide }) => {
  const k = { primary: [T.brand, "#FFFDF9", "none"], soft: [T.surf, T.ink, `1px solid ${T.hair}`], ghost: ["transparent", T.sub, "none"], danger: [T.red, "#FFFDF9", "none"] }[kind || "primary"];
  return (
    <button onClick={onClick} className="btn" style={{ background: k[0], color: k[1], border: k[2], width: wide ? "100%" : undefined, padding: wide ? "13px 16px" : undefined, fontSize: wide ? 14.5 : 13, boxShadow: kind === "primary" ? "0 2px 8px rgba(194,85,47,.28)" : "none", ...style }}>{children}</button>
  );
};
const AuthBtn = ({ label, onDone }) => {
  const [s, setS] = useState(0);
  return (
    <button onClick={s === 0 ? () => { setS(1); setTimeout(() => { setS(2); setTimeout(onDone, 260); }, 620); } : undefined}
      className="btn" style={{ background: s === 2 ? T.green : T.brand, color: "#FFFDF9", boxShadow: s === 1 ? `0 0 0 4px ${T.brandSoft}` : "0 2px 8px rgba(194,85,47,.28)", minWidth: 64, transform: s === 1 ? "scale(.96)" : "none" }}>
      {s === 1 ? <ScanFace size={15} className="spin-soft" /> : s === 2 ? <Check size={15} strokeWidth={3} className="pop" /> : label}
    </button>
  );
};
// Hình 38px nhưng vùng chạm 44px theo HIG: nới hit area bằng padding âm,
// không bằng cách vẽ nút to hơn.
const HBtn = ({ Icon, onTap, ml }) => (
  <button onClick={onTap} className="btn tap44" style={{ border: `1px solid ${T.hair}`, background: T.surf, borderRadius: 999, width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: ml ? 8 : 0, flexShrink: 0, boxShadow: "var(--e1)" }}>
    <Icon size={16} color={T.sub} />
  </button>
);
const Head = ({ back, title, right, sub }) => (
  <header style={{ padding: "11px 14px", background: T.surf, borderBottom: `1px solid ${T.hair}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
    {back && <button onClick={back} className="btn" style={{ background: "none", padding: "8px 8px 8px 2px", marginLeft: -6, display: "flex" }}><ChevronLeft size={22} color={T.ink} /></button>}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 19, color: T.ink, letterSpacing: -0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
        {sub}
      </div>
    </div>
    {right}
  </header>
);

// ————— gợi ý chạm —————
// Mỗi câu trả lời của Mai đẻ ra 2–3 gợi ý kế tiếp, nên anh đi hết demo
// được mà không cần gõ chữ nào.
const Chip = ({ children, onTap, i = 0 }) => (
  <button onClick={onTap} className="btn chip" style={{
    animationDelay: i * 45 + "ms", background: T.surf, color: T.ink,
    border: `1px solid ${T.hair}`, borderRadius: 999, padding: "11px 16px",
    fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
    boxShadow: "0 1px 2px rgba(60,45,30,.05)",
  }}>{children}</button>
);
const ChipRail = ({ items, seed, onPick }) => (
  <div style={{ position: "relative", flexShrink: 0, background: T.bg }}>
    <div key={seed} style={{ display: "flex", gap: 8, padding: "9px 14px", overflowX: "auto" }}>
      {items.map((c, i) => <Chip key={c} i={i} onTap={() => onPick(c)}>{c}</Chip>)}
    </div>
    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 28, pointerEvents: "none", background: `linear-gradient(90deg, rgba(247,244,237,0), ${T.bg})` }} />
  </div>
);

// nút thật dưới câu trả lời của Mai
const ReplyActions = ({ hit, onFlow, onGoto, onFiles }) => {
  const b = [];
  if (hit.action)
    b.push(<AuthBtn key="a" label={hit.action.label} onDone={() => { ding(true); if (hit.flow) onFlow(hit.flow); }} />);
  else if (hit.flow)
    b.push(<button key="f" onClick={() => onFlow(hit.flow)} className="btn" style={{ background: T.brand, color: "#FFFDF9", boxShadow: "0 2px 8px rgba(194,85,47,.28)", display: "inline-flex", alignItems: "center", gap: 3 }}>{hit.cta || "Mở"}<ChevronRight size={13} strokeWidth={2.6} /></button>);
  if (hit.goto)
    b.push(<button key="g" onClick={() => onGoto(hit.goto)} className="btn" style={{ background: T.surf, color: T.ink, border: `1px solid ${T.hair}`, display: "inline-flex", alignItems: "center", gap: 3 }}>{hit.gotoCta || "Mở kênh"}<ChevronRight size={13} strokeWidth={2.6} color={T.faint} /></button>);
  if (hit.files)
    b.push(<button key="d" onClick={onFiles} className="btn" style={{ background: T.surf, color: T.ink, border: `1px solid ${T.hair}`, display: "inline-flex", alignItems: "center", gap: 5 }}><FolderClosed size={13} color={T.sub} />Hồ sơ nhà mình</button>);
  if (!b.length) return null;
  return <div className="rise" style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>{b}</div>;
};

// ————————————————————————————————————————————————————————————
// STICKER · nhân vật riêng, vẽ theo phong cách kawaii pastel
// Viền nâu mảnh, mắt hạt có đốm sáng, má hồng, khối tròn. Bảng màu
// kéo về phía giấy ấm của m.ai chứ không dùng pastel lạnh, để sticker
// nằm trong khung chat không bị lạc tông.
// ————————————————————————————————————————————————————————————
const SK = {
  ink: "#8A6A52", inkSoft: "#A88A70",
  cream1: "#FCF5EA", cream2: "#F0DFC8",
  bear1: "#DFC6AC", bear2: "#C3A283",
  cat1: "#F1EAE2", cat2: "#DACDBF",
  pig1: "#FADFDD", pig2: "#EEBFBE",
  blush: "#EFA79C", cloth: "#CBDDEA", gold: "#EDC373",
  bowl: "#EFE7DA", leaf: "#A8C49A",
};
// Mắt: hạt tối kèm một đốm sáng nhỏ lệch trên — thứ làm mặt có hồn.
const SkEye = ({ x, y, r = 3.5 }) => (
  <>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.12} fill="#5C4render" />
  </>
);
const Eye = ({ x, y, r = 3.4 }) => (
  <g>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.14} fill="#5B4436" />
    <circle cx={x - r * 0.34} cy={y - r * 0.46} r={r * 0.34} fill="#FFFDF9" opacity="0.92" />
  </g>
);
const Blush = ({ x, y, w = 5.2 }) => <ellipse cx={x} cy={y} rx={w} ry={w * 0.62} fill={SK.blush} opacity="0.5" />;
const Ground = () => <ellipse cx="50" cy="93" rx="26" ry="3.6" fill={SK.ink} opacity="0.13" />;

const SkWrap = ({ children, uid, a, b }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
    <defs>
      <radialGradient id={uid} cx="38%" cy="30%" r="78%">
        <stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} />
      </radialGradient>
    </defs>
    {children}
  </svg>
);

// 1 · Mèo bưng tô cơm — "Ăn cơm chưa"
const StkRice = () => { const u = useUid("sk1"); return (
  <SkWrap uid={u} a={SK.cat1} b={SK.cat2}>
    <Ground />
    <path d="M31 40 29 19l17 9Z" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M69 40 71 19l-17 9Z" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M33.5 36.5 32.6 24l9.6 5.2Z" fill={SK.blush} opacity="0.55" />
    <path d="M66.5 36.5 67.4 24l-9.6 5.2Z" fill={SK.blush} opacity="0.55" />
    <path d="M50 26c14 0 22 9 22 21 0 13-9 21-22 21s-22-8-22-21c0-12 8-21 22-21Z" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" />
    <path d="M31 64c-3 10-1 21 5 25h28c6-4 8-15 5-25" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" strokeLinejoin="round" />
    <Eye x={42} y={45} /><Eye x={58} y={45} />
    <path d="M50 51.4 48.4 53h3.2Z" fill={SK.blush} stroke={SK.ink} strokeWidth="1.1" strokeLinejoin="round" />
    <path d="M46.8 55.6c1 1.3 2.4 1.3 3.2 0 .8 1.3 2.2 1.3 3.2 0" stroke={SK.ink} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M24 47h7M24 52h7M69 47h7M69 52h7" stroke={SK.inkSoft} strokeWidth="1.3" strokeLinecap="round" opacity="0.75" />
    <Blush x={34.5} y={53} /><Blush x={65.5} y={53} />
    <path d="M31 79h38c0 9-8 14-19 14s-19-5-19-14Z" fill={SK.bowl} stroke={SK.ink} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M35 79c3-6 9-9 15-9s12 3 15 9" fill="#FFFDF9" stroke={SK.ink} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M27 76c3 4 6 6 9 7M73 76c-3 4-6 6-9 7" stroke={SK.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M42 68c-2-4 2-5 0-9M58 68c2-4-2-5 0-9" stroke={SK.inkSoft} strokeWidth="1.7" fill="none" strokeLinecap="round" opacity="0.7" />
  </SkWrap>
); };

// 2 · Gấu chắp tay — "Cảm ơn nha"
const StkThanks = () => { const u = useUid("sk2"); return (
  <SkWrap uid={u} a={SK.bear1} b={SK.bear2}>
    <Ground />
    <circle cx="32" cy="28" r="9" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.7" />
    <circle cx="68" cy="28" r="9" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.7" />
    <circle cx="32" cy="28" r="4.4" fill={SK.pig1} opacity="0.85" />
    <circle cx="68" cy="28" r="4.4" fill={SK.pig1} opacity="0.85" />
    <path d="M50 22c15 0 23 10 23 22s-9 21-23 21-23-9-23-21 8-22 23-22Z" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" />
    <path d="M33 63c-3 9-2 20 4 24h26c6-4 7-15 4-24" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" strokeLinejoin="round" />
    <ellipse cx="50" cy="50" rx="9" ry="7" fill={SK.cream1} stroke={SK.ink} strokeWidth="1.4" />
    <ellipse cx="50" cy="47" rx="2.6" ry="2" fill={SK.ink} />
    <Eye x={40} y={41} /><Eye x={60} y={41} />
    <Blush x={32} y={49} /><Blush x={68} y={49} />
    <ellipse cx="44.5" cy="77" rx="7.4" ry="6" fill={SK.cream1} stroke={SK.ink} strokeWidth="1.6" transform="rotate(-14 44.5 77)" />
    <ellipse cx="55.5" cy="77" rx="7.4" ry="6" fill={SK.cream1} stroke={SK.ink} strokeWidth="1.6" transform="rotate(14 55.5 77)" />
    <path d="M41 74.5v4.5M45 73.5v5M56 73.5v5M60 74.5v4.5" stroke={SK.inkSoft} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    <path d="M28 60l-4-5M72 60l4-5" stroke={SK.gold} strokeWidth="2.2" strokeLinecap="round" />
  </SkWrap>
); };

// 3 · Thỏ giơ tay — "Chừa em nha"
const StkMe = () => { const u = useUid("sk3"); return (
  <SkWrap uid={u} a={SK.cream1} b={SK.cream2}>
    <Ground />
    <path d="M40 30c-2-14 0-22 4-22s6 8 5 21M60 30c2-14 0-22-4-22s-6 8-5 21" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M43 14c-1 8-.6 12 .4 15M57 14c1 8 .6 12-.4 15" stroke={SK.blush} strokeWidth="2.6" fill="none" opacity="0.55" strokeLinecap="round" />
    <path d="M50 27c14 0 21 9 21 20 0 12-8 19-21 19s-21-7-21-19c0-11 7-20 21-20Z" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" />
    <path d="M33 64c-3 9-1 19 5 23h24c6-4 8-14 5-23" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" strokeLinejoin="round" />
    <Eye x={42} y={44} /><Eye x={58} y={44} />
    <path d="M50 49v2.4M47.4 53.4c1.4 1.6 3.8 1.6 5.2 0" stroke={SK.ink} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <Blush x={35} y={51} /><Blush x={65} y={51} />
    <path d="M70 70c6-3 9-9 8-15" fill="none" stroke={SK.ink} strokeWidth="1.8" strokeLinecap="round" />
    <ellipse cx="79" cy="52" rx="6" ry="7" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.7" />
    <path d="M30 72c-3 3-4 7-3 10" stroke={SK.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </SkWrap>
); };

// 4 · Heo đất — "Đã trả rồi"
const StkPaid = () => { const u = useUid("sk4"); return (
  <SkWrap uid={u} a={SK.pig1} b={SK.pig2}>
    <Ground />
    <path d="M50 30c17 0 27 11 27 25 0 12-9 20-27 20s-27-8-27-20c0-14 10-25 27-25Z" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" />
    <path d="M31 33c-2-7 0-11 3-11s6 4 6 9M69 33c2-7 0-11-3-11s-6 4-6 9" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.7" strokeLinejoin="round" />
    <ellipse cx="50" cy="56" rx="10.5" ry="8" fill={SK.pig2} stroke={SK.ink} strokeWidth="1.6" />
    <ellipse cx="46.5" cy="56" rx="1.7" ry="2.3" fill={SK.ink} opacity="0.75" />
    <ellipse cx="53.5" cy="56" rx="1.7" ry="2.3" fill={SK.ink} opacity="0.75" />
    <Eye x={40} y={44} /><Eye x={60} y={44} />
    <Blush x={31} y={52} /><Blush x={69} y={52} />
    <rect x="42" y="30" width="16" height="3.4" rx="1.7" fill={SK.ink} opacity="0.5" />
    <path d="M46 24c1-4 3-6 5-6" stroke={SK.gold} strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="60" cy="20" r="6.5" fill={SK.gold} stroke={SK.ink} strokeWidth="1.6" />
    <path d="M57 20.2l2 2.2 4-4.4" stroke="#FFFDF9" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28 70c1 5 3 8 5 9M72 70c-1 5-3 8-5 9" stroke={SK.ink} strokeWidth="1.7" fill="none" strokeLinecap="round" />
  </SkWrap>
); };

// 5 · Mèo ngủ — "Đi ngủ nha"
const StkSleep = () => { const u = useUid("sk5"); return (
  <SkWrap uid={u} a={SK.cat1} b={SK.cat2}>
    <Ground />
    <path d="M20 80c0-12 13-20 30-20s30 8 30 20c0 5-4 8-12 8H32c-8 0-12-3-12-8Z" fill={SK.cloth} stroke={SK.ink} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M27 52c-1-7 1-11 4-11s5 3 5 7M63 52c1-7-1-11-4-11s-5 3-5 7" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.7" strokeLinejoin="round" />
    <ellipse cx="45" cy="58" rx="21" ry="18" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" />
    <path d="M36 56c1.6 2 4.4 2 6 0M48 56c1.6 2 4.4 2 6 0" stroke={SK.ink} strokeWidth="1.7" fill="none" strokeLinecap="round" />
    <Blush x={32} y={63} /><Blush x={58} y={63} />
    <path d="M43.6 64c1.2 1.4 3.6 1.4 4.8 0" stroke={SK.ink} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M70 34c4 0 4 5 0 5s-4 5 0 5" stroke={SK.inkSoft} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M80 22c3 0 3 4 0 4s-3 4 0 4" stroke={SK.inkSoft} strokeWidth="1.7" fill="none" strokeLinecap="round" opacity="0.7" />
  </SkWrap>
); };

// 6 · Gấu ôm tim — "Thương quá"
const StkLove = () => { const u = useUid("sk6"); return (
  <SkWrap uid={u} a={SK.bear1} b={SK.bear2}>
    <Ground />
    <circle cx="31" cy="27" r="8.6" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.7" />
    <circle cx="69" cy="27" r="8.6" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.7" />
    <circle cx="31" cy="27" r="4.2" fill={SK.pig1} opacity="0.85" />
    <circle cx="69" cy="27" r="4.2" fill={SK.pig1} opacity="0.85" />
    <path d="M50 21c15 0 23 10 23 21s-9 20-23 20-23-8-23-20 8-21 23-21Z" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" />
    <path d="M34 61c-3 9-2 19 4 23h24c6-4 7-14 4-23" fill={`url(#${u})`} stroke={SK.ink} strokeWidth="1.8" strokeLinejoin="round" />
    <ellipse cx="50" cy="48" rx="8.4" ry="6.6" fill={SK.cream1} stroke={SK.ink} strokeWidth="1.4" />
    <ellipse cx="50" cy="45.4" rx="2.4" ry="1.9" fill={SK.ink} />
    <path d="M45.5 50.5c1.5 1.6 3.5 1.6 4.5 0M50 50.5c1 1.6 3 1.6 4.5 0" stroke={SK.ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <Eye x={40} y={39} /><Eye x={60} y={39} />
    <Blush x={31} y={47} /><Blush x={69} y={47} />
    <path d="M50 88c-9-6-14-11-14-17 0-4 3-7 7-7 3 0 5 2 7 4 2-2 4-4 7-4 4 0 7 3 7 7 0 6-5 11-14 17Z" fill={SK.blush} stroke={SK.ink} strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M44 68c1.5-1 3-1 4 0" stroke="#FFFDF9" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.75" />
    <path d="M22 44c-3-2-3-6 0-7M78 44c3-2 3-6 0-7" stroke={SK.blush} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
  </SkWrap>
); };

const STICKERS = [
  { id: "rice", n: "Ăn cơm chưa", D: StkRice },
  { id: "thanks", n: "Cảm ơn nha", D: StkThanks },
  { id: "me", n: "Chừa em nha", D: StkMe },
  { id: "paid", n: "Đã trả rồi", D: StkPaid },
  { id: "love", n: "Thương quá", D: StkLove },
  { id: "sleep", n: "Đi ngủ nha", D: StkSleep },
];
const stickerOf = (id) => STICKERS.find((s) => s.id === id) || STICKERS[0];

// ————— messages & rows —————
const Msg = ({ m }) => {
  if (m.type === "sticker") {
    const st = stickerOf(m.st);
    return (
      <div className="rise" style={{ display: "flex", justifyContent: m.from === "vy" ? "flex-end" : "flex-start", padding: "5px 0" }}>
        <span className="stk-pop" style={{ width: 116, height: 116, display: "block" }} title={st.n}><st.D /></span>
      </div>
    );
  }
  if (m.type === "ext")
    return (
      <CardBox onClick={m.onTap} style={{ margin: "8px 0", padding: "10px 13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ width: 16, height: 16, borderRadius: 5, background: m.color || "#0068FF", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            {m.Icon ? <m.Icon size={10} color="#fff" strokeWidth={2.5} /> : null}
          </span>
          <span style={{ fontSize: 11.5, color: T.sub, fontWeight: 650 }}>{m.src}</span>
          <span style={{ fontSize: 11, color: T.faint, marginLeft: "auto", ...num }}>{m.time}</span>
        </div>
        <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.5 }}>{m.text}</div>
      </CardBox>
    );
  if (m.type === "act")
    return (
      <div className="rise" style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 2px" }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: m.done ? T.faint : m.tone === "green" ? T.green : T.brand, marginTop: 7, flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: m.done ? T.faint : T.ink, lineHeight: 1.55, flex: 1, ...num }}>
          {m.text}
          {m.undo && !m.done && <button onClick={m.undo} className="btn" style={{ background: "#F1EBE1", color: T.sub, fontSize: 11.5, padding: "4px 10px", marginLeft: 8, fontWeight: 600 }}>{m.undoLabel || "Giữ như cũ"}</button>}
        </div>
      </div>
    );
  const mine = m.from === "vy", mai = m.from === "mai";
  if (mai)
    return (
      <div className="rise" style={{ display: "flex", gap: 9, padding: "8px 0 6px" }}>
        <Mark size={26} alive={m.streaming} />
        <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
          <div style={{ fontSize: 14.5, lineHeight: 1.62, color: T.ink }}><Reveal text={m.text} on={m.streaming} /></div>
          {m.src && !m.streaming && <div className="rise" style={{ marginTop: 7 }}><Pill tone="brand">{m.src}</Pill></div>}
          {!m.streaming && m.extra}
        </div>
      </div>
    );
  return (
    <div className="rise" style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 7, padding: "4px 0" }}>
      {!mine && m.name && <Avatar name={m.name} size={26} />}
      <div style={{ maxWidth: "84%" }}>
        {!mine && m.name && <div style={{ fontSize: 11, fontWeight: 650, color: T.sub, margin: "0 0 3px 4px" }}>{m.name}</div>}
        <div style={{ background: mine ? T.dark : T.surf, color: mine ? "#FFFDF9" : T.ink, border: mine ? "none" : `1px solid ${T.hair}`, boxShadow: mine ? "0 2px 10px rgba(44,40,34,.18)" : "var(--e1)", borderRadius: 18, borderBottomRightRadius: mine ? 6 : 18, borderBottomLeftRadius: mine ? 18 : 6, padding: "10px 13px", fontSize: 14.5, lineHeight: 1.55 }}>
          {m.text}{m.extra}
        </div>
      </div>
    </div>
  );
};

const Row = ({ Icon, iconTint, iconColor, title, meta, metaTone, amount, pill, cta, done, doneMeta, onTap, quote, quoteWho, last, hot }) => (
  <div onClick={onTap} className={"press" + (done ? " sweep" : "")} style={{ display: "flex", gap: 11, padding: "13px 14px", borderBottom: last ? "none" : `1px solid ${T.hair}`, cursor: "pointer", alignItems: "flex-start", boxShadow: hot ? `inset 0 0 0 2px ${T.amber}66` : "none", borderRadius: hot ? 14 : 0, background: done ? "rgba(230,244,236,.42)" : "transparent", transition: "box-shadow .4s, background .5s" }}>
    <IconSq Icon={Icon} tint={done ? T.greenBg : iconTint} color={done ? T.green : iconColor} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontWeight: 650, fontSize: 14.5, color: T.ink, flex: 1, ...num }}>{title}</span>
        {amount && <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 15.5, color: T.ink, ...num }}>{amount}</span>}
      </div>
      {quote && !done && (
        <div style={{ margin: "6px 0 2px", borderLeft: `2px solid ${T.hair}`, paddingLeft: 8 }}>
          <span style={{ fontSize: 11, color: T.sub, fontWeight: 650, ...num }}>{quoteWho} </span>
          <span style={{ fontSize: 12.5, color: T.ink }}>{quote}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
        <span style={{ fontSize: 12, color: done ? T.sub : metaTone === "amber" ? T.amber : T.faint, fontWeight: !done && metaTone === "amber" ? 650 : 400, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...num }}>{done ? doneMeta : meta}</span>
        {done ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Pill tone="green"><Check size={11} strokeWidth={3} /> {done}</Pill>
            <ChevronRight size={15} color={T.faint} />
          </span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {pill}
            <span className="btn" style={{ background: T.brand, color: "#FFFDF9", boxShadow: "0 2px 8px rgba(194,85,47,.28)", display: "inline-flex", alignItems: "center", gap: 3 }}>{cta}<ChevronRight size={13} strokeWidth={2.6} /></span>
          </span>
        )}
      </div>
    </div>
  </div>
);

const MaiBanner = ({ text, cta, done, doneText, onTap, thumb }) => (
  <div onClick={onTap} className="rise press" style={{ margin: "2px 0 10px", border: `1px solid ${done ? "#CFE7DA" : "#F0DCCD"}`, background: done ? T.greenBg : T.brandSoft, borderRadius: 18, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "background .5s, border-color .5s" }}>
    {thumb ? <Thumb small {...thumb} /> : <Mark size={26} />}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10.5, fontWeight: 750, color: done ? T.green : T.brandInk, letterSpacing: 0.2 }}>MAI</div>
      <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.45, marginTop: 1, ...num }}>{done ? doneText : text}</div>
    </div>
    {done ? <Pill tone="green"><Check size={11} strokeWidth={3} /> Xong</Pill> : <span className="btn" style={{ background: T.brand, color: "#FFFDF9", flexShrink: 0 }}>{cta}</span>}
  </div>
);

const Post = ({ up, title, meta, body, hero, thumb, onTap, onAuthor, comments }) => {
  const [v, setV] = useState(false);
  return (
    <CardBox style={{ margin: "8px 0", padding: "11px 13px" }}>
      <div style={{ display: "flex", gap: 11 }}>
        <button onClick={() => { setV(!v); ding(); }} className="btn" style={{ background: "none", padding: 4, margin: -4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: v ? T.brand : T.faint, alignSelf: "flex-start" }}>
          <ArrowBigUp size={20} fill={v ? T.brand : "none"} strokeWidth={1.9} className={v ? "pop" : ""} />
          <span style={{ fontSize: 11.5, fontWeight: 700, ...num }}>{up + (v ? 1 : 0)}</span>
        </button>
        <div onClick={onTap} className="press" style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 650, fontSize: 14.5, color: T.ink, lineHeight: 1.4 }}>{title}</div>
              {body && <div style={{ fontSize: 13, color: T.sub, marginTop: 3, lineHeight: 1.5 }}>{body}</div>}
            </div>
            {thumb && <Thumb small {...thumb} />}
          </div>
          {hero && <div style={{ marginTop: 9 }}><Thumb {...hero} /></div>}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
            <span onClick={(e) => { e.stopPropagation(); onAuthor && onAuthor(); }} style={{ fontSize: 11.5, color: T.brandInk, fontWeight: 650, textDecoration: "underline" }}>{meta.who}</span>
            <span style={{ fontSize: 11.5, color: T.faint, ...num }}>· {meta.when} · {comments || 0} bình luận</span>
            <ChevronRight size={13} color={T.faint} style={{ marginLeft: "auto" }} />
          </div>
        </div>
      </div>
    </CardBox>
  );
};

// ————— sheet & wizard engine —————
const Sheet = ({ onClose, children, tall }) => (
  <>
    <div className="dim" onClick={onClose} />
    <div className="sheet" style={{ maxHeight: tall ? "92%" : "86%", overflowY: "auto" }}>{children}</div>
  </>
);

const Foot = ({ children }) => <div style={{ marginTop: 16, display: "flex", gap: 8 }}>{children}</div>;
const H1 = ({ children, sub }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 600, color: T.ink, letterSpacing: -0.3, lineHeight: 1.25 }}>{children}</div>
    {sub && <div style={{ fontSize: 13, color: T.sub, marginTop: 5, lineHeight: 1.5 }}>{sub}</div>}
  </div>
);
const KV = ({ rows }) => (
  <div style={{ borderTop: `1px solid ${T.hair}` }}>
    {rows.map(([k, v, tone], i) => (
      <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "10px 0", borderBottom: `1px solid ${T.hair}`, fontSize: 13.5 }}>
        <span style={{ color: T.sub, flexShrink: 0 }}>{k}</span>
        <span style={{ color: tone === "amber" ? T.amber : tone === "green" ? T.green : T.ink, fontWeight: 600, textAlign: "right", ...num }}>{v}</span>
      </div>
    ))}
  </div>
);
const Evidence = ({ src, time, text, color, Icon }) => (
  <div style={{ background: T.bg, border: `1px solid ${T.hair}`, borderLeft: `3px solid ${color || "#0068FF"}`, borderRadius: 12, padding: "10px 12px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
      {Icon ? <Icon size={12} color={T.sub} /> : null}
      <span style={{ fontSize: 11, color: T.sub, fontWeight: 650 }}>{src}</span>
      <span style={{ fontSize: 11, color: T.faint, marginLeft: "auto", ...num }}>{time}</span>
    </div>
    <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.55 }}>{text}</div>
  </div>
);
const Choice = ({ items, value, onPick }) => (
  <div style={{ display: "grid", gap: 8 }}>
    {items.map((it) => {
      const on = value === it.id;
      return (
        <button key={it.id} onClick={() => { onPick(it.id); ding(); }} className="btn press" disabled={it.off}
          style={{ background: on ? T.brandSoft : T.surf, border: `1.5px solid ${on ? T.brand : T.hair}`, borderRadius: 14, padding: "11px 12px", display: "flex", alignItems: "center", gap: 11, textAlign: "left", opacity: it.off ? 0.45 : 1 }}>
          {it.Icon ? <IconSq Icon={it.Icon} tint={on ? "#F6DFD1" : "#F1EBE1"} color={on ? T.brand : T.sub} size={30} /> : it.emoji ? <span style={{ fontSize: 20, width: 30, textAlign: "center" }}>{it.emoji}</span> : null}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 650, color: T.ink, whiteSpace: "normal" }}>{it.t}</div>
            {it.s && <div style={{ fontSize: 11.5, color: it.warn ? T.amber : T.sub, marginTop: 2, whiteSpace: "normal", ...num }}>{it.s}</div>}
          </div>
          {it.right && <span style={{ fontSize: 12.5, fontWeight: 650, color: T.ink, ...num }}>{it.right}</span>}
          <span style={{ width: 18, height: 18, borderRadius: 9, border: `1.5px solid ${on ? T.brand : T.hair}`, background: on ? T.brand : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {on && <Check size={11} color="#FFFDF9" strokeWidth={3.5} />}
          </span>
        </button>
      );
    })}
  </div>
);
const Toggle = ({ on, onTap, t, s }) => (
  <button onClick={() => { onTap(!on); ding(); }} className="btn press" style={{ background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "11px 12px", display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left" }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13.5, fontWeight: 650, color: T.ink, whiteSpace: "normal" }}>{t}</div>
      {s && <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2, whiteSpace: "normal" }}>{s}</div>}
    </div>
    <span style={{ width: 40, height: 24, borderRadius: 999, background: on ? T.green : "#DCD3C4", position: "relative", flexShrink: 0, transition: "background .2s" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 18, height: 18, borderRadius: 9, background: "#FFFDF9", transition: "left .2s cubic-bezier(.34,1.56,.64,1)", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </span>
  </button>
);
const Qty = ({ items, set }) => (
  <div>
    {items.map((it, i) => (
      <div key={it.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.hair}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{it.n}</div>
          <div style={{ fontSize: 11.5, color: T.faint, ...num }}>{fmt(it.p)} · {it.brand || "WinMart+"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => set(i, Math.max(0, it.q - 1))} className="btn" style={{ background: "#F1EBE1", color: T.ink, width: 30, height: 30, padding: 0, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={13} /></button>
          <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700, fontSize: 14, ...num }}>{it.q}</span>
          <button onClick={() => set(i, it.q + 1)} className="btn" style={{ background: T.brandSoft, color: T.brand, width: 30, height: 30, padding: 0, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={13} /></button>
        </div>
        <span style={{ width: 74, textAlign: "right", fontWeight: 650, fontSize: 13.5, ...num }}>{fmt(it.p * it.q)}</span>
      </div>
    ))}
  </div>
);
const Slots = ({ list, value, onPick }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
    {list.map((s) => {
      const on = value === s.t;
      return (
        <button key={s.t} disabled={s.full} onClick={() => { onPick(s.t); ding(); }} className="btn press"
          style={{ background: on ? T.brand : s.full ? "#F1EBE1" : T.surf, color: on ? "#FFFDF9" : s.full ? T.faint : T.ink, border: `1.5px solid ${on ? T.brand : T.hair}`, borderRadius: 13, padding: "10px 4px", display: "block", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, ...num }}>{s.t}</div>
          <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{s.full ? (s.note || "hết chỗ") : s.note}</div>
        </button>
      );
    })}
  </div>
);
const Track = ({ steps, speed = 1100, onEnd }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length - 1) { if (onEnd) onEnd(); return; }
    const t = setTimeout(() => { setI(i + 1); ding(); }, speed);
    return () => { clearTimeout(t); };
  }, [i, steps.length, speed, onEnd]);
  return (
    <div>
      {steps.map((s, k) => {
        const doneK = k < i, now = k === i;
        return (
          <div key={k} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span className={now ? "pop" : ""} style={{ width: 22, height: 22, borderRadius: 11, background: doneK || now ? T.green : "#EDE6DA", color: "#FFFDF9", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {doneK || now ? <Check size={12} strokeWidth={3.5} /> : null}
              </span>
              {k < steps.length - 1 && <span style={{ width: 2, height: 24, background: doneK ? T.green : "#EDE6DA" }} />}
            </div>
            <div style={{ paddingBottom: 12, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: now ? 700 : 600, color: doneK || now ? T.ink : T.faint }}>{s.t}</div>
              {(doneK || now) && s.s && <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2, ...num }}>{s.s}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
const FaceStep = ({ label, sub, onDone, onCancel }) => {
  const [ok, setOk] = useState(false);
  const [stop, setStop] = useState(false);
  useEffect(() => {
    if (stop) return;
    const a = setTimeout(() => { setOk(true); ding(true); }, 1150);
    const b = setTimeout(() => { onDone(); }, 1950);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [onDone, stop]);
  return (
    <div style={{ textAlign: "center", padding: "18px 0 6px" }}>
      <div style={{ position: "relative", width: 122, height: 122, margin: "0 auto 18px" }}>
        <span className={ok ? "pop" : "breathe"} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: ok ? T.greenBg : T.brandSoft, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {ok ? <Check size={46} color={T.green} strokeWidth={3} /> : <ScanFace size={46} color={T.brand} />}
          {!ok && <div className="scan" />}
        </span>
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, color: T.ink }}>{ok ? "Đã xác thực" : label}</div>
      <div style={{ fontSize: 12.5, color: T.sub, marginTop: 6, ...num }}>{sub}</div>
      {/* Phải có đường lui ngay lúc đang quét, không phải sau khi tiền đi. */}
      {!ok && onCancel && (
        <button onClick={() => { setStop(true); onCancel(); }} className="btn press" style={{ marginTop: 16, background: "#F1EBE1", color: T.sub, fontSize: 15, padding: "11px 20px" }}>Dừng lại</button>
      )}
      {stop && <div style={{ marginTop: 14, fontSize: 14.5, color: T.green, fontWeight: 650 }}>Mai dừng rồi, chưa trừ đồng nào.</div>}
    </div>
  );
};

const AutoNext = ({ ms, onDone, children }) => {
  useEffect(() => {
    const t = setTimeout(() => { onDone(); }, ms);
    return () => { clearTimeout(t); };
  }, [ms, onDone]);
  return children;
};

// ————— một việc, một chạm — ai muốn xem kỹ thì có đường dài —————
// Người dùng thử bấm sáu lần chỉ để nói "Vy đón Bin". Từ đây mỗi luồng
// mở ra bằng việc làm luôn, còn các bước ở giữa thành tuỳ chọn.
const Express = ({ now, nowLabel, more, moreLabel }) => (
  <div style={{ marginTop: 16 }}>
    <Btn wide onClick={now}>{nowLabel}</Btn>
    <button onClick={more} className="btn press" style={{ width: "100%", marginTop: 8, background: T.surf, color: T.ink, border: `1px solid ${T.hair}`, fontSize: 15, padding: "12px 14px" }}>
      {moreLabel} <ChevronRight size={14} strokeWidth={2.4} style={{ verticalAlign: -2 }} />
    </button>
  </div>
);

const Wizard = ({ title, steps, onClose, ctx }) => {
  const [i, setI] = useState(0);
  const [d, setD] = useState({});
  const api = {
    d, ctx,
    set: (p) => setD((x) => ({ ...x, ...p })),
    next: () => setI((v) => Math.min(v + 1, steps.length - 1)),
    go: (n) => setI(n),
    close: onClose,
  };
  const back = () => { if (i === 0) onClose(); else setI(i - 1); };
  return (
    <Sheet onClose={onClose} tall>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <button onClick={back} className="btn" style={{ background: "#F1EBE1", padding: 7, borderRadius: 999, display: "flex" }}>
          {i === 0 ? <X size={15} color={T.sub} /> : <ChevronLeft size={15} color={T.sub} />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.6 }}>{title.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
            {steps.map((_, k) => (
              <span key={k} style={{ height: 3, flex: 1, borderRadius: 2, background: k <= i ? T.brand : "#EDE6DA", transition: "background .3s" }} />
            ))}
          </div>
        </div>
        <span style={{ fontSize: 11.5, color: T.faint, fontWeight: 650, ...num }}>{i + 1}/{steps.length}</span>
      </div>
      <div key={i} className="rise">{steps[i](api)}</div>
    </Sheet>
  );
};

// ————————————————————————————————————————————————————————————
// LUỒNG · mỗi luồng 6–7 bước, có bằng chứng nguồn và kết quả ghi hồ sơ
// ————————————————————————————————————————————————————————————

// 1 · TRẢ HỌC BƠI (7 bước)
const flowPay = (finish) => [
  (a) => (
    <>
      <H1 sub="Mai gom từ tin Vy chuyển tiếp sáng nay. Anh xem lại nguồn trước khi trả.">Khoản thu này từ đâu?</H1>
      <Evidence src="Zalo · Vy chuyển tiếp · nhóm bơi TH Lê Lợi" time="07:42" text="Cô Lan: Nhắc lần 2, phụ huynh đóng học phí bơi tháng 8 trước 17:00 hôm nay giúp cô. Đã đóng 14/32." />
      <div style={{ marginTop: 13, display: "flex", alignItems: "center", gap: 13, background: T.bg, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "11px 13px" }}>
        <Donut value={14} total={32} size={50} label="14" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 650, color: T.ink, ...num }}>14 trên 32 phụ huynh đã đóng</div>
          <div style={{ fontSize: 11.5, color: T.amber, fontWeight: 650, marginTop: 2, ...num }}>Còn 78 phút tới hạn 17:00</div>
        </div>
        <Countdown minutes={78} total={480} size={52} />
      </div>
      <div style={{ marginTop: 12 }}><KV rows={[["Hạn chót", "Hôm nay · 17:00", "amber"], ["Đã đóng", "14/32 phụ huynh"], ["Cô nhắc", "lần 2"]]} /></div>
      <Express
        now={() => a.go(3)}
        nowLabel="Xem lại rồi trả 850.000đ"
        more={a.next}
        moreLabel="Xem kỹ từng bước" />
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai tách nhỏ để anh biết mình trả cho cái gì.">Học bơi tháng 8 · Bin</H1>
      <KV rows={[["Lớp", "Bơi cơ bản · nhóm 6 bé"], ["Số buổi", "8 buổi · thứ Ba & Năm"], ["Đơn giá", "106.250đ/buổi"], ["Tổng", fmt(850000)], ["Kỳ trước", "tháng 7 · đã trả ✓", "green"]]} />
      <Foot><Btn wide onClick={a.next}>Chọn nguồn tiền</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="WinMoney miễn phí chuyển. Thẻ tính phí 1.100đ.">Trả bằng gì?</H1>
      <Choice value={a.d.src || "wm"} onPick={(v) => a.set({ src: v })}
        items={[
          { id: "wm", Icon: Wallet, t: "WinMoney", s: "số dư 2.480.000đ · phí 0đ", right: "0đ" },
          { id: "tcb", Icon: Banknote, t: "Techcombank ····4102", s: "tài khoản liên kết", right: "0đ" },
          { id: "visa", Icon: CreditCard, t: "VISA ····8890", s: "phí 1.100đ", right: "1.100đ" },
        ]} />
      <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Biên lai gửi riêng, không đăng vào nhóm 32 phụ huynh.">Ai nhận và ghi vào đâu</H1>
      <KV rows={[["Người nhận", "CLB bơi · TH Lê Lợi"], ["Nội dung", "Bơi T8 · Bin · lớp 3B"], ["Số tiền", fmt(850000)]]} />
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <Toggle on={a.d.rcpt !== false} onTap={(v) => a.set({ rcpt: v })} t="Gửi biên lai riêng cho cô Lan" s="chỉ cô thấy, không vào nhóm chung" />
        <Toggle on={a.d.file !== false} onTap={(v) => a.set({ file: v })} t="Lưu vào hồ sơ của Bin" s="để sang tháng Mai đối chiếu" />
      </div>
      <Foot><Btn wide onClick={a.next}>Xác nhận {fmt(850000)}</Btn></Foot>
    </>
  ),
  (a) => <FaceStep label="Nhìn vào máy để trả 850.000đ" sub="WinMoney · TCB ····4102" onDone={a.next} onCancel={() => a.go(Math.max(0, a.i - 1))} />,
  (a) => (
    <>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 12.5, color: T.sub }}>Học bơi tháng 8 · Bin</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 600, color: T.ink, margin: "6px 0 10px", letterSpacing: -1, ...num }}>−850.000đ</div>
        <Pill tone="green"><Check size={11} strokeWidth={3} /> Trả lúc 15:43</Pill>
        <div style={{ marginTop: 17, paddingTop: 13, borderTop: `1px solid ${T.hair}`, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11.5, color: T.faint, fontWeight: 650, letterSpacing: 0.3 }}>WinMoney còn lại</span>
          <Odometer from={2480000} to={1630000} size={22} delay={420} />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <KV rows={[["Trước hạn", "1 tiếng 17 phút", "green"], ["Nguồn tiền", a.d.src === "visa" ? "VISA ····8890" : a.d.src === "tcb" ? "TCB ····4102" : "WinMoney · TCB ····4102"], ["Mã giao dịch", "m_pay_8K2F91QD"], ["Biên lai", a.d.rcpt === false ? "chỉ lưu hồ sơ" : "đã gửi riêng cô Lan"]]} />
      </div>
      <Foot>
        <Btn kind="soft" onClick={a.next} style={{ flex: 1 }}><Download size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Lưu biên lai</Btn>
        <Btn onClick={a.next} style={{ flex: 1 }}>Xong</Btn>
      </Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "6px 0 2px" }}><Burst /><StrokeCheck size={34} /></div>
      <H1 sub="Mai đã cập nhật hồ sơ Bin, và sẽ nhắc anh kỳ tháng 9 vào ngày 02/09 để không bị nhắc tên lần nữa.">Xong rồi anh</H1>
      <div style={{ background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 14, padding: "11px 13px", fontSize: 13, color: "#14603C", lineHeight: 1.55 }}>
        Trả trước hạn 1 tiếng 17 phút · tránh được một lần cô nhắc tên trong nhóm 32 phụ huynh.
      </div>
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Về Nhà mình</Btn></Foot>
    </>
  ),
];

// 2 · ĐÓN BIN (6 bước)
const flowPickup = (finish) => [
  (a) => (
    <>
      <H1 sub="Mai đọc lịch của anh và lịch Vy chia sẻ, thấy 16:30 không có ai.">Đụng lịch rồi</H1>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ background: T.amberBg, border: "1px solid #F0D8B0", borderRadius: 14, padding: "11px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 750, color: T.amber, letterSpacing: 0.4 }}>LỊCH CỦA ANH</div>
          <div style={{ fontSize: 13.5, color: T.ink, marginTop: 3, ...num }}>16:00–17:00 · Họp khách hàng Q7</div>
        </div>
        <div style={{ background: T.bg, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "11px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 750, color: T.sub, letterSpacing: 0.4 }}>BIN</div>
          <div style={{ fontSize: 13.5, color: T.ink, marginTop: 3, ...num }}>16:30 · tan lớp bơi · cổng sau TH Lê Lợi</div>
        </div>
      </div>
      <Express
        now={() => { a.set({ who: "vy", at: "16:20" }); a.go(4); }}
        nowLabel="Chốt Vy đón lúc 16:20"
        more={a.next}
        moreLabel="Chọn người khác hoặc đổi giờ" />
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai chỉ hỏi, không tự hứa thay ai.">Ai đón Bin?</H1>
      <Choice value={a.d.who || "vy"} onPick={(v) => a.set({ who: v })}
        items={[
          { id: "vy", t: "Vy", s: "đã nhắn 15:38: em đón được" },
          { id: "me", t: "Anh rời họp sớm 20 phút", s: "kịp nếu đi 16:05", warn: true },
          { id: "co", t: "Cô Hạnh · cô của Bin", s: "đã đón hộ 3 lần trước" },
        ]} />
      <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub={a.d.who === "me" ? "Anh cần rời họp trước 16:05." : a.d.who === "co" ? "Mai sẽ hỏi cô Hạnh trước khi chốt." : "Đây là tin Vy nhắn, Mai không viết thay Vy."}>Chốt giờ</H1>
      {(!a.d.who || a.d.who === "vy") && <Evidence src="Vy · Nhà mình" time="15:38 · đã xem 15:39" color="#8A5FBF" text="Anh ơi em thấy anh còn họp, đừng lo vụ đón Bin nha 👍" />}
      <div style={{ marginTop: 12, fontSize: 12, fontWeight: 650, color: T.sub, marginBottom: 8 }}>Có mặt ở cổng lúc</div>
      <Slots value={a.d.at || "16:20"} onPick={(v) => a.set({ at: v })} list={[{ t: "16:20", note: "sớm 10 phút" }, { t: "16:30", note: "đúng giờ" }, { t: "16:45", note: "Bin chờ 15 phút" }]} />
      <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai gửi tin riêng từng người, không làm phiền cả nhóm.">Báo cho ai biết</H1>
      <div style={{ display: "grid", gap: 8 }}>
        <Toggle on={a.d.n1 !== false} onTap={(v) => a.set({ n1: v })} t="Vy" s="xác nhận lại giờ và điểm đón" />
        <Toggle on={a.d.n2 !== false} onTap={(v) => a.set({ n2: v })} t="Cô Hạnh · cô của Bin" s="để cô biết ai tới nhận bé" />
        <Toggle on={!!a.d.n3} onTap={(v) => a.set({ n3: v })} t="Ông bà" s="thường hay hỏi tối" />
      </div>
      <Foot><Btn wide onClick={a.next}>Xem trước</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Vào lịch cả hai người, không ai phải nhập lại.">Mai sẽ ghi thế này</H1>
      <div style={{ display: "grid", gap: 8 }}>
        {["Lịch của anh", "Lịch của Vy"].map((x) => (
          <div key={x} style={{ background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "11px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.4 }}>{x.toUpperCase()}</div>
            <div style={{ fontSize: 13.5, color: T.ink, marginTop: 3, fontWeight: 600, ...num }}>{a.d.at || "16:20"} · Đón Bin · cổng sau TH Lê Lợi</div>
            <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>người phụ trách: {a.d.who === "me" ? "anh" : a.d.who === "co" ? "cô Hạnh" : "Vy"} · nhắc trước 15 phút</div>
          </div>
        ))}
      </div>
      <Foot><Btn wide onClick={a.next}>Ghi vào lịch</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "4px 0" }}><Burst /><StrokeCheck size={34} /></div>
      <H1 sub="Mai theo dõi tới lúc Bin lên xe. Nếu 16:35 chưa ai tới, Mai gọi anh ngay.">Đã chốt người đón</H1>
      <KV rows={[["Người đón", a.d.who === "me" ? "anh" : a.d.who === "co" ? "cô Hạnh" : "Vy"], ["Giờ", a.d.at || "16:20"], ["Đã báo", [a.d.n1 !== false && "Vy", a.d.n2 !== false && "cô Hạnh", a.d.n3 && "ông bà"].filter(Boolean).join(", ") || "chưa báo ai"], ["Đã vào lịch", "2 người", "green"]]} />
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Về Nhà mình</Btn></Foot>
    </>
  ),
];

// 3 · ĐƠN DÃ NGOẠI (7 bước)
const flowForm = (finish) => [
  (a) => (
    <>
      <H1 sub="Email trường gửi 3 ngày trước, Mai giữ lại chờ anh.">Thư của trường</H1>
      <Evidence Icon={FileText} color="#7A5CB8" src="Email · THCS Trần Phú" time="03/08" text="Kính gửi phụ huynh em Nguyễn Thị Na, lớp 6A2. Nhà trường tổ chức dã ngoại Cần Giờ 08/08. Phụ huynh vui lòng ký đơn đồng ý và nộp phí 120.000đ trước 08/08." />
      <Express
        now={() => a.go(3)}
        nowLabel="Xem lại rồi ký đơn"
        more={a.next}
        moreLabel="Đọc kỹ từng phần" />
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai lấy từ hồ sơ nhà mình. Anh chạm để sửa nếu sai.">Đơn đã điền sẵn</H1>
      <KV rows={[["Học sinh", "Nguyễn Thị Na"], ["Lớp", "6A2"], ["Phụ huynh", "anh · bố"], ["SĐT", a.d.phone || "0903 8•• •19"], ["CCCD", "···· 4102"]]} />
      <div style={{ marginTop: 10 }}>
        <Btn kind="soft" wide onClick={() => a.set({ phone: "0908 122 447" })}>Sửa số điện thoại</Btn>
        {a.d.phone && <div style={{ fontSize: 11.5, color: T.green, marginTop: 7, fontWeight: 650 }}>Đã đổi sang số mới · Mai cập nhật hồ sơ luôn</div>}
      </div>
      <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Hai mục này trường bắt buộc phụ huynh tự quyết.">Phần anh phải quyết</H1>
      <div style={{ fontSize: 12, fontWeight: 650, color: T.sub, marginBottom: 8 }}>Cho Na đi dã ngoại?</div>
      <Choice value={a.d.ok || "yes"} onPick={(v) => a.set({ ok: v })} items={[{ id: "yes", emoji: "✅", t: "Đồng ý cho đi" }, { id: "no", emoji: "🚫", t: "Không cho đi lần này" }]} />
      <div style={{ fontSize: 12, fontWeight: 650, color: T.sub, margin: "14px 0 8px" }}>Na có dị ứng gì không?</div>
      <Choice value={a.d.al || "none"} onPick={(v) => a.set({ al: v })} items={[{ id: "none", emoji: "—", t: "Không có", s: "khớp sổ tiêm chủng trong hồ sơ" }, { id: "yes", emoji: "⚠️", t: "Có · hải sản", s: "Mai ghi vào đơn và nhắc cô" }]} />
      <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Trường nhận tiền mặt hoặc chuyển khoản. Mai khuyên chuyển để có biên lai.">Phí 120.000đ</H1>
      <Choice value={a.d.fee || "now"} onPick={(v) => a.set({ fee: v })}
        items={[
          { id: "now", Icon: Wallet, t: "Chuyển luôn cùng lúc ký", s: "WinMoney · có biên lai gửi cô Hồng", right: fmt(120000) },
          { id: "later", Icon: Store, t: "Na mang tiền mặt 08/08", s: "Mai nhắc anh tối 07/08 chuẩn bị" },
        ]} />
      <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
    </>
  ),
  (a) => <FaceStep label={a.d.fee === "later" ? "Ký đơn bằng định danh của anh" : "Ký đơn và chuyển 120.000đ"} sub="Chữ ký số gắn CCCD ···· 4102" onDone={a.next} onCancel={() => a.go(Math.max(0, a.i - 1))} />,
  (a) => (
    <>
      <H1 sub="Bản này đã gửi cô Hồng chủ nhiệm 6A2 lúc 15:47.">Đơn đã gửi</H1>
      <div style={{ background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 14, padding: 14, fontSize: 12.5, color: T.ink, lineHeight: 1.7 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>ĐƠN ĐỒNG Ý CHO HỌC SINH ĐI DÃ NGOẠI</div>
        Học sinh: <b>Nguyễn Thị Na</b> · lớp 6A2<br />
        Địa điểm: Cần Giờ · 08/08<br />
        Dị ứng: {a.d.al === "yes" ? "có · hải sản" : "không"}<br />
        Phí: {a.d.fee === "later" ? "nộp tiền mặt 08/08" : "đã chuyển 120.000đ"}<br />
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${T.hair}`, display: "flex", alignItems: "center", gap: 7 }}>
          <BadgeCheck size={15} color={T.green} />
          <span style={{ fontSize: 11.5, color: T.green, fontWeight: 650 }}>Ký số bằng CCCD ···· 4102 · 15:47 06/08</span>
        </div>
      </div>
      <Foot><Btn kind="soft" onClick={a.next} style={{ flex: 1 }}>Tải PDF</Btn><Btn onClick={a.next} style={{ flex: 1 }}>Xong</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "4px 0" }}><Burst /><StrokeCheck size={34} /></div>
      <H1 sub="Mai đã lưu bản ký vào hồ sơ Na và đặt hai nhắc để anh không phải nhớ.">Gửi xong rồi</H1>
      <KV rows={[["Nhắc 1", "Thứ Năm 20:00 · soạn balo cho Na"], ["Nhắc 2", "Thứ Sáu 6:00 · tập trung 6:30 cổng trường"], ["Lưu tại", "Hồ sơ nhà mình · Na", "green"]]} />
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Về Nhà mình</Btn></Foot>
    </>
  ),
];

// 4 · GIỎ WINMART+ (7 bước)
const CART0 = [
  { n: "Bò nạm 500g", p: 139000, q: 1, brand: "quầy tươi" },
  { n: "Cà rốt 500g", p: 15000, q: 1 },
  { n: "Sả · gừng", p: 8000, q: 1 },
  { n: "Gia vị bò kho Chin-su", p: 12000, q: 1, brand: "Chin-su" },
  { n: "Bánh mì · 2 ổ", p: 12000, q: 1 },
];
const EXTRA = [
  { n: "Mì Omachi bò hầm ×5", p: 34000, brand: "Omachi" },
  { n: "Nước mắm Nam Ngư 500ml", p: 28000, brand: "Chin-su" },
  { n: "Chuối tiêu 1kg", p: 26000 },
];
const flowCart = (finish) => {
  const total = (items, extras) => items.reduce((s, i) => s + i.p * i.q, 0) + EXTRA.filter((e, k) => extras[k]).reduce((s, e) => s + e.p, 0);
  return [
    (a) => {
      const items = a.d.items || CART0;
      return (
        <>
          <H1 sub="Mai soạn theo bài bò kho trong kênh, chia cho nhà 4 người. Anh sửa số lượng thoải mái.">Giỏ Mai soạn</H1>
          {/* Không giấu giá rẻ hơn khi chênh đáng kể. Chị Xuân bắt đúng chỗ này. */}
          {worthSwitch(TRAYS[5].was, TRAYS[5].now) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.brandSoft, border: "1px solid #EBCBB6", borderRadius: 14, padding: "11px 12px", marginBottom: 11 }}>
              <Store size={16} color={T.brandInk} strokeWidth={2.2} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: T.ink, lineHeight: 1.45, ...num }}>
                Chị My bên Win+ Hai Bà Trưng còn khay {TRAYS[5].n.toLowerCase()} {fmt(TRAYS[5].now)}, rẻ hơn {fmt(TRAYS[5].was - TRAYS[5].now)}. Kho cũng ngon, nhưng anh phải ghé lấy hoặc chờ Supra 2 tiếng.
              </span>
            </div>
          )}
          <Thumb from="#8A4630" to="#3A1B12" emoji="🍲" h={92} />
          <div style={{ marginTop: 10 }}>
            <Qty items={items} set={(i, q) => { const c = items.map((x, k) => (k === i ? { ...x, q } : x)); a.set({ items: c }); }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 2px", fontWeight: 700, fontSize: 15, color: T.ink }}>
            <span>Tạm tính</span><span style={{ fontFamily: DISPLAY, fontSize: 17, ...num }}>{fmt(total(items, a.d.ex || {}))}</span>
          </div>
          <Foot><Btn wide onClick={a.next}>Mai gợi ý thêm gì?</Btn></Foot>
        </>
      );
    },
    (a) => {
      const items = a.d.items || CART0, ex = a.d.ex || {};
      return (
        <>
          <H1 sub="Dựa trên đồ nhà mình hay mua và giỏ tuần trước. Bỏ qua được.">Thêm cho đủ tuần?</H1>
          <div style={{ display: "grid", gap: 8 }}>
            {EXTRA.map((e, k) => (
              <Toggle key={e.n} on={!!ex[k]} onTap={(v) => a.set({ ex: { ...ex, [k]: v } })} t={e.n} s={fmt(e.p) + (e.brand ? " · " + e.brand : "")} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 2px", fontWeight: 700, fontSize: 15 }}>
            <span>Tạm tính</span><span style={{ fontFamily: DISPLAY, fontSize: 17, ...num }}>{fmt(total(items, ex))}</span>
          </div>
          <Foot><Btn wide onClick={a.next}>Chọn giờ giao</Btn></Foot>
        </>
      );
    },
    (a) => (
      <>
        <H1 sub="Tập cuối Anh Trai Say Hi 20:00, Mai chọn sẵn giờ giao sớm cho anh kịp nấu.">Supra giao lúc nào</H1>
        <Slots value={a.d.slot || "18:00"} onPick={(v) => a.set({ slot: v })}
          list={[{ t: "17:30", note: "còn 2 tài xế" }, { t: "18:00", note: "trống" }, { t: "18:30", note: "trống" }, { t: "19:00", full: true }, { t: "19:30", note: "trống" }, { t: "20:00", note: "muộn" }]} />
        <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
      </>
    ),
    (a) => {
      const tt = total(a.d.items || CART0, a.d.ex || {});
      return (
        <>
          <H1 sub="Điểm WinX chỉ cộng khi mua hàng của Masan.">Giao tới đâu, trả bằng gì</H1>
          <KV rows={[["Địa chỉ", "Zeit River · T1.02.06"], ["Siêu thị", "WinMart+ Thảo Điền · 1,4km"], ["Giao bởi", "Supra · " + (a.d.slot || "18:00")], ["Tổng", fmt(tt)], ["Điểm WinX", "+" + Math.round(tt / 1000), "green"]]} />
          <div style={{ marginTop: 12 }}>
            <Choice value={a.d.src || "wm"} onPick={(v) => a.set({ src: v })} items={[{ id: "wm", Icon: Wallet, t: "WinMoney", s: "số dư " + fmt(a.ctx && a.ctx.bal != null ? a.ctx.bal : 2480000) }, { id: "cod", Icon: Banknote, t: "Tiền mặt khi nhận", s: "không tích điểm WinX", warn: true }]} />
          </div>
          <Foot><Btn wide onClick={a.next}>{a.d.src === "cod" ? "Đặt đơn" : "Trả " + fmt(tt)}</Btn></Foot>
        </>
      );
    },
    (a) => a.d.src === "cod"
      ? (
        <>
          <H1 sub="Anh trả tiền mặt lúc nhận, Mai không đụng vào ví.">Đặt đơn, trả sau</H1>
          <KV rows={[["Trả khi nhận", fmt(total(a.d.items || CART0, a.d.ex || {}))], ["Người giao", "Supra · " + (a.d.slot || "18:00")], ["Điểm WinX", "không có · trả tiền mặt", "amber"]]} />
          <Foot><Btn wide onClick={a.next}>Chốt đơn</Btn></Foot>
        </>
      )
      : <FaceStep label={"Nhìn vào máy để trả " + fmt(total(a.d.items || CART0, a.d.ex || {}))} sub="WinMart+ · WinMoney" onDone={a.next} onCancel={() => a.go(Math.max(0, a.i - 1))} />,
    (a) => (
      <>
        <H1 sub="Mai theo dõi giúp anh, có gì lệch Mai báo ngay.">Đơn đang giao</H1>
        <Track steps={[{ t: "WinMart+ nhận đơn", s: "15:44" }, { t: "Đang soạn hàng", s: "nhân viên quầy tươi" }, { t: "Tài xế Supra đã nhận", s: "anh Tài · 51F1-882.03" }, { t: "Đang tới Zeit River", s: "còn 1,1km" }, { t: "Giao trước " + (a.d.slot || "18:00"), s: "Mai báo khi hàng tới cửa" }]} />
        <Foot><Btn wide onClick={a.next}>Xong</Btn></Foot>
      </>
    ),
    (a) => {
      const tt = total(a.d.items || CART0, a.d.ex || {});
      return (
        <>
          <div style={{ textAlign: "center", padding: "4px 0" }}><Burst /><StrokeCheck size={34} /></div>
          <H1 sub={"Supra giao trước " + (a.d.slot || "18:00") + ", Mai báo khi hàng tới cửa. Công thức bò kho đã nằm trong hồ sơ, lần sau nói đặt lại là xong."}>Đặt xong rồi</H1>
          <KV rows={[[a.d.src === "cod" ? "Trả khi nhận" : "Tổng trả", fmt(tt)], ["Điểm WinX", a.d.src === "cod" ? "không có · trả tiền mặt" : "+" + Math.round(tt / 1000), a.d.src === "cod" ? "amber" : "green"], ["Giao", "Supra · trước " + (a.d.slot || "18:00")]]} />
          <Foot><Btn wide onClick={() => { finish({ ...a.d, total: tt }); a.close(); }}>Về kênh</Btn></Foot>
        </>
      );
    },
  ];
};

// 5 · VÉ CONCERT (7 bước)
const flowTicket = (finish) => [
  (a) => (
    <>
      <H1 sub="Đợt 2 hết trong 7 phút. Đợt 3 mở 20:00 ngày 08/08.">Đợt bán thứ 3</H1>
      <KV rows={[["Mở bán", "20:00 · 08/08", "amber"], ["Khu B", fmt(890000) + "/vé"], ["Giới hạn", "4 vé mỗi CCCD"], ["Quy định", "vé gắn CCCD, không sang tay ngoài app"]]} />
      <Foot><Btn wide onClick={a.next}>Chọn vé</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai chỉ giữ ý định mua, chưa trừ tiền của anh.">Mấy vé, khu nào</H1>
      <div style={{ fontSize: 12, fontWeight: 650, color: T.sub, marginBottom: 8 }}>Khu ngồi</div>
      <Choice value={a.d.zone || "B"} onPick={(v) => a.set({ zone: v })}
        items={[{ id: "A", t: "Khu A · sát sân khấu", s: "ít vé, hết nhanh", right: fmt(1490000) }, { id: "B", t: "Khu B · giữa", s: "đợt 3 còn nhiều", right: fmt(890000) }, { id: "C", t: "Khu C · trên cao", s: "gia đình hay chọn", right: fmt(590000) }]} />
      <div style={{ fontSize: 12, fontWeight: 650, color: T.sub, margin: "14px 0 8px" }}>Số vé</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", padding: "6px 0" }}>
        <button onClick={() => a.set({ qty: Math.max(1, (a.d.qty || 2) - 1) })} className="btn" style={{ background: "#F1EBE1", color: T.ink, width: 40, height: 40, padding: 0, borderRadius: 999 }}><Minus size={15} /></button>
        <span style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, minWidth: 46, textAlign: "center", ...num }}>{a.d.qty || 2}</span>
        <button onClick={() => a.set({ qty: Math.min(4, (a.d.qty || 2) + 1) })} className="btn" style={{ background: T.brandSoft, color: T.brand, width: 40, height: 40, padding: 0, borderRadius: 999 }}><Plus size={15} /></button>
      </div>
      <Foot><Btn wide onClick={a.next}>Gắn vé cho ai</Btn></Foot>
    </>
  ),
  (a) => {
    const q = a.d.qty || 2, who = a.d.who || { me: true, na: true };
    const cnt = Object.values(who).filter(Boolean).length;
    return (
      <>
        <H1 sub={"Vé gắn CCCD từng người, vào cổng quét mặt. Cần chọn đúng " + q + " người."}>Vé của ai</H1>
        <div style={{ display: "grid", gap: 8 }}>
          {[["me", "Anh", "CCCD ···· 4102"], ["vy", "Vy", "CCCD ···· 7781"], ["na", "Na · 12 tuổi", "định danh theo hộ chiếu"], ["bin", "Bin · 9 tuổi", "chưa đủ tuổi vào khu B", true]].map(([id, t, s, off]) => (
            <Toggle key={id} on={!!who[id]} onTap={(v) => !off && a.set({ who: { ...who, [id]: v } })} t={t + (off ? " · không được" : "")} s={s} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: cnt === q ? T.green : T.amber, fontWeight: 650, marginTop: 10, ...num }}>Đã chọn {cnt}/{q} người</div>
        <Foot><Btn wide onClick={a.next} style={{ opacity: cnt === q ? 1 : 0.5 }}>{cnt === q ? "Tiếp tục" : "Chọn đủ người đã"}</Btn></Foot>
      </>
    );
  },
  (a) => (
    <>
      <H1 sub="20:00 ngày 08/08 anh đang ăn cơm với nhà, để Mai canh giờ và bấm giúp anh.">Mai canh giúp anh</H1>
      <div style={{ display: "grid", gap: 8 }}>
        <Toggle on={a.d.t1 !== false} onTap={(v) => a.set({ t1: v })} t="Nhắc lúc 19:55" s="rung máy + báo trước 5 phút" />
        <Toggle on={a.d.t2 !== false} onTap={(v) => a.set({ t2: v })} t="Tự mở trang đặt vé đúng 20:00" s="Mai mở sẵn, anh chỉ bấm xác nhận" />
        <Toggle on={a.d.t3 !== false} onTap={(v) => a.set({ t3: v })} t="Điền sẵn CCCD từng người" s="khỏi gõ lại lúc tranh vé" />
        <Toggle on={!!a.d.t4} onTap={(v) => a.set({ t4: v })} t="Nhắc cả Vy" s="hai máy tranh vé cùng lúc" />
      </div>
      <Foot><Btn wide onClick={a.next}>Xác nhận kế hoạch</Btn></Foot>
    </>
  ),
  (a) => <FaceStep label="Xác nhận ý định mua vé" sub="Chưa trừ tiền · chỉ ghi CCCD để điền sẵn" onDone={a.next} onCancel={() => a.go(Math.max(0, a.i - 1))} />,
  (a) => {
    const q = a.d.qty || 2, zone = a.d.zone || "B";
    const price = { A: 1490000, B: 890000, C: 590000 }[zone];
    return (
      <>
        <H1 sub="Còn 2 ngày 4 giờ. Mai đếm ngược và tự mở trang lúc 20:00.">Mai đang canh</H1>
        <div style={{ background: T.brandSoft, border: "1px solid #F0DCCD", borderRadius: 16, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mark size={30} alive />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>Đang canh đợt 3</div>
              <div style={{ fontSize: 11.5, color: T.brandInk, ...num }}>20:00 ngày 08/08 · {q} vé khu {zone} · {fmt(price * q)}</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, fontWeight: 650, color: T.sub, marginBottom: 8 }}>Vé của anh sẽ trông như vậy</div>
        <div style={{ background: T.dark, borderRadius: 16, padding: 14, color: "#FFFDF9" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 54, height: 54, borderRadius: 10, background: "#FFFDF9", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, padding: 4, flexShrink: 0 }}>
              {Array.from({ length: 25 }).map((_, i) => <span key={i} style={{ background: (i * 7) % 3 ? T.dark : "transparent", borderRadius: 1 }} />)}
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 600 }}>Anh Trai Say Hi · Concert 5</div>
              <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 3, ...num }}>Khu {zone} · gắn CCCD ···· 4102</div>
              <div style={{ fontSize: 10.5, opacity: 0.6, marginTop: 3 }}>vào cổng quét mặt · không sang tay ngoài app</div>
            </div>
          </div>
        </div>
        <Foot><Btn wide onClick={a.next}>Xong</Btn></Foot>
      </>
    );
  },
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "4px 0" }}><div style={{ fontSize: 38 }}>🎤</div></div>
      <H1 sub="Mai đã lưu kế hoạch vào hồ sơ nhà mình. Nếu đợt 3 hết trước khi anh bấm, Mai tự xếp anh vào danh sách chờ đợt 4.">Đã đặt lịch tranh vé</H1>
      <KV rows={[["Nhắc", "19:55 ngày 08/08" + (a.d.t4 ? " · cả Vy" : "")], ["Tự mở trang", a.d.t2 === false ? "không" : "có · đúng 20:00"], ["CCCD điền sẵn", a.d.t3 === false ? "không" : "có"], ["Nếu hết vé", "vào danh sách chờ đợt 4", "green"]]} />
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Về kênh</Btn></Foot>
    </>
  ),
];

// 6 · SANG NHƯỢNG VÉ · ESCROW (6 bước)
const flowResale = (finish) => [
  (a) => (
    <>
      <H1 sub="Trong kênh ai bán cũng phải định danh. Đây là hồ sơ chị Ngân.">Người bán là ai</H1>
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "4px 0 12px" }}>
        <span style={{ width: 52, height: 52, borderRadius: 18, background: "#B85C7A", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>N</span>
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink, display: "flex", alignItems: "center", gap: 5 }}>chị Ngân <BadgeCheck size={15} color={T.green} /></div>
          <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>định danh CCCD · tham gia 2 năm</div>
        </div>
      </div>
      <KV rows={[["Giao dịch trong kênh", "3 lần · không tranh chấp", "green"], ["Đánh giá", "5,0 · 3 lượt"], ["Cùng khu", "Thảo Điền · 2,1km"]]} />
      <Foot><Btn wide onClick={a.next}>Xem vé</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Vé đang gắn CCCD chị Ngân, sẽ sang tên CCCD anh khi giao dịch xong.">2 vé khu B</H1>
      <Thumb from="#4A3B6B" to="#1B1430" emoji="🎟️" h={90} />
      <div style={{ marginTop: 10 }}><KV rows={[["Số vé", "2 vé liền nhau · B12-13"], ["Giá gốc", fmt(890000) + "/vé"], ["Chị Ngân bán", "đúng giá gốc · không chênh", "green"], ["Tổng", fmt(1780000)], ["Sang tên", "qua app · phí 0đ"]]} /></div>
      <Foot><Btn wide onClick={a.next}>Hỏi chị Ngân</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Nhắn trong app để có lịch sử nếu sau này tranh chấp.">Nhắn nhanh</H1>
      <div style={{ maxHeight: 210, overflowY: "auto" }}>
        <Msg m={{ from: "o", name: "chị Ngân", text: "Vé còn nha anh, em bận đi công tác đột xuất nên bán lại đúng giá." }} />
        {a.d.q1 && <Msg m={{ from: "vy", text: "Hai vé liền nhau đúng không chị?" }} />}
        {a.d.q1 && <Msg m={{ from: "o", name: "chị Ngân", text: "Dạ B12 với B13, liền nhau. Anh cọc qua app là em sang tên liền." }} />}
      </div>
      {!a.d.q1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <Btn kind="soft" onClick={() => a.set({ q1: true })}>Hai vé liền nhau không chị?</Btn>
        </div>
      )}
      <Foot><Btn wide onClick={a.next}>Đặt cọc qua WinMoney</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Tiền nằm trong WinMoney, chị Ngân không lấy được cho tới khi vé về CCCD của anh.">Giữ tiền hộ hai bên</H1>
      <div style={{ background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 16, padding: 13, fontSize: 13, color: "#14603C", lineHeight: 1.6 }}>
        WinMoney giữ <b>1.780.000đ</b>. Vé sang tên xong, WinMoney mới chuyển tiền cho chị Ngân. Nếu 24 giờ không sang tên được, tiền tự về ví anh.
      </div>
      <div style={{ marginTop: 12 }}><KV rows={[["Số tiền giữ", fmt(1780000)], ["Phí giữ hộ", "0đ"], ["Hoàn tự động", "sau 24 giờ nếu lỗi", "green"]]} /></div>
      <Foot><Btn wide onClick={a.next}>Quét mặt để đặt cọc</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai theo tới lúc vé về tên anh.">Đang sang tên</H1>
      <Track speed={1200} steps={[{ t: "Đã cọc · WinMoney giữ tiền", s: fmt(1780000) }, { t: "Chị Ngân đồng ý nhường vé", s: "15:46" }, { t: "Đơn vị bán vé sang tên", s: "B12-13 → CCCD ···· 4102" }, { t: "Chuyển tiền cho chị Ngân", s: "15:48 · xong" }]} />
      <Foot><Btn wide onClick={a.next}>Xong</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "4px 0" }}><Burst /><StrokeCheck size={34} /></div>
      <H1 sub="Vé đã nằm trong hồ sơ nhà mình, vào cổng quét mặt anh và Vy.">Vé về tên anh rồi</H1>
      <KV rows={[["Vé", "B12 · anh · B13 · Vy"], ["Đã trả", fmt(1780000)], ["Mã giao dịch", "m_esc_4TQ71B"], ["Lưu tại", "Hồ sơ · vé & sự kiện", "green"]]} />
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Về kênh</Btn></Foot>
    </>
  ),
];

// 7 · ĐĂNG KIỂM (6 bước) · ngoài hệ Masan, Mai vẫn làm
const flowInspect = (finish) => [
  (a) => (
    <>
      <H1 sub="Mai đọc từ ảnh giấy đăng kiểm anh chụp tháng 9 năm ngoái.">Xe của anh</H1>
      <KV rows={[["Biển số", "51K-238.19"], ["Xe", "Mazda CX-5 · 2021"], ["Hạn đăng kiểm", "12/09/2026 · còn 37 ngày", "amber"], ["Quá hạn", "phạt 4–6 triệu · mất bảo hiểm", "amber"], ["Bảo hiểm TNDS", "còn hạn tới 03/2027", "green"]]} />
      <Express
        now={() => { a.set({ center: "07v", slot: "07:30" }); a.go(4); }}
        nowLabel="Đặt 07:30 ngày 12/08, 50-07V"
        more={a.next}
        moreLabel="Chọn trung tâm và giờ khác" />
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai lấy thời gian chờ trung bình từ bài của anh Tuấn trong kênh Vietnam Cars.">Đi đâu cho nhanh</H1>
      <Choice value={a.d.center || "07v"} onPick={(v) => a.set({ center: v })}
        items={[
          { id: "07v", Icon: MapPin, t: "TT 50-07V · Bình Thạnh", s: "4,2km · chờ ~20 phút sáng thứ Ba", right: "4,2km" },
          { id: "05s", Icon: MapPin, t: "TT 50-05S · Quận 7", s: "7,8km · chờ ~1 tiếng, đông", right: "7,8km", warn: true },
          { id: "03v", Icon: MapPin, t: "TT 50-03V · Thủ Đức", s: "11km · vắng nhưng xa", right: "11km" },
        ]} />
      <Foot><Btn wide onClick={a.next}>Chọn giờ</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mẹo trong kênh: sáng thứ Ba vắng nhất, tránh cuối tháng.">Sáng 12/08</H1>
      {/* Số xe xếp hàng theo khung giờ, lấy từ kênh Vietnam Cars.
          Cột sáng nhất là khung Mai đề xuất. */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, background: T.bg, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "12px 13px 10px", marginBottom: 11 }}>
        <Bars data={[4, 9, 11, 17, 21, 16]} highlight={0} w={128} h={38} />
        <div style={{ flex: 1, minWidth: 0, fontSize: 11.5, color: T.sub, lineHeight: 1.5 }}>
          Xe xếp hàng theo giờ, trung tâm 50-07V. <span style={{ color: T.brandInk, fontWeight: 650 }}>07:30 vắng nhất</span>, khoảng 20 phút là xong.
        </div>
      </div>
      <Slots value={a.d.slot || "07:30"} onPick={(v) => a.set({ slot: v })}
        list={[{ t: "07:30", note: "vắng nhất" }, { t: "08:00", note: "vừa" }, { t: "08:30", note: "vừa" }, { t: "09:00", note: "đông" }, { t: "09:30", full: true }, { t: "10:00", note: "đông" }]} />
      <div style={{ marginTop: 12, fontSize: 12.5, color: T.sub, lineHeight: 1.55 }}>
        Anh có họp 10:00 ngày 12/08. Chọn 07:30 thì kịp về, Mai đã đối chiếu lịch.
      </div>
      <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai kiểm trong hồ sơ nhà mình, thiếu gì Mai nói luôn.">Cần mang gì</H1>
      <div style={{ display: "grid", gap: 8 }}>
        {[["Đăng ký xe", "đã có ảnh trong hồ sơ", true], ["Bảo hiểm TNDS", "còn hạn tới 03/2027", true], ["CCCD của anh", "định danh sẵn trong app", true], ["Tiền phí khoảng 340.000đ", "Mai nhắc mang tiền mặt, trung tâm này chưa nhận chuyển khoản", false]].map(([t, s, ok]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 11, background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "11px 12px" }}>
            <IconSq Icon={ok ? Check : CircleAlert} tint={ok ? T.greenBg : T.amberBg} color={ok ? T.green : T.amber} size={28} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 650, color: T.ink }}>{t}</div>
              <div style={{ fontSize: 11.5, color: ok ? T.sub : T.amber, marginTop: 2 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
      <Foot><Btn wide onClick={a.next}>Đặt lịch</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Trung tâm đăng kiểm không thuộc Masan, nên không có điểm WinX. Mai vẫn làm vì đây là việc của anh.">Xác nhận</H1>
      <KV rows={[["Trung tâm", a.d.center === "05s" ? "50-05S · Quận 7" : a.d.center === "03v" ? "50-03V · Thủ Đức" : "50-07V · Bình Thạnh"], ["Giờ", (a.d.slot || "07:30") + " · 12/08"], ["Xe", "51K-238.19"], ["Phí", "khoảng 340.000đ, trả tại chỗ"], ["Điểm WinX", "không có · không thuộc Masan"]]} />
      <div style={{ marginTop: 12 }}>
        <Toggle on={a.d.rm !== false} onTap={(v) => a.set({ rm: v })} t="Nhắc hai lần" s="19:00 ngày 11/08 soạn giấy tờ · 06:45 ngày 12/08 trước khi đi" />
      </div>
      <Foot><Btn wide onClick={a.next}>Chốt lịch</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "4px 0" }}><Burst /><StrokeCheck size={34} /></div>
      <H1 sub="Mai đã vào lịch anh và cập nhật hồ sơ xe. Xong đăng kiểm, anh chụp giấy mới, Mai tự đọc và đặt hạn 2028.">Đặt xong</H1>
      <div style={{ background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "12px 13px" }}>
        <div style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.4 }}>LỊCH CỦA ANH</div>
        <div style={{ fontSize: 14, fontWeight: 650, color: T.ink, marginTop: 4, ...num }}>{a.d.slot || "07:30"} 12/08 · Đăng kiểm 51K-238.19</div>
        <div style={{ fontSize: 11.5, color: T.sub, marginTop: 3 }}>{a.d.center === "05s" ? "50-05S Quận 7" : a.d.center === "03v" ? "50-03V Thủ Đức" : "50-07V Bình Thạnh"} · nhắc trước 1 ngày</div>
      </div>
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Về kênh</Btn></Foot>
    </>
  ),
];

// 8 · CUỘC GỌI GIẢ (6 bước)
const flowCall = (finish, onShare) => [
  (a) => (
    <AutoNext ms={1900} onDone={a.next}>
      <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 750, letterSpacing: 0.8, color: T.faint, marginBottom: 14 }}>VÍ DỤ · TÍNH NĂNG CHẶN GIẢ MẠO</div>
        <div style={{ width: 92, height: 92, borderRadius: 28, margin: "0 auto", background: "#F1EBE1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, position: "relative", overflow: "hidden" }}>
          👧<div className="scan" />
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: T.ink, marginTop: 12 }}>Na · gọi video</div>
        <div style={{ fontSize: 13, color: T.sub, marginTop: 6 }}>Mai đang đối chiếu khuôn mặt và giọng…</div>
      </div>
    </AutoNext>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ width: 92, height: 92, borderRadius: 28, margin: "0 auto", background: "#F1EBE1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, border: `3px solid ${T.red}`, filter: "grayscale(1)" }}>👧</div>
        <div style={{ marginTop: 12 }}><Pill tone="red"><ShieldAlert size={11} /> Không phải Na thật</Pill></div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {[["Số gọi", "+84 39x xxx x21 · số lạ, không có trong nhà mình"], ["Khuôn mặt", "không khớp định danh của Na"], ["Vị trí Na", "đang ở lớp bơi theo lịch · 16:30 mới tan"]].map(([k, v]) => (
          <div key={k} style={{ background: T.redBg, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 750, color: T.red, letterSpacing: 0.3 }}>{k.toUpperCase()}</div>
            <div style={{ fontSize: 13, color: T.ink, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <Foot><Btn wide onClick={a.next}>Anh quyết</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai không tự cúp máy. Nếu thật là Na gọi từ máy bạn thì anh vẫn nghe được.">Nghe hay từ chối</H1>
      <Choice value={a.d.act || "listen"} onPick={(v) => a.set({ act: v })}
        items={[{ id: "reject", Icon: PhoneOff, t: "Từ chối cuộc gọi", s: "Mai chặn số này cho cả nhà" }, { id: "listen", Icon: Phone, t: "Nghe nhưng cẩn thận", s: "Mai ghi âm và cảnh báo trong lúc nghe" }]} />
      <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      {a.d.act === "reject" ? (
        <>
          <H1 sub="Cuộc gọi bị chặn trước khi đổ chuông lần hai.">Đã từ chối</H1>
          <div style={{ background: T.bg, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "12px 13px", fontSize: 13, color: T.ink, lineHeight: 1.6 }}>
            Mai giữ lại 6 giây đầu để anh nghe thử nếu muốn xác minh sau.
          </div>
        </>
      ) : (
        <>
          <H1 sub="Mai bật cảnh báo trên màn hình trong suốt cuộc gọi.">Đang nghe · 0:24</H1>
          <div style={{ background: T.redBg, border: `1px solid #F3C9C4`, borderRadius: 14, padding: "12px 13px" }}>
            <div style={{ fontSize: 11, fontWeight: 750, color: T.red, letterSpacing: 0.3 }}>MAI ĐANG CẢNH BÁO</div>
            <div style={{ fontSize: 13.5, color: T.ink, marginTop: 5, lineHeight: 1.6 }}>Đừng đọc mã OTP ngân hàng gửi về điện thoại · đừng chuyển tiền · hỏi một chuyện chỉ Na biết</div>
          </div>
          <div style={{ marginTop: 10 }}><Evidence Icon={Mic} color={T.red} src="Bản ghi · chỉ anh nghe được" time="0:24" text="“Ba ơi con làm mất điện thoại, ba chuyển giùm con 8.500.000đ vào số này…”" /></div>
        </>
      )}
      <Foot><Btn wide onClick={a.next}>{a.d.act === "reject" ? "Xem Mai phân tích" : "Cúp máy"}</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai so giọng với 41 đoạn giọng Na trong hồ sơ nhà mình.">Mai phân tích</H1>
      <KV rows={[["Giọng", "ghép máy · lệch ở âm đuôi", "amber"], ["Kịch bản", "mất điện thoại → xin chuyển tiền"], ["Số tiền yêu cầu", fmt(8500000), "amber"], ["Số nhận tiền", "đã xuất hiện 12 vụ tương tự", "amber"], ["Kết luận", "gần như chắc chắn giả mạo", "amber"]]} />
      <Foot><Btn wide onClick={a.next}><Flag size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Báo cáo số này</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "2px 0 6px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 58, height: 58, borderRadius: 20, background: T.greenBg, border: "1px solid #CFE7DA" }}>
          <ShieldCheck size={30} color={T.green} strokeWidth={2} />
        </span>
      </div>
      <H1 sub="Một người trong nhà bị thử là cả nhà được bảo vệ.">Đã chặn cho cả nhà</H1>
      <KV rows={[["Chặn cho", "anh · Vy · Na · Bin"], ["Gửi cảnh báo", "kênh Nhà mình + 214k thành viên kênh"], ["Báo cơ quan", "đã gửi kèm bản ghi", "green"], ["Nhắc Na", "Mai dạy Na câu mật khẩu gia đình", "green"]]} />
      <ShareNudge line="Số này đang gọi nhiều nhà. Gửi cảnh báo cho người quen thì máy họ cũng chặn sẵn, khỏi phải gặp." cta="Cảnh báo người quen" onDone={onShare} />
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Xong</Btn></Foot>
    </>
  ),
];

// ————— bài kênh: chi tiết + bình luận + hồ sơ người đăng —————
const PostSheet = ({ post, onClose, onAuthor, onAct }) => {
  const [rep, setRep] = useState("");
  const [sent, setSent] = useState([]);
  const [up, setUp] = useState(false);
  return (
    <Sheet onClose={onClose} tall>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button onClick={onClose} className="btn" style={{ background: "#F1EBE1", padding: 7, borderRadius: 999, display: "flex" }}><X size={15} color={T.sub} /></button>
        <span style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.6 }}>{post.ch.toUpperCase()}</span>
      </div>
      {post.hero && <Thumb {...post.hero} h={140} />}
      <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: T.ink, letterSpacing: -0.3, lineHeight: 1.3, marginTop: post.hero ? 12 : 0 }}>{post.title}</div>
      {post.body && <div style={{ fontSize: 14, color: T.sub, marginTop: 7, lineHeight: 1.6 }}>{post.body}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, paddingBottom: 12, borderBottom: `1px solid ${T.hair}` }}>
        <button onClick={() => { setUp(!up); ding(); }} className="btn" style={{ background: up ? T.brandSoft : "#F1EBE1", color: up ? T.brand : T.sub, display: "flex", alignItems: "center", gap: 5 }}>
          <ArrowBigUp size={16} fill={up ? T.brand : "none"} className={up ? "pop" : ""} /> {post.up + (up ? 1 : 0)}
        </button>
        <button onClick={onAuthor} className="btn press" style={{ background: "none", color: T.brandInk, textDecoration: "underline", padding: 0, fontSize: 12.5 }}>{post.who}</button>
        <span style={{ fontSize: 11.5, color: T.faint, ...num }}>· {post.when}</span>
      </div>
      {post.act && <div style={{ marginTop: 12 }}><MaiBanner text={post.act.text} cta={post.act.cta} onTap={onAct} /></div>}
      <div style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.6, margin: "14px 0 8px" }}>BÌNH LUẬN</div>
      {post.comments.map((c, i) => (
        <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.hair}` }}>
          <span style={{ width: 30, height: 30, borderRadius: 11, background: c.bg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{c.who[0].toUpperCase()}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 650, color: T.ink }}>{c.who}</span>
              {c.ver && <BadgeCheck size={12} color={T.green} />}
              <span style={{ fontSize: 11, color: T.faint, marginLeft: "auto", ...num }}>{c.when}</span>
            </div>
            <div style={{ fontSize: 13.5, color: T.ink, marginTop: 3, lineHeight: 1.5 }}>{c.text}</div>
          </div>
        </div>
      ))}
      {sent.map((s, i) => (
        <div key={"s" + i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.hair}` }}>
          <span style={{ width: 30, height: 30, borderRadius: 11, background: T.dark, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>A</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 650, color: T.ink, display: "flex", alignItems: "center", gap: 5 }}>anh <BadgeCheck size={12} color={T.green} /></div>
            <div style={{ fontSize: 13.5, color: T.ink, marginTop: 3 }}>{s}</div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        <input value={rep} onChange={(e) => setRep(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && rep.trim()) { setSent([...sent, rep.trim()]); setRep(""); ding(); } }}
          placeholder="Viết bình luận…" style={{ flex: 1, border: `1px solid ${T.hair}`, borderRadius: 999, padding: "11px 15px", fontSize: 14, fontFamily: FONT, outline: "none", background: T.bg, color: T.ink, minWidth: 0 }} />
        <button onClick={() => { if (rep.trim()) { setSent([...sent, rep.trim()]); setRep(""); ding(); } }} className="btn" style={{ background: rep.trim() ? T.brand : "#E4DCCE", color: "#FFFDF9", borderRadius: 999, width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ArrowUp size={16} strokeWidth={2.6} />
        </button>
      </div>
      <div style={{ fontSize: 11, color: T.faint, marginTop: 9 }}>Bình luận gắn định danh của anh · kênh không có tài khoản ảo</div>
    </Sheet>
  );
};

const ProfileSheet = ({ p, onClose }) => (
  <Sheet onClose={onClose}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <button onClick={onClose} className="btn" style={{ background: "#F1EBE1", padding: 7, borderRadius: 999, display: "flex" }}><X size={15} color={T.sub} /></button>
      <span style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.6 }}>HỒ SƠ NGƯỜI ĐĂNG</span>
    </div>
    <div style={{ display: "flex", gap: 12, alignItems: "center", paddingBottom: 12 }}>
      <span style={{ width: 52, height: 52, borderRadius: 18, background: p.bg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>{p.who[0].toUpperCase()}</span>
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink, display: "flex", alignItems: "center", gap: 5 }}>{p.who} <BadgeCheck size={15} color={T.green} /></div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{p.sub}</div>
      </div>
    </div>
    <KV rows={p.rows} />
    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 12, lineHeight: 1.5 }}>Mọi người trong kênh đều định danh CCCD. Không có tài khoản ảo, không gian lận bình chọn, không bán hàng giấu tên.</div>
    <Foot><Btn kind="soft" wide onClick={onClose}>Đóng</Btn></Foot>
  </Sheet>
);

// ————— hồ sơ nhà mình + chi tiết từng giấy tờ —————
const FILES = [
  { id: "dk", Icon: Car, t: "Đăng kiểm ô tô", v: "hạn 12/09", tone: "amber", warn: "Quá hạn: phạt tới 6.000.000đ",
    detail: { h: "Đăng kiểm 51K-238.19", s: "Mai đọc từ ảnh giấy anh chụp 09/2025.", rows: [["Xe", "Mazda CX-5 · 2021"], ["Hạn", "12/09/2026 · còn 37 ngày", "amber"], ["Lần trước", "12/09/2025 · TT 50-07V"], ["Chu kỳ", "12 tháng"], ["Nguồn", "ảnh giấy đăng kiểm"]], cta: "Đặt lịch đăng kiểm", flow: "inspect" } },
  { id: "hc", Icon: BadgeCheck, t: "Hộ chiếu Na", v: "hết hạn 03/2027",
    detail: { h: "Hộ chiếu · Nguyễn Thị Na", s: "Còn 7 tháng. Trường hay xin bản sao đầu năm học.", rows: [["Số", "C·····719"], ["Hết hạn", "03/2027"], ["Cấp tại", "PA08 TP.HCM"], ["Bản sao", "2 bản trong hồ sơ"], ["Nguồn", "ảnh anh chụp 01/2026"]], cta: "Nhắc gia hạn trước 6 tháng", done: "Mai sẽ nhắc 09/2026" } },
  { id: "tc", Icon: Syringe, t: "Tiêm chủng Bin & Na", v: "đủ mũi ✓", tone: "green",
    detail: { h: "Sổ tiêm chủng", s: "Mai gom từ sổ giấy anh chụp và tin nhắn trạm y tế.", rows: [["Bin", "đủ mũi theo tuổi 9"], ["Na", "đủ mũi theo tuổi 12"], ["HPV Na", "khuyến nghị 12–14 tuổi", "amber"], ["Mũi gần nhất", "cúm · 11/2025"], ["Nguồn", "sổ giấy + SMS trạm y tế"]], cta: "Hỏi Mai về mũi HPV", ask: "Na 12 tuổi rồi, mũi HPV nên tiêm khi nào và ở đâu?" } },
  { id: "hp", Icon: GraduationCap, t: "Học phí quý 3", v: "đã trả ✓", tone: "green",
    detail: { h: "Học phí quý 3 · hai bé", s: "Đã trả đủ, biên lai lưu trong hồ sơ.", rows: [["Bin · TH Lê Lợi", fmt(4200000) + " ✓", "green"], ["Na · THCS Trần Phú", fmt(5100000) + " ✓", "green"], ["Ngày trả", "02/07 · WinMoney"], ["Quý 4", "Mai nhắc 25/09"], ["Biên lai", "2 bản trong hồ sơ"]], cta: "Xem biên lai" } },
  { id: "ve", Icon: Ticket, t: "Vé & sự kiện", v: "1 kế hoạch",
    detail: { h: "Vé & sự kiện", s: "Vé gắn CCCD, vào cổng quét mặt.", rows: [["Concert 5", "đang canh đợt 3 · 20:00 ngày 08/08", "amber"], ["Họp phụ huynh Na", "19:00 · 15/08"], ["Giỗ Ông", "09/08"], ["Dã ngoại Na", "08/08"]], cta: "Xem kênh Anh Trai Say Hi", goto: "atsh" } },
  { id: "dien", Icon: Zap, t: "Điện tháng 7", v: fmt(1240000) + " ✓", tone: "green",
    detail: { h: "Điện · tháng 7", s: "Mai đọc từ email EVN và trả tự động khi anh cho phép.", rows: [["Số tiền", fmt(1240000) + " ✓", "green"], ["Kỳ", "01/07–31/07"], ["So tháng 6", "+8% · trời nóng"], ["Tự động trả", "đang bật"], ["Kỳ tới", "Mai trả ngày 12/08"]], cta: "Tắt tự động trả" } },
];

const FileSheet = ({ f, onClose, onFlow, onGoto, onAsk }) => {
  const [done, setDone] = useState(false);
  const d = f.detail;
  return (
    <Sheet onClose={onClose} tall>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <button onClick={onClose} className="btn" style={{ background: "#F1EBE1", padding: 7, borderRadius: 999, display: "flex" }}><ChevronLeft size={15} color={T.sub} /></button>
        <span style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.6 }}>HỒ SƠ NHÀ MÌNH</span>
      </div>
      <div style={{ display: "flex", gap: 11, alignItems: "center", marginBottom: 12 }}>
        <IconSq Icon={f.Icon} tint={f.tone === "amber" ? T.amberBg : f.tone === "green" ? T.greenBg : "#F1EBE1"} color={f.tone === "amber" ? T.amber : f.tone === "green" ? T.green : T.sub} size={42} />
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, color: T.ink, letterSpacing: -0.2 }}>{d.h}</div>
          <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>{d.s}</div>
        </div>
      </div>
      <KV rows={d.rows} />
      {f.detail.cta && (
        <Foot>
          {done ? (
            <div style={{ flex: 1, background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#14603C", fontWeight: 650 }}>{d.done || "Xong rồi anh"}</div>
          ) : (
            <Btn wide onClick={() => {
              ding();
              if (d.flow) { onFlow(d.flow); return; }
              if (d.goto) { onGoto(d.goto); return; }
              if (d.ask) { onAsk(d.ask); return; }
              setDone(true);
            }}>{d.cta}</Btn>
          )}
        </Foot>
      )}
    </Sheet>
  );
};

// ————— dữ liệu bài kênh —————
const POSTS = {
  cars: [
    { id: "c1", ch: "Vietnam Cars", up: 214, title: "Đăng kiểm Q2: sáng thứ Ba vắng nhất, 20 phút là xong", body: "Trung tâm 50-07V, tới trước 7:30. Tránh cuối tháng, cuối tháng xe tải dồn về đông lắm.", hero: { from: "#3A4A6B", to: "#141C30", emoji: "🚗" }, who: "anh Tuấn", when: "2 giờ trước", bg: "#3A4A6B",
      act: { text: "Xe anh hạn 12/09 · trống sáng 12/08, 7:30", cta: "Đặt lịch", flow: "inspect" },
      comments: [{ who: "chú Bình", when: "1 giờ", text: "Xác nhận, tuần trước em đi 7:20 xong lúc 7:45.", ver: true, bg: "#4A5568" }, { who: "anh Khoa", when: "48 phút", text: "50-05S đông kinh khủng, chờ hơn tiếng.", ver: true, bg: "#7A5CB8" }, { who: "chị Hà", when: "20 phút", text: "Nhớ mang bảo hiểm TNDS còn hạn nha mọi người.", ver: true, bg: "#B85C7A" }],
      profile: { who: "anh Tuấn", bg: "#3A4A6B", sub: "định danh CCCD · tham gia 3 năm", rows: [["Bài đăng", "128 bài"], ["Được ủng hộ", "14,2k"], ["Chuyên", "đăng kiểm, bảo dưỡng"], ["Xe", "Mazda 3 · 2019"], ["Giao dịch mua bán", "9 lần · không tranh chấp", "green"]] } },
    { id: "c2", ch: "Vietnam Cars", up: 89, title: "Pass cảm biến áp suất lốp, còn bảo hành 8 tháng · 450.000đ", body: "Mua dư một bộ, chưa bóc seal. Ưu tiên anh em Thảo Điền qua lấy.", thumb: { from: "#4A5568", to: "#1F2733", emoji: "🛞" }, who: "chú Bình", when: "5 giờ trước", bg: "#4A5568",
      act: { text: "Người bán định danh ✓ · WinMoney giữ tiền tới khi anh nhận hàng", cta: "Mua", flow: "resale" },
      comments: [{ who: "anh Dũng", when: "3 giờ", text: "Còn không chú? Cháu ở Bình Thạnh.", ver: true, bg: "#2C9E8F" }, { who: "chú Bình", when: "2 giờ", text: "Còn nha, qua app đặt cọc là chú giữ cho.", ver: true, bg: "#4A5568" }],
      profile: { who: "chú Bình", bg: "#4A5568", sub: "định danh CCCD · tham gia 2 năm", rows: [["Bài đăng", "41 bài"], ["Mua bán", "17 lần · 5,0 sao", "green"], ["Khu vực", "Thảo Điền"], ["Trả hàng", "0 lần"]] } },
    { id: "c3", ch: "Vietnam Cars", up: 41, title: "Xăng E10 có hại xe đời 2015 không các bác?", who: "anh Khoa", when: "5 giờ trước", bg: "#7A5CB8",
      comments: [{ who: "anh Tuấn", when: "4 giờ", text: "Xe từ 2010 trở lên dùng E10 bình thường, hãng xác nhận rồi.", ver: true, bg: "#3A4A6B" }, { who: "chú Sáu", when: "2 giờ", text: "Em chạy 2 năm E10 chưa thấy gì.", ver: true, bg: "#2C9E8F" }],
      profile: { who: "anh Khoa", bg: "#7A5CB8", sub: "định danh CCCD · tham gia 1 năm", rows: [["Bài đăng", "23 bài"], ["Được ủng hộ", "1,1k"], ["Xe", "Toyota Vios · 2015"]] } },
  ],
  com: [
    { id: "m1", ch: "Cơm tối 30 phút", up: 462, title: "Bò kho nồi áp suất 30 phút, 6 nguyên liệu", body: "Bí quyết: gia vị bò kho Chin-su pha sẵn + 15 phút áp suất. Con nít húp sạch nồi.", hero: { from: "#8A4630", to: "#3A1B12", emoji: "🍲" }, who: "mẹ Su", when: "hôm nay", bg: "#B4531F",
      act: { text: "Nhà 4 người · WinMart+ Thảo Điền · Supra giao 18:00", cta: "Đặt 186k", flow: "cart" },
      comments: [{ who: "chị Trang", when: "2 giờ", text: "Làm tối qua, chồng em ăn ba bát cơm.", ver: true, bg: "#B85C7A" }, { who: "anh Phú", when: "1 giờ", text: "Cho thêm chút sả nữa là thơm hết bếp.", ver: true, bg: "#2C9E8F" }, { who: "mẹ Su", when: "40 phút", text: "Đúng rồi ạ, sả đập dập chứ đừng cắt nhỏ.", ver: true, bg: "#B4531F" }],
      profile: { who: "mẹ Su", bg: "#B4531F", sub: "định danh CCCD · tham gia 2 năm", rows: [["Bài đăng", "212 công thức"], ["Được ủng hộ", "38,4k"], ["Chuyên", "cơm tối nhanh cho nhà có con nhỏ"], ["Được đặt lại", "1.204 lần qua WinMart+", "green"]] } },
    { id: "m2", ch: "Cơm tối 30 phút", up: 175, title: "Canh chua cá lóc kiểu miền Tây, 25 phút", body: "Cá lóc đồng, me chín, bạc hà. Đừng cho dứa nhiều quá.", thumb: { from: "#3E8E63", to: "#1B4530", emoji: "🥘" }, who: "cô Sáu Cà Mau", when: "hôm qua", bg: "#3E8E63",
      comments: [{ who: "chị Ngân", when: "20 giờ", text: "Cô Sáu ơi cá lóc mua ở đâu tươi ạ?", ver: true, bg: "#B85C7A" }, { who: "cô Sáu Cà Mau", when: "18 giờ", text: "Ra WinMart+ mua cá đồng, sáng nào cũng có.", ver: true, bg: "#3E8E63" }],
      profile: { who: "cô Sáu Cà Mau", bg: "#3E8E63", sub: "định danh CCCD · Cà Mau", rows: [["Bài đăng", "96 công thức"], ["Được ủng hộ", "12,8k"], ["Chuyên", "món miền Tây"]] } },
  ],
  atsh: [
    { id: "a1", ch: "Anh Trai Say Hi", up: 2140, title: "Tập cuối tối nay 20:00 · nhà ai xem chung điểm danh", body: "Năm ngoái coi một mình, năm nay rủ được cả nhà. Ai ở HCM tính đi concert luôn không?", hero: { from: "#7B2FA8", to: "#1A0B2E", emoji: "🎤" }, who: "bé Ngọc", when: "1 giờ trước", bg: "#7B2FA8",
      act: { text: "Nhà 4 người xem chung 20:00 · combo snack WinMart+ · Supra giao trước 19:30", cta: "Đặt", flow: "cart" },
      comments: [{ who: "chị Trang", when: "50 phút", text: "Nhà em coi chung, tối nay đặt gà rán với bắp rang.", ver: true, bg: "#B85C7A" }, { who: "anh Khoa", when: "35 phút", text: "Điểm danh. Ai đi concert lập nhóm đi chung xe không?", ver: true, bg: "#7A5CB8" }, { who: "bé Ngọc", when: "12 phút", text: "Em lập rồi nha, ai muốn vào thì nhắn em.", ver: true, bg: "#7B2FA8" }],
      profile: { who: "bé Ngọc", bg: "#7B2FA8", sub: "định danh CCCD · 22 tuổi · TP.HCM", rows: [["Bài đăng", "84 bài"], ["Được ủng hộ", "31,2k"], ["Đã đi", "3 concert · vé chính chủ", "green"], ["Bình chọn", "1 phiếu mỗi tập · không cày"]] } },
    { id: "a2", ch: "Anh Trai Say Hi", up: 876, title: "Vé concert đợt 3 mở bán 20:00 ngày 08/08, khu B còn nhiều", body: "Đợt 2 hết trong 7 phút. Nhớ đăng nhập sẵn trước 5 phút, điền sẵn CCCD.", hero: { from: "#1E3A8A", to: "#0B1533", emoji: "🎫" }, who: "anh Khoa", when: "3 giờ trước", bg: "#1E3A8A",
      act: { text: "Mai canh giờ mở bán và điền sẵn CCCD cả nhà", cta: "Để Mai canh", flow: "ticket" },
      comments: [{ who: "chị Ngân", when: "2 giờ", text: "Đợt 2 em bấm chậm 20 giây là hết.", ver: true, bg: "#B85C7A" }, { who: "bé Ngọc", when: "1 giờ", text: "Vé gắn CCCD nên phe vé hết đường ôm rồi, mừng.", ver: true, bg: "#7B2FA8" }],
      profile: { who: "anh Khoa", bg: "#1E3A8A", sub: "định danh CCCD · quản trị viên kênh", rows: [["Bài đăng", "156 bài"], ["Được ủng hộ", "42,7k"], ["Vai trò", "quản trị · kiểm tin vé giả"], ["Đã chặn", "38 tin vé giả", "green"]] } },
    { id: "a3", ch: "Anh Trai Say Hi", up: 312, title: "Sang lại 2 vé khu B đúng giá gốc, bận việc đột xuất", body: "B12-13 liền nhau. Em bán đúng giá, không chênh một đồng.", thumb: { from: "#4A3B6B", to: "#1B1430", emoji: "🎟️" }, who: "chị Ngân", when: "40 phút trước", bg: "#B85C7A",
      act: { text: "Người bán định danh ✓ · WinMoney giữ tiền tới khi vé sang tên xong", cta: "Mua", flow: "resale" },
      comments: [{ who: "anh Khoa", when: "30 phút", text: "Quản trị xác nhận vé thật, gắn CCCD chị Ngân.", ver: true, bg: "#1E3A8A" }, { who: "bé Ngọc", when: "18 phút", text: "Anh nào lấy nhanh đi, giá gốc khó gặp lắm.", ver: true, bg: "#7B2FA8" }],
      profile: { who: "chị Ngân", bg: "#B85C7A", sub: "định danh CCCD · tham gia 2 năm", rows: [["Bài đăng", "37 bài"], ["Giao dịch", "3 lần · 5,0 sao", "green"], ["Khu vực", "Thảo Điền · 2,1km"], ["Tranh chấp", "0 lần"]] } },
    { id: "a4", ch: "Anh Trai Say Hi", up: 1204, title: "Bình chọn tập cuối: mỗi CCCD một phiếu", body: "Không cày phiếu ảo, không mua vote. Ai cũng thật thì kết quả mới thật.", who: "ban quản trị kênh", when: "hôm nay", bg: "#2C2822",
      comments: [{ who: "chị Trang", when: "4 giờ", text: "Cuối cùng cũng có chỗ bình chọn tử tế.", ver: true, bg: "#B85C7A" }, { who: "anh Khoa", when: "3 giờ", text: "Kênh khác một người cày được 300 phiếu, vô nghĩa.", ver: true, bg: "#1E3A8A" }],
      profile: { who: "ban quản trị kênh", bg: "#2C2822", sub: "kênh chính chủ · xác thực bởi nhà sản xuất", rows: [["Thành viên", "214.318 người"], ["Đều định danh", "100%", "green"], ["Bình chọn", "1 CCCD 1 phiếu"], ["Tin vé giả bị chặn", "38 tin", "green"]] } },
  ],
};


// ————————————————————————————————————————————————————————————
// MAI ĐI CÙNG ANH · bốn cửa vào, một hồ sơ
// Cửa 1 bàn phím m.ai (chạy trong Zalo/WhatsApp/mail, không cần ai cho phép)
// Cửa 2 share sheet hệ điều hành · Cửa 3 loa m.ai · Cửa 4 đồng hồ/tai nghe/xe
// ————————————————————————————————————————————————————————————

const FakeApp = ({ name, color, children }) => (
  <div style={{ border: `1px solid ${T.hair}`, borderRadius: 16, overflow: "hidden", background: "#F2F3F5" }}>
    <div style={{ background: color, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
      <ChevronLeft size={15} color="#fff" />
      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{name}</span>
      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.75)", marginLeft: "auto" }}>app khác · không phải m.ai</span>
    </div>
    <div style={{ padding: 11 }}>{children}</div>
  </div>
);
const OtherBubble = ({ who, text, time }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontSize: 10.5, color: "#6E7480", fontWeight: 650, marginBottom: 3 }}>{who}</div>
    <div style={{ background: "#fff", borderRadius: 12, borderTopLeftRadius: 4, padding: "9px 11px", fontSize: 13.5, color: "#1A1D22", lineHeight: 1.5, display: "inline-block", maxWidth: "94%" }}>{text}</div>
    <div style={{ fontSize: 10, color: "#9AA0AA", marginTop: 3, ...num }}>{time}</div>
  </div>
);
const MineBubble = ({ text, seen }) => (
  <div style={{ textAlign: "right", marginBottom: 8 }}>
    <div style={{ background: "#D6E4FF", borderRadius: 12, borderTopRightRadius: 4, padding: "9px 11px", fontSize: 13.5, color: "#1A1D22", lineHeight: 1.5, display: "inline-block", maxWidth: "94%", textAlign: "left" }}>{text}</div>
    {seen && <div style={{ fontSize: 10, color: "#9AA0AA", marginTop: 3 }}>{seen}</div>}
  </div>
);
const KbRow = ({ hint, onM, glow }) => (
  <div style={{ background: "#fff", borderTop: "1px solid #E2E4E8", padding: "8px 9px", display: "flex", alignItems: "center", gap: 7 }}>
    <button onClick={onM} className="btn" style={{ background: glow ? T.brand : "#F1EBE1", color: glow ? "#FFFDF9" : T.brand, width: 32, height: 32, padding: 0, borderRadius: 10, fontWeight: 800, fontSize: 13, boxShadow: glow ? `0 0 0 4px ${T.brandSoft}` : "none", flexShrink: 0 }}>m.</button>
    <div style={{ flex: 1, background: "#F2F3F5", borderRadius: 999, padding: "8px 12px", fontSize: 13, color: hint.startsWith("Nhập") ? "#9AA0AA" : "#1A1D22", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hint}</div>
    <span style={{ width: 30, height: 30, borderRadius: 999, background: "#0068FF", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ArrowUp size={14} color="#fff" strokeWidth={2.6} /></span>
  </div>
);

// CỬA 1 · BÀN PHÍM m.ai TRONG APP KHÁC (7 bước)
const flowKeyboard = (finish, app) => {
  const isW = app === "WhatsApp";
  const color = isW ? "#075E54" : "#0068FF";
  const who = isW ? "Mrs. Chen · lớp tiếng Anh" : "Cô Lan · GV lớp bơi";
  const ask = isW ? "Hi, did you settle Bin's swim fee? I need to close the list today." : "Anh ơi khoản bơi của Bin đã đóng chưa ạ? Cô chốt danh sách chiều nay.";
  const short = isW ? "Paid at 15:43 today, receipt attached." : "Dạ em đóng rồi lúc 15:43 ạ, em gửi biên lai cô xem.";
  const long = isW ? "Hi, I paid 850,000đ at 15:43 today via WinMoney. Transaction m_pay_8K2F91QD. Receipt attached." : "Dạ em đã chuyển 850.000đ lúc 15:43 hôm nay qua WinMoney, mã giao dịch m_pay_8K2F91QD. Em gửi kèm biên lai ạ.";
  return [
    (a) => (
      <>
        <H1 sub={"Đây là " + app + " của anh, không phải m.ai. Mai vào đây bằng bàn phím, không cần " + (isW ? "Meta" : "VNG") + " cho phép."}>Anh đang ở trong {app}</H1>
        <FakeApp name={who} color={color}>
          <OtherBubble who={who} text={ask} time="15:49" />
          <div style={{ margin: "0 -11px -11px" }}><KbRow hint="Nhập tin nhắn…" glow onM={a.next} /></div>
        </FakeApp>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 10, lineHeight: 1.5 }}>Chạm phím <b style={{ color: T.brand }}>m.</b> ở góc bàn phím.</div>
        <Foot><Btn wide onClick={a.next}>Chạm phím m.</Btn></Foot>
      </>
    ),
    (a) => (
      <>
        <H1 sub={"Mai chỉ đọc đoạn tin nhắn đang mở lúc anh chạm phím. Mai không đọc toàn bộ " + app + " của anh."}>Mai thấy gì liên quan</H1>
        <FakeApp name={who} color={color}>
          <OtherBubble who={who} text={ask} time="15:49" />
          <div style={{ background: T.brandSoft, border: `1px solid #F0DCCD`, borderRadius: 12, padding: 10, margin: "0 -2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <Mark size={22} /><span style={{ fontSize: 11, fontWeight: 750, color: T.brandInk }}>MAI · TỪ KÉT CỦA ANH</span>
            </div>
            {[["Biên lai học bơi", "15:43 hôm nay · 850.000đ"], ["Mã giao dịch", "m_pay_8K2F91QD"], ["Kỳ tháng 7", "đã trả 02/07"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}>
                <span style={{ color: T.sub }}>{k}</span><span style={{ color: T.ink, fontWeight: 650, ...num }}>{v}</span>
              </div>
            ))}
          </div>
        </FakeApp>
        <Foot><Btn wide onClick={a.next}>Mai soạn giúp câu trả lời</Btn></Foot>
      </>
    ),
    (a) => (
      <>
        <H1 sub="Anh chọn giọng nào, Mai chèn thẳng vào ô nhập của app.">Trả lời thế nào</H1>
        <Choice value={a.d.tone || "short"} onPick={(v) => a.set({ tone: v })}
          items={[{ id: "short", emoji: "⚡", t: "Ngắn gọn", s: short }, { id: "long", emoji: "🧾", t: "Đầy đủ có mã giao dịch", s: long }]} />
        <div style={{ marginTop: 10 }}><Toggle on={a.d.img !== false} onTap={(v) => a.set({ img: v })} t="Kèm ảnh biên lai" s="lấy từ hồ sơ, không cần đi tìm trong thư viện ảnh" /></div>
        <Foot><Btn wide onClick={a.next}>Xem trước trong {app}</Btn></Foot>
      </>
    ),
    (a) => (
      <>
        <H1 sub="Chữ nằm trong ô nhập của app, anh sửa được trước khi gửi. Mai không tự gửi thay anh.">Mai đã chèn vào ô nhập</H1>
        <FakeApp name={who} color={color}>
          <OtherBubble who={who} text={ask} time="15:49" />
          {a.d.img !== false && (
            <div style={{ display: "flex", gap: 7, alignItems: "center", background: "#fff", borderRadius: 10, padding: 7, marginBottom: 8, border: "1px solid #E2E4E8" }}>
              <span style={{ width: 34, height: 34, borderRadius: 8, background: T.greenBg, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><FileText size={15} color={T.green} /></span>
              <div style={{ fontSize: 11.5, color: "#1A1D22" }}>bien-lai-hoc-boi-Bin.pdf<div style={{ fontSize: 10, color: "#9AA0AA" }}>đính kèm từ hồ sơ</div></div>
            </div>
          )}
          <div style={{ margin: "0 -11px -11px" }}><KbRow hint={a.d.tone === "long" ? long : short} onM={() => {}} /></div>
        </FakeApp>
        <Foot><Btn wide onClick={a.next}>Gửi trong {app}</Btn></Foot>
      </>
    ),
    (a) => (
      <>
        <H1 sub="Cô nhận được ngay trong app cô đang dùng. Cô không cần cài m.ai.">Đã gửi</H1>
        <FakeApp name={who} color={color}>
          <OtherBubble who={who} text={ask} time="15:49" />
          <MineBubble text={a.d.tone === "long" ? long : short} seen="15:50 · đã xem" />
          <OtherBubble who={who} text={isW ? "Got it, thank you! Bin is on the list." : "Dạ cô nhận được rồi, cảm ơn anh nhiều ạ." } time="15:51" />
        </FakeApp>
        <Foot><Btn wide onClick={a.next}>Mai ghi lại gì?</Btn></Foot>
      </>
    ),
    (a) => (
      <>
        <H1 sub="Một cuộc trao đổi ở app khác vẫn về đúng một hồ sơ.">Mai ghi vào hồ sơ</H1>
        <KV rows={[["Việc", "đã trả lời " + who.split(" · ")[0] + " trong " + app], ["Gắn với", "Học bơi Bin · tháng 8"], ["Lưu tại", "Hồ sơ nhà mình · mục Bin", "green"], ["Mai đọc được", "chỉ đoạn tin nhắn anh đang mở"], ["Mai không đọc", app + " của anh · tin của người khác"]]} />
        <Foot><Btn wide onClick={a.next}>Vậy cửa này là gì</Btn></Foot>
      </>
    ),
    (a) => (
      <>
        <div style={{ textAlign: "center", padding: "4px 0" }}><Burst /><StrokeCheck size={34} /></div>
        <H1 sub="Bàn phím là cấp hệ điều hành. Nó chạy trong mọi app có ô nhập chữ, và không app nào chặn được.">Bàn phím m.ai</H1>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
          {["Zalo", "WhatsApp", "Messenger", "Gmail", "Telegram", "Notes", "trình duyệt"].map((x) => <Pill key={x} tone="brand">{x}</Pill>)}
        </div>
        <div style={{ background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 14, padding: "11px 13px", fontSize: 13, color: "#14603C", lineHeight: 1.6 }}>
          Anh không phải rời app đang dùng. Mai đi theo anh, còn hồ sơ vẫn nằm một chỗ.
        </div>
        <Foot><Btn wide onClick={() => { finish(); a.close(); }}>Xong</Btn></Foot>
      </>
    ),
  ];
};

// CỬA 2 · SHARE SHEET (6 bước)
const flowShare = (finish) => [
  (a) => (
    <>
      <H1 sub="Anh đang đọc mail trong Gmail. Không cần copy, không cần gõ lại.">Hoá đơn điện trong Gmail</H1>
      <FakeApp name="Gmail" color="#C5221F">
        <div style={{ background: "#fff", borderRadius: 12, padding: 11 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1D22" }}>EVN HCMC · Thông báo tiền điện kỳ 8/2026</div>
          <div style={{ fontSize: 11, color: "#9AA0AA", margin: "3px 0 7px", ...num }}>evnhcmc@evn.com.vn · 15:52</div>
          <div style={{ fontSize: 12.5, color: "#1A1D22", lineHeight: 1.6 }}>Kỳ 01/08–31/08. Số tiền: <b>1.310.000đ</b>. Hạn thanh toán: 12/08/2026. Mã KH: PE1600238190.</div>
        </div>
      </FakeApp>
      <Foot><Btn wide onClick={a.next}>Bấm Chia sẻ trong Gmail</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Cửa này là của điện thoại chứ không của riêng app nào. App nào cũng chia sẻ được, không cần app đó hợp tác với mình.">Chia sẻ tới…</H1>
      <div style={{ background: "#EDEEF1", borderRadius: 18, padding: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[["Zalo", "#0068FF", "Z"], ["Messages", "#34C759", "💬"], ["Drive", "#F4B400", "▲"], ["m.ai", T.brand, "m."]].map(([n, c, g]) => (
            <button key={n} onClick={n === "m.ai" ? a.next : undefined} className="btn press" style={{ background: "transparent", padding: 0, display: "block", textAlign: "center", opacity: n === "m.ai" ? 1 : 0.55 }}>
              <span style={{ width: 52, height: 52, borderRadius: 15, background: c, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, boxShadow: n === "m.ai" ? `0 0 0 4px ${T.brandSoft}` : "none" }}>{g}</span>
              <div style={{ fontSize: 10.5, color: T.ink, marginTop: 5, fontWeight: n === "m.ai" ? 700 : 500 }}>{n}</div>
            </button>
          ))}
        </div>
      </div>
      <Foot><Btn wide onClick={a.next}>Chọn m.ai</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai đọc ra từng ô, anh soát lại trước khi đồng ý.">Mai đọc được gì</H1>
      <KV rows={[["Loại", "Hoá đơn điện"], ["Kỳ", "01/08–31/08"], ["Số tiền", fmt(1310000)], ["Hạn", "12/08 · còn 6 ngày", "amber"], ["Mã khách hàng", "PE1600238190"], ["So kỳ trước", "+5,6% · " + fmt(1240000)]]} />
      <Foot><Btn wide onClick={a.next}>Đúng rồi</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai không tự trả nếu anh chưa cho phép loại hoá đơn này.">Làm gì với nó</H1>
      <Choice value={a.d.act || "auto"} onPick={(v) => a.set({ act: v })}
        items={[
          { id: "now", Icon: Wallet, t: "Trả luôn bây giờ", s: "WinMoney · biên lai vào hồ sơ", right: fmt(1310000) },
          { id: "auto", Icon: Bell, t: "Trả tự động ngày 10/08", s: "Mai trả trước hạn 2 ngày, báo anh sau" },
          { id: "file", Icon: FolderClosed, t: "Chỉ lưu hồ sơ", s: "anh tự trả, Mai chỉ nhắc" },
        ]} />
      <Foot><Btn wide onClick={a.next}>Tiếp tục</Btn></Foot>
    </>
  ),
  (a) => a.d.act === "file"
    ? (<>
        <H1 sub="Mai không trả, chỉ nhắc.">Đã lưu vào hồ sơ</H1>
        <KV rows={[["Nhắc", "09/08 · trước hạn 3 ngày"], ["Nguồn", "Gmail · anh chia sẻ 15:52"], ["Lưu tại", "Hồ sơ nhà mình · điện", "green"]]} />
        <Foot><Btn wide onClick={a.next}>Xong</Btn></Foot>
      </>)
    : <FaceStep label={a.d.act === "now" ? "Nhìn vào máy để trả 1.310.000đ" : "Cho phép Mai trả tự động kỳ điện"} sub="WinMoney · TCB ····4102 · hạn mức 2.000.000đ/lần" onDone={a.next} onCancel={() => a.go(Math.max(0, a.i - 1))} />,
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "4px 0" }}><Burst /><StrokeCheck size={34} /></div>
      <H1 sub="Thư, ảnh, tin nhắn, đường dẫn, PDF: cái gì chia sẻ được là Mai nhận được. Đây là cửa vào không ai chặn được.">Cửa chia sẻ của điện thoại</H1>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
        {["Gmail", "WhatsApp", "Zalo", "ảnh chụp giấy", "Safari", "PDF", "tin nhắn thoại"].map((x) => <Pill key={x} tone="brand">{x}</Pill>)}
      </div>
      <KV rows={[[a.d.act === "now" ? "Đã trả" : a.d.act === "file" ? "Đã lưu" : "Đã hẹn trả", a.d.act === "now" ? fmt(1310000) + " · 15:53" : a.d.act === "file" ? "nhắc 09/08" : "tự động 10/08", "green"], ["Nguồn", "Gmail · anh chia sẻ"], ["Lưu tại", "Hồ sơ nhà mình · điện"]]} />
      <Foot><Btn wide onClick={() => { finish(); a.close(); }}>Xong</Btn></Foot>
    </>
  ),
];

// CỬA 3 · LOA m.ai CHO BÀ (6 bước)
const flowSpeaker = (finish) => [
  (a) => (
    <>
      <H1 sub="Bà 78 tuổi, ở Cà Mau, không dùng điện thoại thông minh, không gõ chữ. Loa m.ai đặt ở bàn thờ nhà Bà.">Loa trong nhà Bà</H1>
      <div style={{ background: T.dark, borderRadius: 18, padding: 16, color: "#FFFDF9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ fontSize: 30 }}>🔊</span>
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 600 }}>Loa m.ai · nhà Bà</div>
            <div style={{ fontSize: 11.5, opacity: 0.7, ...num }}>Cà Mau · đang nghe · 15:44</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 26, marginTop: 14 }}>
          {Array.from({ length: 32 }).map((_, i) => <div key={i} style={{ flex: 1, height: 5 + ((i * 37) % 20), borderRadius: 2, background: "#E8825A", opacity: 0.35 + ((i * 13) % 7) / 10 }} />)}
        </div>
        <div style={{ fontSize: 13.5, fontStyle: "italic", color: "#FBE3B6", marginTop: 12, lineHeight: 1.6 }}>“Mai ơi, nhắc thằng Bin bữa nay uống thuốc ho nha con.”</div>
      </div>
      <Foot><Btn wide onClick={a.next}>Mai làm gì tiếp</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Giọng Bà đã định danh trong hồ sơ nhà mình, nên Mai biết ai đang nói mà không cần đăng nhập.">Mai nhận ra Bà</H1>
      <KV rows={[["Người nói", "Bà · giọng đã định danh", "green"], ["Nghe được", "tiếng Cà Mau · rõ 96%"], ["Nội dung", "nhắc Bin uống thuốc ho"], ["Bin là ai", "cháu · 9 tuổi · ở TP.HCM"], ["Bà không cần", "app · mật khẩu · gõ chữ"]]} />
      <Foot><Btn wide onClick={a.next}>Mai hỏi lại Bà</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai hỏi lại bằng giọng qua loa, Bà trả lời bằng miệng. Không có màn hình nào ở giữa.">Hỏi cho rõ giờ</H1>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ background: T.brandSoft, border: "1px solid #F0DCCD", borderRadius: 14, padding: "10px 12px", display: "flex", gap: 9, alignItems: "flex-start" }}>
          <Mark size={24} /><div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.5 }}>“Dạ Bà, con nhắc Bin uống thuốc lúc mấy giờ ạ?”</div>
        </div>
        <div style={{ background: T.bg, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "10px 12px", fontSize: 13.5, color: T.ink, fontStyle: "italic" }}>“Sau cơm chiều đó con.”</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 650, color: T.sub, margin: "14px 0 8px" }}>Mai hiểu “sau cơm chiều” là</div>
      <Slots value={a.d.at || "18:30"} onPick={(v) => a.set({ at: v })} list={[{ t: "18:00", note: "sớm" }, { t: "18:30", note: "nhà mình hay ăn" }, { t: "19:00", note: "muộn" }]} />
      <Foot><Btn wide onClick={a.next}>Chốt giờ này</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Việc từ loa của Bà hiện lên trong nhóm Nhà mình, ghi rõ nguồn là ai nói.">Vào Nhà mình như vậy</H1>
      <div style={{ background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 16, padding: 12 }}>
        <div style={{ display: "flex", gap: 9 }}>
          <Mark size={26} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.55 }}>Bà nhắc Bin uống thuốc ho sau cơm chiều. Mai đặt nhắc {a.d.at || "18:30"} cho anh và Vy.</div>
            <div style={{ marginTop: 7 }}><Pill tone="brand">Loa m.ai · Bà nói · 15:44</Pill></div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: T.sub, marginTop: 10, lineHeight: 1.55 }}>Bà không thấy tin nhắn của cả nhà. Bà chỉ nói và được nghe trả lời. Hồ sơ thì vẫn là một.</div>
      <Foot><Btn wide onClick={a.next}>Xem chạy thật</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai đi vòng tròn: từ miệng Bà tới tay Vy rồi quay lại tai Bà.">Vòng khép lại</H1>
      <Track speed={1150} steps={[
        { t: "Nhắc Vy lúc " + (a.d.at || "18:30"), s: "điện thoại Vy · rung" },
        { t: "Vy cho Bin uống thuốc", s: "18:34 · Vy chạm Xong" },
        { t: "Mai báo lại Bà qua loa", s: "“Dạ Bin uống thuốc rồi Bà ơi”" },
        { t: "Ghi vào hồ sơ", s: "sức khoẻ Bin · thuốc ho ngày 3" },
      ]} />
      <Foot><Btn wide onClick={a.next}>Xong</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "4px 0" }}><Burst /><StrokeCheck size={34} /></div>
      <H1 sub="Cửa nào phù hợp với người đó thì dùng cửa đó. Bà dùng giọng, anh dùng app, Vy dùng điện thoại, Bin sau này dùng đồng hồ.">Bà cũng dùng chung một Mai</H1>
      <div style={{ background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 14, padding: "11px 13px", fontSize: 13, color: "#14603C", lineHeight: 1.6 }}>
        Bà không cài app, không có điện thoại thông minh, không nhớ mật khẩu. Vẫn nói được với Mai và vẫn nằm trong hồ sơ nhà mình.
      </div>
      <Foot><Btn wide onClick={() => { finish(); a.close(); }}>Xong</Btn></Foot>
    </>
  ),
];

// CỬA 4 · ĐỒNG HỒ · TAI NGHE · XE (6 bước, một mạch liên tục)
const flowDevices = (finish) => [
  (a) => (
    <>
      <H1 sub="16:15 · anh vẫn đang họp, điện thoại trong túi. Mai không đổ chuông, chỉ rung nhẹ ở tay.">Đồng hồ</H1>
      <div style={{ background: T.dark, borderRadius: 24, padding: 16, color: "#FFFDF9", maxWidth: 220, margin: "0 auto" }}>
        <div style={{ fontSize: 10.5, opacity: 0.6, ...num }}>16:22</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8 }}>
          <Mark size={20} /><span style={{ fontSize: 11, fontWeight: 700 }}>Mai</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>Vy đã đón Bin ✓ cổng sau, 16:22.</div>
      </div>
      <Foot><Btn wide onClick={a.next}>Trả lời từ đồng hồ</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Ba nút, một cú xoay tay. Không rút điện thoại ra giữa cuộc họp.">Trả lời nhanh</H1>
      <Choice value={a.d.wr || "ok"} onPick={(v) => a.set({ wr: v })}
        items={[{ id: "ok", emoji: "👍", t: "Gửi 👍 vào Nhà mình" }, { id: "call", emoji: "📞", t: "Gọi Vy sau khi họp", s: "Mai nhắc lúc 17:02" }, { id: "later", emoji: "🕘", t: "Xem sau" }]} />
      <Foot><Btn wide onClick={a.next}>Tai nghe · trên đường về</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="17:10 · anh ra khỏi toà nhà, đeo tai nghe. Mai đọc chứ không hiện chữ.">Tai nghe</H1>
      <div style={{ background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 16, padding: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <span style={{ fontSize: 22 }}>🎧</span><span style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>Mai đọc · 38 giây</span>
        </div>
        <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.65 }}>“Hôm nay xong ba việc rồi anh. Bin đã được đón, học bơi đã trả trước hạn, đơn của Na đã gửi cô Hồng. Tối nay tập cuối 20:00, giỏ bò kho Supra giao 18:00. Còn một việc chưa chốt: đăng kiểm xe, còn 37 ngày.”</div>
      </div>
      <Foot><Btn wide onClick={a.next}>Lên xe</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="17:24 · Mai nhận tín hiệu xe qua CarPlay. Việc đúng ngữ cảnh mới nói, không thì im.">Trong xe</H1>
      <div style={{ background: "#1C2536", borderRadius: 18, padding: 15, color: "#FFFDF9" }}>
        <div style={{ fontSize: 10.5, opacity: 0.6, letterSpacing: 0.6, fontWeight: 700 }}>MÀN HÌNH XE</div>
        <div style={{ fontSize: 14.5, marginTop: 8, lineHeight: 1.55 }}>Xe 51K-238.19 · đăng kiểm còn 37 ngày. Sáng 12/08 trống lúc 7:30, cách nhà 4,2km.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <span className="btn" style={{ background: "#FFFDF9", color: "#1C2536" }}>Đặt lịch</span>
          <span className="btn" style={{ background: "rgba(255,255,255,.14)", color: "#FFFDF9" }}>Để sau</span>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: T.sub, marginTop: 10, lineHeight: 1.55 }}>Nói “Mai ơi đặt lịch” là xong, tay không rời vô lăng.</div>
      <Foot><Btn wide onClick={a.next}>Đặt bằng giọng</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Bốn thiết bị, bốn cách nói, cùng một việc và cùng một hồ sơ.">Một mạch trong ngày</H1>
      <Track speed={950} steps={[
        { t: "Đồng hồ · 16:22", s: a.d.wr === "call" ? "hẹn gọi Vy 17:02" : a.d.wr === "later" ? "xem sau" : "gửi 👍 vào Nhà mình" },
        { t: "Tai nghe · 17:10", s: "đọc tóm tắt 3 việc đã xong" },
        { t: "Xe · 17:24", s: "đặt đăng kiểm 7:30 ngày 12/08" },
        { t: "Hồ sơ nhà mình", s: "cả ba đều ghi về một chỗ" },
      ]} />
      <Foot><Btn wide onClick={a.next}>Xong</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "4px 0" }}><Burst /><StrokeCheck size={34} /></div>
      <H1 sub="Điện thoại, loa, đồng hồ, tai nghe, xe, và app của hãng khác nối vào. Mỗi thiết bị là một cánh cửa, hồ sơ vẫn là một và là của anh.">Cửa nào cũng vào được</H1>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
        {["điện thoại", "loa m.ai", "đồng hồ", "tai nghe", "xe", "TV", "camera", "gia dụng nối vào"].map((x) => <Pill key={x} tone="brand">{x}</Pill>)}
      </div>
      <div style={{ background: T.bg, border: `1px dashed ${T.hair}`, borderRadius: 14, padding: "11px 13px", fontSize: 12.5, color: T.sub, lineHeight: 1.6 }}>
        Mỗi nguồn một công tắc riêng. Anh tắt nguồn nào, Mai thôi đọc nguồn đó. Két mã hoá theo từng người.
      </div>
      <Foot><Btn wide onClick={() => { finish(); a.close(); }}>Xong</Btn></Foot>
    </>
  ),
];

// 13 · VÍ WINMONEY (7 bước)
// Ba người dùng thử đều sợ đúng một thứ: tiền tự đi mà không hỏi.
// Luồng này kết ở chỗ đặt trần cho Mai, nên cái ví trả lời được nỗi sợ đó.
const parseCap = (s) => (!s || s === "Không giới hạn" ? Infinity : parseInt(String(s).replace(/\D/g, ""), 10) || 0);
const flowWallet = (finish, spent, bal) => [
  (a) => (
    <>
      <H1 sub="Ví nối thẳng Techcombank của anh. Mai không giữ tiền, Mai chỉ giữ sổ.">Ví WinMoney</H1>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 16, padding: "14px 15px", marginBottom: 11 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.5 }}>SỐ DƯ</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, color: T.ink, letterSpacing: -0.5, marginTop: 2, ...num }}>{fmt(bal)}</div>
        </div>
        <Spark points={[2480, 2480, 2480 - (spent.slice(0, 1).reduce((s2, z) => s2 + z.v, 0) / 1000), bal / 1000, bal / 1000]} w={72} h={30} color={T.brand} fill />
      </div>
      <KV rows={[["Nguồn tiền", "Techcombank ····4102"], ["Rút về tài khoản", "miễn phí · trong ngày"], ["Trả ở cửa hàng Masan", "WinMart+ · Phúc Long · MEATDeli"], ["Chuyển người nhà", "0đ phí · cần định danh CCCD"]]} />
      <Foot><Btn wide onClick={a.next}>Mai đã trả hộ những gì</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mọi khoản Mai trả hộ đều nằm đây, không có dòng nào Mai giấu anh.">Tháng này</H1>
      <div style={{ display: "grid", gap: 8 }}>
        {spent.length === 0 && (
          <div style={{ background: T.bg, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "14px 13px", fontSize: 13, color: T.sub, lineHeight: 1.55 }}>
            Từ lúc anh mở app tới giờ chưa có khoản nào. Anh cứ thử trả một việc rồi quay lại đây xem Mai ghi sổ.
          </div>
        )}
        {spent.map((s) => (
          <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 11, background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "11px 12px" }}>
            <IconSq Icon={s.Icon} tint={T.brandSoft} color={T.brand} size={30} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 650, color: T.ink }}>{s.t}</div>
              <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>{s.s}</div>
            </div>
            <span style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 600, color: T.ink, ...num }}>−{fmt(s.v)}</span>
          </div>
        ))}
      </div>
      <Foot><Btn wide onClick={a.next}>Xem một biên lai</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Biên lai nào cũng mở ra được nguồn gốc: ai đòi, đòi bao giờ, Mai trả lúc nào.">Biên lai học bơi</H1>
      <Evidence src="Zalo · Vy chuyển tiếp · nhóm bơi TH Lê Lợi" time="07:42" Icon={MessageCircle}
        text="Cô Lan: Nhắc lần 2, phụ huynh đóng học phí bơi tháng 8 trước 17:00 hôm nay giúp cô. Đã đóng 14/32." />
      <div style={{ marginTop: 10 }}>
        <KV rows={[["Số tiền", fmt(850000)], ["Trả lúc", "15:43 · hôm nay"], ["Nguồn", "WinMoney ····4102"], ["Biên lai gửi", "riêng cô Lan · không đăng nhóm", "green"], ["Mã", "m_pay_8K2F91QD"]]} />
      </div>
      <Foot><Btn wide onClick={a.next}>Sắp tới phải trả gì</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai xếp theo hạn, khoản nào sát Mai nhắc trước ba ngày.">Sắp tới</H1>
      <div style={{ display: "grid", gap: 8 }}>
        {[...(spent.some((z) => z.v === 120000) ? [] : [["Phí dã ngoại Na", "hạn 08/08 · THCS Trần Phú", 120000, "amber"]]),
          ["Đăng kiểm 51K-238.19", "12/09 · trả tại trung tâm", 340000, "gray"],
          ["Điện tháng 8", "hạn 12/08 · hoá đơn EVN đã về", 1310000, "amber"]].map(([t, s, v, tone]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 11, background: T.surf, border: `1px solid ${tone === "amber" ? "#F0D8B0" : T.hair}`, borderRadius: 14, padding: "11px 12px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 650, color: T.ink }}>{t}</div>
              <div style={{ fontSize: 11.5, color: tone === "amber" ? T.amber : T.sub, marginTop: 2, fontWeight: tone === "amber" ? 650 : 400 }}>{s}</div>
            </div>
            <span style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 600, color: T.ink, ...num }}>{fmt(v)}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 11, fontSize: 14, color: T.sub, lineHeight: 1.55 }}>Cộng {fmt(1770000)}, mà gần nhất là điện 12/08 chứ không phải tháng sau. Số dư còn {fmt(bal)}, Mai nhắc trước từng khoản.</div>
      <Foot><Btn wide onClick={a.next}>Đặt trần cho Mai</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Dưới trần Mai tự trả rồi báo anh. Trên trần Mai dừng lại hỏi, kể cả khi anh đang họp.">Mai được trả hộ tới đâu</H1>
      <div style={{ fontSize: 13.5, fontWeight: 650, color: T.sub, marginBottom: 8 }}>Mỗi lần tối đa</div>
      <Slots value={a.d.cap || "500.000đ"} onPick={(v) => a.set({ cap: v })}
        list={[{ t: "0đ", note: "hỏi mọi lần" }, { t: "200.000đ", note: "chặt" }, { t: "500.000đ", note: "vừa" }, { t: "1.000.000đ" }, { t: "2.000.000đ", note: "rộng" }, { t: "Không giới hạn", full: true, note: "Mai không nhận" }]} />
      {/* Trần mỗi lần một mình là trần giả: chia nhỏ hoá đơn là lọt hết. */}
      <div style={{ fontSize: 13.5, fontWeight: 650, color: T.sub, margin: "14px 0 8px" }}>Cả ngày tối đa</div>
      <Slots value={a.d.day || "1.000.000đ"} onPick={(v) => a.set({ day: v })}
        list={[{ t: "500.000đ", note: "chặt" }, { t: "1.000.000đ", note: "vừa" }, { t: "3.000.000đ", note: "rộng" }]} />
      <div style={{ marginTop: 12 }}>
        <Toggle on={a.d.big !== false} onTap={(v) => a.set({ big: v })} t="Khoản lạ luôn hỏi" s="Người nhận mới, hoặc số tiền gấp đôi thói quen, Mai hỏi dù dưới trần" />
      </div>
      <div style={{ marginTop: 10 }}>
        <Toggle on={a.d.tell !== false} onTap={(v) => a.set({ tell: v })} t="Báo Vy mỗi khoản trên 1 triệu" s="Hai người cùng biết, đỡ một lần hỏi nhau" />
      </div>
      <Foot><Btn wide onClick={a.next}>Quét mặt để xác nhận</Btn></Foot>
    </>
  ),
  (a) => <FaceStep label="Đặt trần chi tiêu" sub={"Mai tự trả tối đa " + (a.d.cap || "500.000đ") + " mỗi lần"} onDone={a.next} onCancel={() => a.go(Math.max(0, a.i - 1))} />,
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "4px 0" }}><StrokeCheck size={34} /></div>
      <H1 sub="Đổi lúc nào cũng được, anh mở ví là thấy. Mai không tự nới trần cho mình bao giờ.">Đặt xong</H1>
      <div style={{ background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 16, padding: "13px 14px" }}>
        <div style={{ fontSize: 14.5, color: "#14603C", lineHeight: 1.6 }}>
          Từ giờ Mai tự trả các khoản dưới <b style={{ ...num }}>{a.d.cap || "500.000đ"}</b> mỗi lần, và không quá <b style={{ ...num }}>{a.d.day || "1.000.000đ"}</b> cả ngày. Quá một trong hai mức đó, hoặc người nhận lạ, Mai dừng lại hỏi anh trước.
        </div>
      </div>
      <div style={{ marginTop: 11, fontSize: 14, color: T.sub, lineHeight: 1.55 }}>{parseCap(a.d.cap) >= 850000
        ? "Học bơi 850.000đ hôm nay nằm dưới trần này, nên lần sau Mai tự trả rồi báo anh."
        : "Học bơi 850.000đ hôm nay là khoản trên trần, nên Mai đã hỏi anh chứ không tự trả."}</div>
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Xong</Btn></Foot>
    </>
  ),
];

// ————————————————————————————————————————————————————————————
// TẤM BÌA · màn đầu tiên cho người lạ mở link
// Ba người dùng thử đều tưởng mình mở nhầm máy người khác rồi không dám
// chạm gì. Tấm bìa nói trước ba điều: nhà ai, xem hay dùng, tiền thật hay
// xem thử. Một tấm, không lật, không chấm tròn, không vuốt.
// ————————————————————————————————————————————————————————————
const CAST = [
  { n: "anh Hải", r: "bố" },
  { n: "chị Vy", r: "mẹ" },
  { n: "Bin", r: "con trai" },
  { n: "Na", r: "con gái" },
];
const Cover = ({ onClose }) => (
  <div className="rise" style={{ position: "absolute", inset: 0, zIndex: 80, background: T.bg, fontFamily: FONT, display: "flex", flexDirection: "column" }}>
    <button onClick={onClose} className="btn press" style={{ position: "absolute", top: 18, right: 14, zIndex: 2, height: 40, display: "inline-flex", alignItems: "center", gap: 6, padding: "0 14px", borderRadius: 999, border: `1px solid ${T.hair}`, background: T.surf, fontSize: 15 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: T.sub }}>Bỏ qua</span>
      <X size={16} color={T.faint} />
    </button>

    <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 6px" }}>
      <div style={{ height: 30, display: "flex", alignItems: "center", gap: 9 }}>
        <Logo size={24} />
        <span style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, color: T.ink }}>m.ai</span>
      </div>

      <div style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.6, color: T.ink, marginTop: 16 }}>Trợ lý riêng, ngay trong tin nhắn</div>
      <div style={{ fontSize: 17, lineHeight: 1.55, color: T.sub, marginTop: 9, maxWidth: 348 }}>Việc nhà, việc cơ quan, hội nhóm bạn bè. Mai nhớ, Mai nhắc, Mai làm hộ mình.</div>

      {/* Bốn ô này để người xem thấy Mai không chỉ lo việc nhà. */}
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        {[[Users, "Nhóm và hội nhóm"], [MessageCircle, "Zalo, email, loa, xe"], [Wallet, "Trả tiền, đi chợ"], [FolderClosed, "Nhớ giấy tờ, hạn việc"]].map(([Ic, label]) => (
          <div key={label} style={{ flex: "1 1 0", minWidth: 0, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, background: T.brandSoft, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ic size={17} color={T.brand} strokeWidth={2} /></span>
            </div>
            <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.3 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: T.hair, margin: "14px 0 12px" }} />

      <div style={{ fontSize: 14, fontWeight: 750, letterSpacing: 0.7, color: T.faint }}>BẢN XEM THỬ NÀY</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 600, color: T.ink, marginTop: 5, marginBottom: 12 }}>Một buổi chiều của nhà anh Hải</div>

      {/* Năm ô mặt người: trả lời "Bin là đứa nào?" trước khi bác ấy kịp hỏi. */}
      <div style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {CAST.map((c) => (
          <div key={c.n} style={{ flex: "1 1 0", minWidth: 0, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Avatar name={c.n} size={48} /></div>
            <div style={{ fontSize: 15, fontWeight: 650, color: T.ink, whiteSpace: "nowrap" }}>{c.n}</div>
            <div style={{ fontSize: 15, color: T.sub, marginTop: 2, lineHeight: 1.3, minHeight: 39 }}>{c.r}</div>
          </div>
        ))}
        <div style={{ flex: "1 1 0", minWidth: 0, textAlign: "center", marginLeft: 6 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <span style={{ width: 48, height: 48, borderRadius: 15, background: `linear-gradient(145deg, #E8825A, ${T.brand})`, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(194,85,47,.28)" }}><Logo size={26} /></span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 650, color: T.ink, whiteSpace: "nowrap" }}>Mai</div>
          <div style={{ fontSize: 15, color: T.sub, marginTop: 2, lineHeight: 1.3, minHeight: 39 }}>lo việc nhà</div>
        </div>
      </div>

      {/* Câu quan trọng nhất tấm bìa: giải thích vì sao Mai gọi "anh". */}
      <div style={{ fontSize: 16.5, lineHeight: 1.5, color: T.sub, marginTop: 12, maxWidth: 360 }}>Trong này Mai gọi “anh” là gọi anh Hải, không phải gọi người đang xem đâu.</div>

      <div style={{ height: 1, background: T.hair, margin: "14px 0 13px" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ transform: "rotate(-6deg)", flexShrink: 0 }}>
          <div className="pop" style={{ padding: "7px 12px", border: `2.5px solid ${T.brandInk}`, borderRadius: 8, background: T.brandSoft, fontSize: 16, fontWeight: 800, letterSpacing: 2, color: T.brandInk, animationDelay: "320ms" }}>XEM THỬ</div>
        </div>
        <div style={{ fontSize: 16.5, lineHeight: 1.45, color: T.ink, minWidth: 0 }}>Tiền trong này không phải tiền thật, bấm nút nào cũng không mất của ai.</div>
      </div>
    </div>

    <div style={{ flexShrink: 0, padding: "13px 22px calc(18px + env(safe-area-inset-bottom))", background: T.bg, borderTop: `1px solid ${T.hair}` }}>
      <button onClick={onClose} className="btn press" style={{ width: "100%", height: 56, borderRadius: 14, background: T.brand, color: "#FFFDF9", fontSize: 18, fontWeight: 700, boxShadow: "var(--e-brand, 0 2px 10px rgba(194,85,47,.30))" }}>Vào xem thử</button>
    </div>
  </div>
);

// ————————————————————————————————————————————————————————————
// WINX · thẻ thành viên, quét tích điểm, lên hạng
// Cái thẻ này là thứ người ta chụp màn hình khoe bạn, nên nó được
// vẽ như thẻ thật: nền chuyển màu theo hạng, hoa văn bảo an, mã vạch.
// ————————————————————————————————————————————————————————————
const TIERS = [
  { id: "bac", n: "Bạc", min: 0, a: "#CBD3DA", b: "#78868F", ink: "#F8FAFB", dim: "rgba(255,255,255,.62)",
    perks: ["Tích 1 điểm mỗi 1.000đ", "Voucher 10.000đ mỗi tháng"] },
  { id: "vang", n: "Vàng", min: 1000, a: "#F3C963", b: "#B5822A", ink: "#3B2B08", dim: "rgba(59,43,8,.58)",
    perks: ["Tích gấp đôi cuối tuần", "Voucher 20.000đ mỗi tháng", "Giao nhanh Supra miễn phí"] },
  { id: "kc", n: "Kim cương", min: 5000, a: "#B9CDF7", b: "#7A66D8", ink: "#F5F8FF", dim: "rgba(245,248,255,.68)",
    perks: ["Tích gấp ba cuối tuần", "Voucher 150.000đ mỗi tháng", "Quầy ưu tiên ở WinMart+", "Giao nhanh Supra miễn phí"] },
];
// Chỉ nhắc khay rẻ hơn khi chênh đáng kể, còn lệch vài nghìn thì im cho gọn giỏ.
const worthSwitch = (was, now) => was - now >= 30000 || (was - now) / was >= 0.2;
const tierOf = (p) => TIERS.reduce((acc, t) => (p >= t.min ? t : acc), TIERS[0]);
const nextTier = (p) => TIERS.find((t) => t.min > p) || null;

// Mã vạch vẽ từ chuỗi, cùng chuỗi thì cùng mã — không random giữa các lần render.
const Barcode = ({ code = "8938505974194", w = 240, h = 54, color = "#241F1A" }) => {
  const bars = useMemo(() => {
    let s = hash32(code) || 1, x = 0;
    const out = [];
    while (x < 100) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const bw = 0.45 + ((s >>> 8) % 5) * 0.34;
      const gap = 0.4 + ((s >>> 16) % 4) * 0.26;
      if (x + bw > 100) break;
      out.push([r2(x), r2(bw)]);
      x += bw + gap;
    }
    return out;
  }, [code]);
  return (
    <svg viewBox="0 0 100 24" width={w} height={h} preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
      {bars.map(([x, bw], i) => <rect key={i} x={x} y="0" width={bw} height="24" fill={color} />)}
    </svg>
  );
};

// Hoa văn kiểu giấy tờ có giá — thứ làm cái thẻ trông "thật".
const Guilloche = ({ uid, tint }) => (
  <g opacity="0.5">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <ellipse key={i} cx={250 - i * 16} cy={78} rx={128 - i * 9} ry={62 - i * 5}
        fill="none" stroke={tint} strokeWidth="0.7" opacity={0.5 - i * 0.06} />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <circle key={"c" + i} cx={44} cy={128} r={30 + i * 15} fill="none" stroke={tint} strokeWidth="0.6" opacity={0.34 - i * 0.07} />
    ))}
  </g>
);

const TierCard = ({ points, name = "PHẠM ĐỨC HẢI", code = "8938505974194", flash }) => {
  const tier = tierOf(points);
  const uid = useUid("tc");
  return (
    <div className={flash ? "rise tier-flash" : "rise"} style={{ position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: "0 10px 30px rgba(60,45,30,.22), 0 2px 6px rgba(60,45,30,.12)" }}>
      <svg viewBox="0 0 340 190" style={{ display: "block", width: "100%", height: "auto" }} aria-hidden="true">
        <defs>
          <linearGradient id={uid + "g"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={tier.a} /><stop offset="1" stopColor={tier.b} />
          </linearGradient>
          <linearGradient id={uid + "s"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.30" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="340" height="190" fill={`url(#${uid}g)`} />
        <Guilloche uid={uid} tint={tier.ink} />
        <rect className="tier-sheen" x="-150" y="0" width="130" height="190" fill={`url(#${uid}s)`} transform="skewX(-18)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, padding: "15px 17px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: tier.dim }}>WINX</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 25, fontWeight: 600, color: tier.ink, letterSpacing: -0.4, marginTop: 3, textShadow: "0 1px 2px rgba(0,0,0,.14)" }}>Hạng {tier.n}</div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.24)", border: `1px solid ${tier.dim}`, borderRadius: 999, padding: "5px 11px", backdropFilter: "blur(3px)" }}>
            <Sparkles size={13} color={tier.ink} strokeWidth={2.4} />
            <span style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, color: tier.ink, ...num }}>{points.toLocaleString("vi-VN")}</span>
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.1, color: tier.ink, marginBottom: 8, textShadow: "0 1px 2px rgba(0,0,0,.14)" }}>{name}</div>
        <div style={{ background: "#FFFDF9", borderRadius: 9, padding: "7px 9px 5px" }}>
          <Barcode code={code} w="100%" h={38} />
          <div style={{ fontSize: 10.5, letterSpacing: 2.4, color: T.sub, textAlign: "center", marginTop: 3, ...num }}>{code}</div>
        </div>
      </div>
    </div>
  );
};

// ————— rủ bạn, chỉ ở đúng lúc vừa nhận được giá trị —————
const ShareNudge = ({ line, cta, onDone }) => {
  const [s, setS] = useState(0);
  if (s === 2)
    return (
      <div className="rise" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "11px 13px", background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 14 }}>
        <Check size={15} color={T.green} strokeWidth={3} />
        <span style={{ fontSize: 14, color: "#14603C", lineHeight: 1.45 }}>Đã gửi. Bạn anh mở là dùng được ngay, không phải cài gì.</span>
      </div>
    );
  return (
    <div style={{ marginTop: 14, padding: "12px 13px", background: T.bg, border: `1px solid ${T.hair}`, borderRadius: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Users size={16} color={T.sub} strokeWidth={2.2} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: T.sub, lineHeight: 1.45 }}>{line}</span>
      </div>
      {s === 0 ? (
        <button onClick={() => setS(1)} className="btn press" style={{ marginTop: 10, width: "100%", background: T.surf, color: T.ink, border: `1px solid ${T.hair}`, fontSize: 14.5, padding: "11px 14px" }}>{cta}</button>
      ) : (
        <div className="rise" style={{ marginTop: 10, display: "grid", gap: 7 }}>
          {[["Nhà mình", "4 người"], ["Ông bà & cô chú", "8 người"], ["Chọn bạn khác", "từ danh bạ"]].map(([n, s2]) => (
            <button key={n} onClick={() => { setS(2); ding(true); onDone && onDone(); }} className="btn press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: T.surf, color: T.ink, border: `1px solid ${T.hair}`, padding: "10px 12px", textAlign: "left" }}>
              <Avatar name={n} size={30} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 650 }}>{n}</span>
                <span style={{ display: "block", fontSize: 13, color: T.faint, fontWeight: 400 }}>{s2}</span>
              </span>
              <ChevronRight size={15} color={T.faint} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 14 · WINX (7 bước) · quét ở quầy → lên hạng → đổi voucher
const flowWinx = (finish, onShare) => [
  (a) => (
    <>
      <H1 sub="Đưa mã này cho nhân viên quầy là xong, không cần mở app nào khác.">Thẻ WinX của anh</H1>
      <TierCard points={840} />
      <div style={{ marginTop: 12 }}>
        <KV rows={[["Hạng hiện tại", "Bạc"], ["Điểm", "840"], ["Còn để lên Vàng", "160 điểm", "amber"], ["Dùng ở", "WinMart+ · Phúc Long · MEATDeli"]]} />
      </div>
      <Foot><Btn wide onClick={a.next}>Quét ở quầy WinMart+</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Quầy WinMart+ Thảo Điền · đơn 186.000đ mua tại quầy sáng nay.">Đang quét mã</H1>
      <div style={{ position: "relative", background: "#FFFDF9", border: `1px solid ${T.hair}`, borderRadius: 16, padding: "20px 16px", overflow: "hidden" }}>
        <Barcode code="8938505974194" w="100%" h={62} />
        <div className="scan" />
      </div>
      <AutoNext ms={1500} onDone={a.next}>
        <div style={{ marginTop: 13, display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: T.sub }}>
          <Sparkles size={15} color={T.brand} className="spin-soft" /> Máy quầy đang đọc mã của anh…
        </div>
      </AutoNext>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "2px 0 6px" }}><Burst /><StrokeCheck size={34} /></div>
      <H1 sub="1.000đ được 1 điểm. Trả bằng WinMoney mới cộng, trả tiền mặt thì không.">Cộng 186 điểm</H1>
      <div style={{ display: "flex", alignItems: "center", gap: 13, background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 16, padding: "14px 15px" }}>
        <Donut value={1026} total={5000} size={58} color={T.brand} label="1.026" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 650, color: T.ink }}>840 → 1.026 điểm</div>
          <div style={{ fontSize: 13.5, color: T.green, fontWeight: 650, marginTop: 3 }}>Vừa đủ lên hạng Vàng</div>
        </div>
      </div>
      <Foot><Btn wide onClick={a.next}>Xem hạng mới</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Hạng giữ trong 12 tháng. Mai nhắc trước khi sắp tụt hạng.">Lên hạng Vàng</H1>
      <TierCard points={1026} flash />
      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        {tierOf(1026).perks.map((p) => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 13, padding: "11px 12px" }}>
            <IconSq Icon={Check} tint={T.greenBg} color={T.green} size={26} />
            <span style={{ fontSize: 14, color: T.ink }}>{p}</span>
          </div>
        ))}
      </div>
      <Foot><Btn wide onClick={a.next}>Ba hạng có gì khác</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Càng mua ở WinMart+, Phúc Long, MEATDeli thì càng nhanh lên hạng.">Ba hạng</H1>
      <div style={{ display: "grid", gap: 9 }}>
        {TIERS.map((tr) => {
          const on = tr.id === "vang";
          return (
            <div key={tr.id} style={{ display: "flex", alignItems: "center", gap: 12, background: on ? T.brandSoft : T.surf, border: `1px solid ${on ? "#EBCBB6" : T.hair}`, borderRadius: 14, padding: "12px 13px" }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(140deg, ${tr.a}, ${tr.b})`, flexShrink: 0, boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{tr.n}{on && <span style={{ fontSize: 13, fontWeight: 650, color: T.brandInk }}> · hạng của anh</span>}</div>
                <div style={{ fontSize: 13.5, color: T.sub, marginTop: 2, ...num }}>{tr.min === 0 ? "từ 0 điểm" : "từ " + tr.min.toLocaleString("vi-VN") + " điểm"} · {tr.perks.length} quyền lợi</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 13.5, color: T.sub, lineHeight: 1.55, ...num }}>Anh còn 3.974 điểm nữa là lên Kim cương. Cứ đi chợ như thường thì khoảng 8 tháng.</div>
      <Foot><Btn wide onClick={a.next}>Ví voucher</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Hạng Vàng mở thêm hai phiếu. Chạm để chọn phiếu anh muốn dùng.">Ví voucher</H1>
      <Choice value={a.d.v || "v20"} onPick={(v) => a.set({ v })}
        items={[
          { id: "v20", Icon: Ticket, t: "Phiếu mua hàng 20.000đ", s: "đơn từ 200.000đ · WinMart+ · mới mở", right: "Vàng" },
          { id: "v50", Icon: Store, t: "Giảm 50% ly thứ hai", s: "Phúc Long · tới cuối tháng", right: "Vàng" },
          { id: "v10", Icon: Ticket, t: "Phiếu mua hàng 10.000đ", s: "đơn từ 100.000đ · WinMart+", right: "Bạc" },
        ]} />
      <Foot><Btn wide onClick={a.next}>Dùng phiếu này</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "2px 0 6px" }}><StrokeCheck size={34} /></div>
      <H1 sub="Phiếu nằm sẵn trong thẻ. Lần tới quét mã ở quầy là tự trừ, anh không phải nhớ.">Đã nhận phiếu</H1>
      <div style={{ background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 14, padding: "13px 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.5 }}>ĐANG GIỮ</div>
        <div style={{ fontSize: 15, fontWeight: 650, color: T.ink, marginTop: 4 }}>{a.d.v === "v50" ? "Giảm 50% ly thứ hai · Phúc Long" : a.d.v === "v10" ? "Phiếu mua hàng 10.000đ" : "Phiếu mua hàng 20.000đ"}</div>
        <div style={{ fontSize: 13.5, color: T.sub, marginTop: 3, ...num }}>Hạng Vàng · 1.026 điểm · giữ tới 08/2027</div>
      </div>
      <ShareNudge line="Nhà anh Hải vừa lên hạng Vàng. Rủ người nhà tích chung một thẻ thì lên hạng nhanh gấp đôi." cta="Rủ người nhà tích chung" onDone={onShare} />
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Xong</Btn></Foot>
    </>
  ),
];

// ————————————————————————————————————————————————————————————
// WIN+ HAI BÀ TRƯNG · nhóm Zalo của cửa hàng
// Nhóm thật ngoài đời: nhân viên chụp khay thịt giảm giá, khách nhắn
// "chừa em một khay". Ghim của nhóm là "đừng rời nhóm, hãy tắt thông
// báo" — tức là nhóm hữu ích nhưng ồn. Đó đúng là việc của Mai.
// ————————————————————————————————————————————————————————————
const TRAYS = [
  { n: "Ba rọi heo", g: "398g", was: 75600, now: 53000, img: "photos/baroi.jpg", k: ["ba roi", "ba chi"] },
  { n: "Nạc đùi", g: "401g", was: 58500, now: 41000, img: "photos/duiheo.jpg", k: ["dui heo", "nac dui", "dui"] },
  { n: "Cốt lết", g: "409g", was: 59700, now: 44000, img: "photos/cotlet.jpg", k: ["cot let", "cotlet"] },
  { n: "Nạc vai", g: "407g", was: 59300, now: 41000, img: "photos/nacvai.jpg", k: ["nac vai", "nac"] },
  { n: "Nạc dăm", g: "395g", was: 68000, now: 47000, img: "photos/nacdam.jpg", k: ["nac dam", "dam dau gion"] },
  { n: "Sườn non", g: "327g", was: 96000, now: 62000, hot: true, img: "photos/suonnon.jpg", k: ["suon non", "suon"] },
];
const TrayGrid = ({ onTap }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
    {TRAYS.map((x) => (
      <div key={x.n} onClick={() => onTap(x)} className="press"
        style={{ background: T.surf, border: `${x.hot ? 2.5 : 1}px solid ${x.hot ? T.brand : T.hair}`, borderRadius: 11, padding: x.hot ? "6.5px 6.5px 5.5px" : "8px 8px 7px", cursor: "pointer", boxShadow: x.hot ? "0 2px 8px rgba(194,85,47,.18)" : "none" }}>
        <div style={{ height: 58, borderRadius: 8, marginBottom: 6, overflow: "hidden", background: "#F1EBE1" }}>
          <img src={x.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 650, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.n}</div>
        <div style={{ fontSize: 12.5, color: T.faint, ...num }}>{x.g}</div>
        <div style={{ marginTop: 3, ...num }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: x.hot ? T.brandInk : T.ink }}>{Math.round(x.now / 1000)}k</span>
          <span style={{ fontSize: 12, color: T.faint, textDecoration: "line-through", marginLeft: 4 }}>{Math.round(x.was / 1000)}k</span>
        </div>
      </div>
    ))}
  </div>
);

// 15 · CHỪA HÀNG Ở CỬA HÀNG (6 bước)
const flowHold = (finish, tray) => {
  const x = tray || TRAYS[5];
  const cheaper = TRAYS.filter((y) => y.now < x.now).sort((a, b) => a.now - b.now)[0];
  return [
  (a) => (
    <>
      <H1 sub="Chị My bên quầy tươi đăng lúc 08:21, sáu khay giảm giá sáng nay.">Chừa {x.n.toLowerCase()}</H1>
      <div style={{ display: "flex", alignItems: "center", gap: 13, background: T.brandSoft, border: "1px solid #EBCBB6", borderRadius: 16, padding: "13px 14px", marginBottom: 12 }}>
        <Scene name="meal" small />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{x.n} MEATDeli {x.g}</div>
          <div style={{ fontSize: 14, color: T.brandInk, marginTop: 2, ...num }}>{fmt(x.now)} · thường {fmt(x.was)} · rẻ hơn {fmt(x.was - x.now)}</div>
        </div>
      </div>
      <KV rows={[["Cửa hàng", "Win+ 13 Hai Bà Trưng · 1,2km"], ["Người đăng", "chị My · nhân viên quầy tươi"], ["Giữ tới", "18:00 chiều nay", "amber"]]} />
      {/* Không giấu khay rẻ hơn. Người đi chợ bốn mươi năm nhìn ra ngay. */}
      {cheaper && (
        <div style={{ marginTop: 10, fontSize: 14, color: T.sub, lineHeight: 1.5 }}>
          Rẻ nhất sáng nay là {cheaper.n.toLowerCase()} {fmt(cheaper.now)}. Mai gợi ý khay này vì hợp nồi bò kho tối nay, còn anh muốn khay rẻ hơn thì quay ra chạm khay đó.
        </div>
      )}
      <Express
        now={() => { a.set({ qty: 1, take: "supra" }); a.go(3); }}
        nowLabel={"Chừa 1 khay · Supra giao tận cửa"}
        more={a.next}
        moreLabel="Em ghé lấy, hoặc đổi số lượng" />
    </>
  ),
  (a) => (
    <>
      <H1 sub="Chị My giữ tới 18:00 chiều nay.">Chừa mấy khay</H1>
      <Qty items={[{ n: x.n + " " + x.g, p: x.now, q: a.d.qty || 1 }]} set={(i, q) => a.set({ qty: q })} />
      <Foot><Btn wide onClick={a.next}>Chọn cách nhận</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Cửa hàng cách nhà 1,2km, đi bộ khoảng 15 phút.">Nhận thế nào</H1>
      <Choice value={a.d.take || "supra"} onPick={(v) => a.set({ take: v })}
        items={[
          { id: "supra", Icon: ShoppingCart, t: "Supra giao tận cửa", s: "trong 2 tiếng · đơn trên 100.000đ miễn phí", right: "0đ" },
          { id: "self", Icon: Store, t: "Anh ghé lấy", s: "quầy tươi · nói tên là chị My đưa", right: "1,2km" },
        ]} />
      <Foot><Btn wide onClick={a.next}>Nhắn chị My</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Mai nhắn riêng chị My, không đăng vào nhóm 498 người.">Tin Mai gửi</H1>
      <div style={{ background: T.dark, color: "#FBF7F1", borderRadius: 16, borderBottomRightRadius: 6, padding: "12px 14px", fontSize: 14.5, lineHeight: 1.5 }}>
        Chị My ơi, chừa em {a.d.qty || 1} khay {x.n.toLowerCase()} {x.g} nha chị. {a.d.take === "self" ? "Chiều em ghé lấy." : "Cho em gửi Supra giao giúp ạ."} Em cảm ơn chị.
      </div>
      <AutoNext ms={1600} onDone={a.next}>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: T.sub }}>
          <Sparkles size={15} color={T.brand} className="spin-soft" /> Đang gửi cho chị My…
        </div>
      </AutoNext>
    </>
  ),
  (a) => (
    <>
      <H1 sub="Chị My trả lời sau 40 giây, nhanh hơn Mai tưởng.">Chị My đã chừa</H1>
      <Evidence src="chị My · Win+ 13 Hai Bà Trưng" time="08:24" Icon={Store} color="#E8342C"
        text={"Dạ chị chừa rồi nha em, khay " + Math.round(x.now / 1000) + "k. Em nói tên là lấy được, hoặc để chị đưa shipper Supra."} />
      <div style={{ marginTop: 12 }}>
        <KV rows={[["Đã chừa", (a.d.qty || 1) + " khay " + x.n.toLowerCase()], ["Giá", fmt(x.now * (a.d.qty || 1))], ["Nhận", a.d.take === "self" ? "anh ghé quầy tươi" : "Supra giao trong 2 tiếng"], ["Giữ tới", "18:00 chiều nay", "amber"]]} />
      </div>
      <Foot><Btn wide onClick={a.next}>Xong</Btn></Foot>
    </>
  ),
  (a) => (
    <>
      <div style={{ textAlign: "center", padding: "2px 0 6px" }}><StrokeCheck size={34} /></div>
      <H1 sub="Mai vẫn đọc nhóm giúp anh. Có khay hợp bếp nhà mình thì Mai báo, còn lại Mai để yên.">Đã chừa hàng</H1>
      <div style={{ background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 16, padding: "13px 14px" }}>
        <div style={{ fontSize: 14, color: "#14603C", lineHeight: 1.55, ...num }}>
          Rẻ hơn giá thường {fmt((x.was - x.now) * (a.d.qty || 1))}. Trả bằng WinMoney thì cộng thêm {x.now * (a.d.qty || 1) / 1000} điểm WinX, còn trả tiền mặt vẫn được giá này.
        </div>
      </div>
      <Foot><Btn wide onClick={() => { finish(a.d); a.close(); }}>Về nhóm</Btn></Foot>
    </>
  ),
];
};

// Bốn hình thiết bị: cùng nét 1.9, cùng cỡ quang học, trắng trên ô tối.
const DevSpeaker = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2.5" width="14" height="19" rx="3.2" /><circle cx="12" cy="15" r="3.4" /><circle cx="12" cy="7" r="1.5" />
  </svg>
);
const DevWatch = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="3.4" /><path d="M9.5 6V3h5v3M9.5 18v3h5v-3" /><path d="M12 10v2.4l1.8 1.1" />
  </svg>
);
const DevBuds = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 9.5a3.2 3.2 0 10-3.2 3.2h.7v5.6a1.6 1.6 0 003.2 0V9.5Z" /><path d="M15.5 9.5a3.2 3.2 0 113.2 3.2h-.7v5.6a1.6 1.6 0 01-3.2 0V9.5Z" />
  </svg>
);
const DevCar = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13.5l1.8-5A2.4 2.4 0 017.1 7h9.8a2.4 2.4 0 012.3 1.5l1.8 5" /><path d="M2.6 13.5h18.8v3.6H2.6z" /><circle cx="6.6" cy="17.1" r="1.5" /><circle cx="17.4" cy="17.1" r="1.5" />
  </svg>
);

const SURFACES = [
  { id: "winx", n: "WinX", img: "logos/winx.png", c: "#FFFFFF", pad: 0, flow: "winx" },
  { id: "zalo", n: "Zalo", img: "logos/zalo.svg", c: "#0068FF", pad: 10, flow: "kb", app: "Zalo" },
  { id: "wa", n: "WhatsApp", img: "logos/whatsapp.svg", c: "#25D366", pad: 9, flow: "kb", app: "WhatsApp" },
  { id: "gmail", n: "Gmail", img: "logos/gmail.svg", c: "#FFFFFF", pad: 9, flow: "share" },
  { id: "loa", n: "Loa", Dev: DevSpeaker, c: T.dark, flow: "speaker" },
  { id: "watch", n: "Đồng hồ", Dev: DevWatch, c: "#3A4A6B", flow: "dev" },
  { id: "buds", n: "Tai nghe", Dev: DevBuds, c: "#6E665C", flow: "dev" },
  { id: "car", n: "Xe", Dev: DevCar, c: "#1C2536", flow: "dev" },
];

// ————————————————————————————————————————————————————————————
// APP
// ————————————————————————————————————————————————————————————
export default function MaiV18() {
  const [intro, setIntro] = useState(true);
  const [cover, setCover] = useState(true);
  const [pointing, setPointing] = useState(false);
  const [visitedFamily, setVisitedFamily] = useState(false);
  const [screen, setScreen] = useState("home");
  const [flow, setFlow] = useState(null);          // luồng đang mở
  const [post, setPost] = useState(null);          // bài đang mở
  const [prof, setProf] = useState(null);          // hồ sơ người đăng
  const [file, setFile] = useState(null);          // giấy tờ đang mở
  const [files, setFiles] = useState(false);       // danh sách hồ sơ
  const [done, setDone] = useState({});
  const [evt, setEvt] = useState(0);
  const [undone, setUndone] = useState(false);
  const [cam, setCam] = useState(0);
  const [camUndone, setCamUndone] = useState(false);
  const [seenMai, setSeenMai] = useState(false);
  const [mic, setMic] = useState(0);
  const [surfApp, setSurfApp] = useState("Zalo");
  const [famMsgs, setFamMsgs] = useState([]);
  const [ongMsgs, setOngMsgs] = useState([]);
  const [wpMsgs, setWpMsgs] = useState([]);
  const [holdTray, setHoldTray] = useState(null);
  const [tray, setTray] = useState(false);
  const [maiMsgs, setMaiMsgs] = useState([{ id: 0, from: "mai", text: "Chào anh Hải. Còn 2 việc gấp trước 17:00 bên Nhà mình. Anh hỏi Mai gì cũng được, gõ hoặc bấm nút nói." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chips, setChips] = useState(GREETING_CHIPS);
  const [tick, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);
  const closeCover = () => { setCover(false); setTimeout(() => setPointing(true), 400); };
  const endRef = useRef(null);
  const vyReplied = useRef(false);
  const recRef = useRef(null);
  const lastHit = useRef(null);   // để "ừ", "ok" nối được vào câu trước
  const fbSeq = useRef(0);        // xoay vòng câu đỡ, không lặp lại một câu
  const flowFrom = useRef(null);  // luồng mở từ chat thì Mai báo lại trong chat

  useEffect(() => { if (tick === 0) return; endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [tick]);
  useEffect(() => { setInput(""); setTray(false); }, [screen]);
  const firstDone = useRef(false);
  const complete = (k) => {
    setDone((d) => ({ ...d, [k]: true }));
    ding(true); bump();
    if (!firstDone.current) {
      firstDone.current = true;
      setTimeout(() => { setEvt(1); bump(); }, 2200);
      setTimeout(() => { setEvt(2); bump(); }, 3400);
    }
  };
  const allDone = done.pay && done.form && done.pick;
  const bal = 2480000 - (done.pay ? 850000 : 0) - (done.cartTotal != null ? done.cartTotal : done.cart ? 186000 : 0) - (done.form ? 120000 : 0) - (done.tea ? 165000 : 0);
  const [teaArm, setTeaArm] = useState(0); // 0 nghỉ · 1 chờ chạm lần hai
  const spent = [
    done.pay && { t: "Học bơi tháng 8 · Bin", s: "15:43 · biên lai gửi riêng cô Lan", v: 850000, Icon: Banknote },
    done.cart && { t: "Giỏ WinMart+ hôm nay", s: "Supra giao trước 18:00", v: 186000, Icon: ShoppingCart },
    done.tea && { t: "Hộp trà sen Phúc Long", s: "giỗ Ông 09/08 · giao 08/08", v: 165000, Icon: Store },
    done.form && { t: "Phí dã ngoại Cần Giờ · Na", s: "đã gửi cô Hồng cùng đơn", v: 120000, Icon: FileText },
  ].filter(Boolean);

  const snap = () => {
    if (cam !== 0) return;
    setCam(1); bump();
    setTimeout(() => { setCam(2); ding(true); bump(); }, 1300);
  };

  // Mai gõ ra từng chữ. Chữ dài đánh chậm hơn chữ ngắn, nên nhịp
  // nghe như người thật chứ không như con trỏ máy.
  const stream = (hit) => {
    const id = Date.now() + Math.random();
    const text = hit.reply || "Mai đây anh.";
    setMaiMsgs((x) => [...x, {
      id, from: "mai", text, src: hit.src, streaming: true,
      extra: <ReplyActions hit={hit} onFlow={(f) => openFlow(f, "mai")} onGoto={(s) => setScreen(s)} onFiles={() => { setFiles(true); ding(); }} />,
    }]);
    bump();
    const ms = Math.min(text.split(" ").length, 27) * 28 + 400;
    setTimeout(() => {
      setMaiMsgs((x) => x.map((m) => (m.id === id ? { ...m, streaming: false } : m)));
      if (hit.chips && hit.chips.length) setChips(hit.chips);
      bump();
    }, ms);
  };

  // Không gọi mạng. Ghép ý định tại chỗ rồi trả lời kèm nút bấm thật.
  const askMai = (q) => {
    setScreen("mai"); setSeenMai(true);
    setMaiMsgs((x) => [...x, { id: Date.now(), from: "vy", text: q }]);
    setBusy(true); bump();
    const hit = matchMai(q, { last: lastHit.current, chips }) || pickFallback(fbSeq.current++);
    lastHit.current = hit;
    // nghĩ một nhịp ngắn, đủ để thấy Mai đang đọc chứ không phải tra bảng
    setTimeout(() => { setBusy(false); stream(hit); }, 260 + Math.min(520, q.length * 11));
  };
  const startMic = () => {
    if (mic === 1) { try { recRef.current && recRef.current.stop(); } catch (e) {} setMic(0); return; }
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { setMaiMsgs((x) => [...x, { id: Date.now(), from: "mai", text: "Máy này chưa cho Mai nghe, anh gõ giúp Mai nha." }]); bump(); return; }
      const r = new SR();
      r.lang = "vi-VN"; r.interimResults = false; r.maxAlternatives = 1;
      r.onresult = (e) => { setMic(0); const t = e.results?.[0]?.[0]?.transcript || ""; if (t) askMai(t); };
      r.onerror = () => { setMic(0); setMaiMsgs((x) => [...x, { id: Date.now(), from: "mai", text: "Mai chưa nghe được, anh thử lại hoặc gõ giúp Mai nha." }]); bump(); };
      r.onend = () => { setMic(0); };
      recRef.current = r; setMic(1); r.start();
    } catch (e) { setMic(0); }
  };
  const sendFam = () => {
    const q = input.trim(); if (!q) return;
    setInput(""); setFamMsgs((x) => [...x, { id: Date.now(), from: "vy", text: q }]); bump();
    if (!vyReplied.current) {
      vyReplied.current = true;
      setTimeout(() => { setFamMsgs((x) => [...x, { id: Date.now(), from: "w", name: "Vy", text: "Dạ để em lo, anh yên tâm 👍" }]); bump(); }, 1400);
    }
  };
  const sendWp = () => {
    const q = input.trim(); if (!q) return;
    setInput(""); setWpMsgs((x) => [...x, { id: Date.now(), from: "vy", text: q }]); bump();
    const f = fold(q);
    const hit = TRAYS.find((x) => x.k.some((w) => f.includes(w))) || null;
    setTimeout(() => {
      setWpMsgs((x) => [...x, hit
        ? { id: Date.now() + 1, from: "mai", text: "Anh nhắn " + hit.n.toLowerCase() + " " + fmt(hit.now) + " phải không. Mai nhắn riêng chị My chừa giúp, khỏi chờ trong nhóm 498 người.", extra: <div style={{ marginTop: 9 }}><Btn onClick={() => { setHoldTray(hit); openFlow("hold"); }}>Nhờ chị My chừa</Btn></div> }
        : { id: Date.now() + 1, from: "mai", text: "Sáng nay còn 6 khay giảm giá, rẻ nhất là đùi heo và nạc vai 41.000đ. Anh nói tên món là Mai nhắn riêng chị My chừa giúp." }]);
      bump();
    }, 900);
  };
  const sendOng = () => {
    const q = input.trim(); if (!q) return;
    setInput(""); setOngMsgs((x) => [...x, { id: Date.now(), from: "vy", text: q }]); bump();
  };
  const sendMai = () => { const q = input.trim(); if (!q || busy) return; setInput(""); askMai(q); };

  // Luồng mở từ chat thì Mai quay lại chat báo kết quả, để cuộc trò
  // chuyện khép được vòng chứ không bỏ anh ở màn hình trống.
  const AFTER = {
    pay: ["Xong rồi anh. Biên lai Mai gửi riêng cô Lan, nhà mình là người thứ 15 trên 32.", "biên lai đã gửi", ["Đơn dã ngoại của Na ký chưa?", "Số dư còn bao nhiêu?", "Ai đón Bin chiều nay?"]],
    pickup: ["Chốt xong, Vy đón Bin 16:20. Mai đã vào lịch cả hai người và đặt nhắc trước 15 phút.", "lịch anh và Vy", ["Trả học bơi cho Bin", "Chiều mai lớp có nghỉ không?", "Hôm nay còn việc gì gấp?"]],
    form: ["Đơn đã gửi, cô Hồng nhận rồi. Mai lưu một bản vào hồ sơ của Na.", "email nhà trường", ["Na họp phụ huynh hôm nào?", "Tôi nợ gì tuần này?", "Hộ chiếu Na còn hạn không?"]],
    cart: ["Đặt xong, Supra giao trước 18:00. Giỏ này cộng 186 điểm WinX cho nhà mình.", "WinMart+ · Supra", ["Tối nay nấu gì nhanh?", "Điểm WinX được bao nhiêu?", "Mua quà gì cho Bà?"]],
    ticket: ["Mai canh vé đợt 3, 20:00 ngày 08/08. Tới giờ Mai bấm giúp, anh chỉ cần quét mặt duyệt.", "vé gắn CCCD", ["Tối nay nhà mình xem gì?", "Sang nhượng vé có an toàn không?", "Tối 08/08 tôi rảnh không?"]],
    resale: ["Vé đã sang tên anh, ghế B12-13. Tiền chỉ rời ví khi vé về tới tên anh.", "giữ tiền tới khi nhận vé", ["Vé concert đợt 3 khi nào mở?", "Tối nay nhà mình xem gì?", "Hôm nay còn việc gì gấp?"]],
    inspect: ["Đặt xong 07:30 12/08, trung tâm 50-07V. Giấy tờ Mai gom sẵn trong hồ sơ nhà mình.", "hồ sơ xe", ["Đăng kiểm cần mang giấy gì?", "Phí đăng kiểm bao nhiêu?", "Bảo hiểm xe còn hạn không?"]],
    call: ["Số đó Mai chặn rồi, không đổ chuông nhà mình nữa. Trường thật thì gọi qua số đã định danh.", "chặn giả mạo", ["Trường gọi xin tiền có thật không?", "Mai lọc cuộc gọi kiểu gì?", "Hôm nay còn việc gì gấp?"]],
    winx: ["Quét xong, nhà mình lên hạng Vàng với 1.026 điểm. Phiếu 20.000đ Mai để sẵn trong thẻ.", "thẻ WinX", ["Điểm WinX được bao nhiêu?", "Giỏ hàng bao nhiêu tiền?", "Mua quà gì cho Bà?"]],
    hold: ["Chị My chừa 1 khay bò nạm 99.000đ, rẻ hơn giỏ cũ 40.000đ. Mai vẫn canh nhóm cửa hàng giúp anh.", "Win+ Hai Bà Trưng", ["Tối nay nấu gì nhanh?", "Giỏ hàng bao nhiêu tiền?", "Điểm WinX được bao nhiêu?"]],
  };
  const afterFlow = (id) => {
    if (flowFrom.current !== "mai" || !AFTER[id]) return;
    flowFrom.current = null;
    const [text, src, cs] = AFTER[id];
    setTimeout(() => {
      setMaiMsgs((x) => [...x, { id: Date.now() + Math.random(), from: "mai", text, src }]);
      setChips(cs); bump();
    }, 620);
  };

  // đăng ký luồng
  const end = (id, fn) => (d) => { fn(d); afterFlow(id); };
  const FLOWS = {
    pay: () => flowPay(end("pay", () => complete("pay"))),
    pickup: () => flowPickup(end("pickup", () => complete("pick"))),
    form: () => flowForm(end("form", () => complete("form"))),
    cart: () => flowCart(end("cart", (d) => setDone((x) => ({ ...x, cart: true, cartTotal: d && d.src === "cod" ? 0 : (d && d.total) || 186000, cartSlot: (d && d.slot) || "18:00", cartCod: !!(d && d.src === "cod") })))),
    ticket: () => flowTicket(end("ticket", () => setDone((d) => ({ ...d, ticket: true })))),
    resale: () => flowResale(end("resale", () => setDone((d) => ({ ...d, resale: true })))),
    inspect: () => flowInspect(end("inspect", () => setDone((d) => ({ ...d, inspect: true })))),
    call: () => flowCall(end("call", () => setDone((d) => ({ ...d, call: true }))), () => setDone((d) => ({ ...d, shared: true }))),
    kb: () => flowKeyboard(() => setDone((d) => ({ ...d, kb: true })), surfApp),
    share: () => flowShare(() => setDone((d) => ({ ...d, share: true }))),
    speaker: () => flowSpeaker(() => setDone((d) => ({ ...d, speaker: true }))),
    dev: () => flowDevices(() => setDone((d) => ({ ...d, dev: true }))),
    wallet: () => flowWallet(end("wallet", () => setDone((d) => ({ ...d, wallet: true }))), spent, bal),
    winx: () => flowWinx(end("winx", () => setDone((d) => ({ ...d, winx: true }))), () => setDone((d) => ({ ...d, shared: true }))),
    hold: () => flowHold(end("hold", () => setDone((d) => ({ ...d, hold: true }))), holdTray),
  };
  const TITLES = { pay: "Trả học bơi", pickup: "Người đón Bin", form: "Đơn dã ngoại", cart: "Giỏ WinMart+", ticket: "Vé concert", resale: "Sang nhượng vé", inspect: "Đăng kiểm xe", call: "Cuộc gọi lạ", kb: "Bàn phím m.ai trong " + surfApp, share: "Chia sẻ vào Mai", speaker: "Loa m.ai · nhà Bà", dev: "Đồng hồ · tai nghe · xe", wallet: "Ví WinMoney", winx: "Thẻ WinX", hold: "Chừa hàng ở cửa hàng" };
  const openFlow = (id, from) => { flowFrom.current = from || null; setPost(null); setFile(null); setFlow(id); ding(); };

  const ChatRow = ({ Icon, tint, color, letter, avatar, title, sub, time, unread, verified, onTap }) => (
    <div onClick={onTap} className="press" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderBottom: `1px solid ${T.hair}`, cursor: "pointer", background: T.surf }}>
      {Icon ? <IconSq Icon={Icon} tint={tint} color={color} size={40} />
        : avatar ? <Avatar name={avatar} initial={letter} size={40} />
        : <span style={{ width: 40, height: 40, borderRadius: 14, background: tint, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{letter}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontWeight: 650, fontSize: 15, color: T.ink }}>{title}</span>
          {verified && <ShieldCheck size={13} color={T.green} />}
          <span style={{ fontSize: 11, color: T.faint, marginLeft: "auto", ...num }}>{time}</span>
        </div>
        <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
      </div>
      {unread && <span className="pop" style={{ width: 19, height: 19, borderRadius: 10, background: T.brand, color: "#FFFDF9", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{unread}</span>}
    </div>
  );

  const sendSticker = (id) => {
    const msg = { id: Date.now(), from: "vy", type: "sticker", st: id };
    if (screen === "family") setFamMsgs((x) => [...x, msg]);
    else if (screen === "ongba") setOngMsgs((x) => [...x, msg]);
    else if (screen === "winplus") setWpMsgs((x) => [...x, msg]);
    else setMaiMsgs((x) => [...x, msg]);
    setTray(false); ding(); bump();
  };

  const inputBar = (onSend, ph, withCam, withMic) => (
    <>
      {tray && (
        <div className="rise" style={{ flexShrink: 0, borderTop: `1px solid ${T.hair}`, background: T.bg, padding: "12px 12px 10px" }}>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
            {STICKERS.map((s) => (
              <button key={s.id} onClick={() => sendSticker(s.id)} className="btn press" style={{ background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 16, padding: "8px 8px 6px", flexShrink: 0, width: 84 }}>
                <span style={{ width: 66, height: 66, display: "block", margin: "0 auto" }}><s.D /></span>
                <span style={{ display: "block", fontSize: 11, color: T.sub, fontWeight: 600, marginTop: 4, whiteSpace: "nowrap" }}>{s.n}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    <div style={{ padding: "10px 12px calc(10px + env(safe-area-inset-bottom))", background: T.surf, borderTop: `1px solid ${T.hair}`, display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
      {withCam && <HBtn Icon={Camera} onTap={snap} />}
      {withMic && (
        <button onClick={startMic} className="btn" style={{ border: `1px solid ${mic ? "transparent" : T.hair}`, background: mic ? `linear-gradient(145deg,#E8825A,${T.brand})` : T.surf, borderRadius: mic ? "46% 54% 52% 48%" : 999, width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: mic ? `0 0 0 5px ${T.brandSoft}` : "none" }}>
          <Mic size={16} color={mic ? "#FFFDF9" : T.sub} className={mic ? "blob" : ""} />
        </button>
      )}
      {/* 16px là ngưỡng Safari iOS ngừng tự phóng to khi focus, nên bỏ được
          maximum-scale trong index.html mà ô nhập vẫn không giật. */}
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSend()} placeholder={mic ? "Mai đang nghe anh nói…" : ph}
        style={{ flex: 1, border: `1px solid ${T.hair}`, borderRadius: 999, padding: "12px 16px", fontSize: 16, fontFamily: FONT, outline: "none", background: T.bg, color: T.ink, minWidth: 0 }} />
      {/* Nút gửi kiểu iOS Messages: mờ và co lại khi chưa có chữ, nhưng vùng
          chạm vẫn đủ 44px nhờ lớp bọc, không phải nhờ phóng to hình. */}
      <button onClick={() => setTray((v) => !v)} className="btn press" style={{ border: `1px solid ${tray ? T.brand : T.hair}`, background: tray ? T.brandSoft : T.surf, borderRadius: 999, width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} title="Sticker">
        <span style={{ width: 23, height: 23, display: "block" }}><StkLove /></span>
      </button>
      <span style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: "-3px -3px -3px 0" }}>
        <button onClick={onSend} disabled={!input.trim()} className="btn" style={{ background: input.trim() ? T.brand : "#E4DCCE", color: "#FFFDF9", borderRadius: 999, width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: input.trim() ? "var(--e-brand)" : "none", transform: input.trim() ? "scale(1)" : "scale(.88)", opacity: input.trim() ? 1 : 0.75, cursor: input.trim() ? "pointer" : "default" }}>
          <ArrowUp size={17} strokeWidth={2.6} />
        </button>
      </span>
    </div>
    </>
  );

  const channel = (key, title, members) => (
    <>
      <Head back={() => setScreen("home")} title={title} sub={<span style={{ fontSize: 12, color: T.faint, ...num }}>{members}</span>} />
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
        {POSTS[key].map((p) => (
          <React.Fragment key={p.id}>
            <Post up={p.up} title={p.title} body={p.body} hero={p.hero} thumb={p.thumb} comments={p.comments.length}
              meta={{ who: p.who, when: p.when }} onTap={() => { setPost(p); ding(); }} onAuthor={() => { setProf(p.profile); ding(); }} />
            {p.act && <MaiBanner text={p.act.text} cta={p.act.cta} done={!!done[p.act.flow]} doneText={{ cart: "Đã đặt · Supra giao trước " + (done.cartSlot || "18:00"), ticket: "Mai đang canh · nhắc 19:55 ngày 08/08", resale: "Vé đã về tên anh · B12-13", inspect: "TT 50-07V · 7:30 12/08" }[p.act.flow]} onTap={() => openFlow(p.act.flow)} />}
          </React.Fragment>
        ))}
        <div style={{ padding: "12px 2px 4px", fontSize: 11.5, color: T.faint, lineHeight: 1.55 }}>Kênh mở · mọi người đăng đều định danh CCCD · chạm tên người đăng để xem hồ sơ</div>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#171310", display: "flex", justifyContent: "center", fontFamily: FONT }}>
      <style>{`
        /* ————— token chuyển động · ba lò xo thay cho một rổ bezier —————
           Material 3 Expressive định nghĩa motion bằng độ cứng và độ tắt dần
           của lò xo. CSS làm được bằng linear(); trình duyệt cũ giữ dòng bezier
           đứng trước. Tay dùng --sp-tap, bề mặt dùng --sp-sheet, ăn mừng dùng --sp-cel. */
        :root{
          --sp-tap: cubic-bezier(.34,1.56,.64,1);
          --sp-tap: linear(0, 0.2089, 0.5647, 0.846, 1.0007, 1.0554, 1.055, 1.0353, 1.0158, 1.0032, 0.9976, 0.9965, 1);
          --sp-sheet: cubic-bezier(.32,.72,0,1);
          --sp-sheet: linear(0, 0.0521, 0.1668, 0.3021, 0.4352, 0.5547, 0.6562, 0.7393, 0.8052, 0.8565, 0.8956, 0.925, 0.9467, 0.9626, 0.9741, 0.9822, 0.988, 0.992, 1);
          --sp-cel: cubic-bezier(.34,1.7,.5,1);
          --sp-cel: linear(0, 0.1374, 0.432, 0.742, 0.9829, 1.1242, 1.1733, 1.1577, 1.1093, 1.0543, 1.0094, 0.9816, 0.9704, 0.9714, 0.9792, 0.9888, 0.9971, 1.0026, 1.005, 1.0051, 1.0039, 1.0022, 1);
          --out: cubic-bezier(.4,0,.2,1);
          --in-fast: cubic-bezier(.4,0,1,1);
          /* ————— độ sâu · bóng nhuộm ấm theo màu giấy, không phải xám trung tính ————— */
          --e1: 0 1px 1.5px rgba(74,52,34,.05), 0 2px 5px -1px rgba(74,52,34,.055);
          --e2: 0 1px 2px rgba(74,52,34,.05), 0 5px 12px -3px rgba(74,52,34,.075), 0 14px 30px -10px rgba(74,52,34,.085);
          --e3: inset 0 1px 0 rgba(255,255,255,.72), 0 -6px 20px -6px rgba(50,34,22,.10), 0 -20px 56px -14px rgba(50,34,22,.20);
          --e-brand: 0 1px 1.5px rgba(120,44,18,.22), 0 4px 10px -2px rgba(194,85,47,.30);
        }
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
        .phoneH{height:100vh;height:100dvh;max-height:940px}
        /* Nhấn xuống nhanh và tuyến tính, nhả ra theo lò xo: ngón tay mới
           cảm được điểm tiếp xúc. Đối xứng hai chiều thì không cảm thấy gì. */
        .btn{border:none;border-radius:11px;padding:9px 14px;font-weight:650;font-size:13px;font-family:${FONT};cursor:pointer;white-space:nowrap;transition:transform var(--sp-tap-d,250ms) var(--sp-tap),box-shadow .2s var(--out)}
        .btn:active{transform:scale(.94);transition:transform 90ms var(--in-fast)}
        .press{transition:transform var(--sp-tap-d,250ms) var(--sp-tap)}
        .press:active{transform:scale(.985);transition:transform 90ms var(--in-fast)}
        .dim{position:absolute;inset:0;background:rgba(36,31,26,.42);z-index:40;animation:fi .22s var(--out)}
        .sheet{position:absolute;left:0;right:0;bottom:0;z-index:50;background:${T.surf};border-radius:22px 22px 0 0;padding:14px 20px calc(24px + env(safe-area-inset-bottom));animation:up .46s var(--sp-sheet);box-shadow:var(--e3)}
        .scan{position:absolute;left:10%;right:10%;height:30%;top:0;background:linear-gradient(180deg,transparent,rgba(194,85,47,.5),transparent);animation:sc 1.1s ease-in-out infinite}
        .rise{animation:rise .4s var(--sp-sheet) both}
        .drop{animation:drop .46s var(--sp-sheet) both}
        .spin-soft{animation:pu .6s ease-in-out infinite}
        .wordmark{animation:wm .5s var(--sp-sheet) both}
        .pop{animation:pop .54s var(--sp-cel) both}
        .shim{background:linear-gradient(90deg,${T.hair} 8%,${T.brandSoft} 22%,${T.hair} 36%);background-size:280% 100%;animation:shim 1.25s linear infinite;border-radius:6px}
        .wordIn{display:inline-block;white-space:pre;animation:wordIn 380ms var(--sp-sheet) both;animation-delay:calc(var(--i) * 28ms)}
        @keyframes wordIn{from{opacity:0;filter:blur(3px);transform:translateY(2px)}to{opacity:1;filter:none;transform:none}}
        .blob{animation:blob 1.6s ease-in-out infinite}
        .breathe{animation:breathe 3.2s ease-in-out infinite}
        .sweep{position:relative;overflow:hidden}
        .sweep::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(27,122,78,.16),transparent);animation:sweep .7s ease-out 1 both}
        .bloom{position:absolute;left:50%;top:6px;width:220px;height:220px;margin-left:-110px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(27,122,78,.26),rgba(27,122,78,.10) 42%,transparent 68%);animation:bloom 900ms var(--sp-sheet) both}
        @keyframes bloom{0%{opacity:0;transform:scale(.35)}22%{opacity:1}100%{opacity:0;transform:scale(1.5)}}
        .ring{stroke-dasharray:91;stroke-dashoffset:91;animation:draw 520ms var(--sp-sheet) both}
        .tick{stroke-dasharray:23;stroke-dashoffset:23;animation:draw 400ms var(--sp-cel) both}
        @keyframes draw{to{stroke-dashoffset:0}}
        .chip{animation:chip .38s var(--sp-sheet, cubic-bezier(.22,1.2,.36,1)) both}
        @keyframes chip{from{opacity:0;transform:translateY(7px) scale(.94)}to{opacity:1;transform:none}}
        /* Vùng chạm 44px quanh nút nhỏ, không đổi kích thước hình. */
        .tap44{position:relative}
        .tap44::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px}
        .odo{display:inline-block;overflow:hidden;height:1.1em;vertical-align:top}
        .odoCol{display:flex;flex-direction:column;will-change:transform;transform:translateY(calc(var(--d) * -1.1em));transition:transform 620ms var(--sp-sheet);transition-delay:calc(var(--i) * 26ms)}
        ${SCENE_CSS}
        ${VIZ_CSS}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes up{from{transform:translateY(30px);opacity:.5}to{transform:none;opacity:1}}
        @keyframes drop{from{transform:translateY(-20px) scale(.96);opacity:0}to{transform:none;opacity:1}}
        @keyframes sc{0%,100%{transform:translateY(-8%)}50%{transform:translateY(200%)}}
        @keyframes rise{from{transform:translateY(9px) scale(.985);opacity:0}to{transform:none;opacity:1}}
        @keyframes pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
        @keyframes pu{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes wm{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes shim{from{background-position:140% 0}to{background-position:-140% 0}}
        @keyframes blob{0%,100%{border-radius:46% 54% 52% 48%;transform:scale(1)}33%{border-radius:58% 42% 44% 56%;transform:scale(1.1)}66%{border-radius:44% 56% 60% 40%;transform:scale(1.04)}}
        .tier-sheen{animation:sheen 3.4s cubic-bezier(.4,0,.2,1) .6s infinite}
        @keyframes sheen{0%{transform:translateX(0) skewX(-18deg)}42%,100%{transform:translateX(560px) skewX(-18deg)}}
        .stk-pop{animation:stkpop .42s cubic-bezier(.22,1.35,.4,1) both}
        @keyframes stkpop{0%{transform:scale(.5) translateY(10px);opacity:0}70%{transform:scale(1.06)}100%{transform:none;opacity:1}}
        .tier-flash{animation:tierup .7s cubic-bezier(.22,1.2,.36,1) both}
        @keyframes tierup{0%{transform:scale(.94) translateY(8px);opacity:0}60%{transform:scale(1.015)}100%{transform:none;opacity:1}}
        @keyframes breathe{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.06);opacity:1}}
        @keyframes sweep{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
                @media (prefers-reduced-motion:reduce){*{animation-duration:.001s !important}}
      `}</style>

      <div className="phoneH" style={{ width: "100%", maxWidth: 430, background: T.bg, position: "relative", overflow: "hidden" }}>
        <Boundary>
          <div key={screen} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", opacity: intro ? 0 : 1, transform: intro ? "scale(.985)" : "none", transition: "opacity .45s ease-out, transform .45s ease-out" }}>

            {screen === "home" && (
              <>
                <Head title="m.ai" sub={<ShieldCheck size={15} color={T.green} strokeWidth={2.2} />} right={<>
                  {visitedFamily ? (
                    <button onClick={() => openFlow("wallet")} className="btn press" style={{ display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${T.hair}`, background: T.bg, borderRadius: 999, padding: "7px 10px 7px 11px", flexShrink: 0 }}>
                      <Wallet size={13} color={T.brandInk} strokeWidth={2.2} />
                      <span style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 600, color: T.ink, ...num }}>{fmt(bal)}</span>
                      <ChevronRight size={13} color={T.faint} strokeWidth={2.4} />
                    </button>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 999, padding: "7px 12px", flexShrink: 0 }}>
                      <ShieldCheck size={15} color={T.green} strokeWidth={2.2} />
                      <span style={{ fontSize: 15, fontWeight: 650, color: T.green }}>Bản xem thử</span>
                    </span>
                  )}
                  <HBtn Icon={FolderClosed} onTap={() => { setFiles(true); ding(); }} ml />
                </>} />
                {/* Dải nhắc: hai điều quan trọng nhất, không tắt được, không trôi. */}
                <div onClick={() => setCover(true)} className="press" style={{ flexShrink: 0, height: 56, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", background: T.brandSoft, borderBottom: `1px solid ${T.hair}`, cursor: "pointer" }}>
                  <Logo size={20} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: T.brandInk }}>Đây là nhà anh Hải, mình xem thử.</div>
                    <div style={{ fontSize: 15, color: T.brandInk, opacity: 0.82, marginTop: 2, lineHeight: 1.35 }}>Bấm gì cũng không mất tiền thật.</div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.brandInk }}>Xem lại</span>
                    <ChevronRight size={15} color={T.brandInk} />
                  </span>
                </div>
                <div className="rise" onPointerDownCapture={() => { if (pointing) setPointing(false); }} style={{ flex: 1, overflowY: "auto" }}>
                  {/* Cảnh mở màn: Mai đã gom việc sẵn, chạm ngay tại đây,
                      không bắt anh đi tìm trong nhóm. */}
                  <div style={{ padding: "15px 14px 13px", background: T.surf, borderBottom: `1px solid ${T.hair}` }}>
                    <div onClick={() => setScreen("mai")} className="press" style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer" }}>
                      <Mark size={38} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: T.ink, letterSpacing: -0.3 }}>Chào anh Hải,</div>
                        <div style={{ fontSize: 14.5, color: T.sub, marginTop: 2 }}>{allDone ? "sạch việc rồi · Mai canh tiếp" : "2 việc gấp trước 17:00 · Mai lo phần còn lại"}</div>
                      </div>
                      {allDone || !visitedFamily ? <ChevronRight size={16} color={T.faint} /> : <Countdown minutes={78} total={480} size={44} />}
                    </div>
                  </div>
                  <div style={{ padding: "11px 14px 11px", background: T.surf, borderBottom: `1px solid ${T.hair}` }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 750, letterSpacing: 0.8, color: T.faint }}>MAI CÓ SẴN TRONG</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 2 }}>
                      {SURFACES.map((sf) => (
                        <button key={sf.id} onClick={() => { if (sf.app) setSurfApp(sf.app); openFlow(sf.flow); }} className="btn press"
                          style={{ background: "transparent", padding: 0, display: "block", textAlign: "center", flexShrink: 0, width: 60 }}>
                          <span style={{ width: 42, height: 42, borderRadius: 13, background: sf.c, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(60,45,30,.14)", border: sf.c === "#FFFFFF" ? `1px solid ${T.hair}` : "none", overflow: "hidden" }}>
                            {sf.img
                              ? <img src={sf.img} alt="" width={42 - sf.pad * 2} height={42 - sf.pad * 2} style={{ display: "block" }} />
                              : <sf.Dev s={22} />}
                          </span>
                          <div style={{ fontSize: 11.5, color: T.sub, marginTop: 5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sf.n}</div>
                          {done[sf.flow] && <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700 }}>✓</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ChatRow Icon={MessageCircle} tint={T.brandSoft} color={T.brand} title="Mai" sub="Hỏi gì cũng được · gõ hoặc nói" time="15:44" unread={seenMai ? null : "1"} onTap={() => { setSeenMai(true); setScreen("mai"); }} />
                  <div style={{ padding: "12px 14px 5px", fontSize: 11, fontWeight: 750, letterSpacing: 0.8, color: T.faint }}>NHÓM</div>
                  {pointing && (
                    <div style={{ display: "inline-flex", alignItems: "center", marginLeft: 14, marginBottom: 7, background: T.dark, color: "#FBF7F1", borderRadius: 12, padding: "9px 13px", boxShadow: "var(--e1, 0 2px 10px rgba(60,45,30,.14))", position: "relative" }}>
                      <span style={{ fontSize: 16.5, fontWeight: 650 }}>Nhóm nhà anh Hải</span>
                      <span style={{ fontSize: 16.5, opacity: 0.78 }}>&nbsp;· chạm thử</span>
                      <span style={{ position: "absolute", bottom: -7, left: 18, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `7px solid ${T.dark}` }} />
                    </div>
                  )}
                  <div style={{ position: "relative" }}>
                    <ChatRow avatar="Nhà mình" letter="N" title="Nhà mình" verified sub={allDone ? "Mai: xong sớm trước hạn" : "Vy: đừng lo vụ đón Bin nha"} time="15:38" onTap={() => { setVisitedFamily(true); setPointing(false); setScreen("family"); }} />
                    {pointing && <div className="sn-ring" style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: `inset 0 0 0 2px ${T.brand}` }} />}
                  </div>
                  <ChatRow avatar="Ông bà cô chú" letter="Ô" title="Ông bà & cô chú" verified sub="Bà: cuối tuần về ăn giỗ nha con" time="12:02" onTap={() => setScreen("ongba")} />
                  <ChatRow Icon={Store} tint="#FDE7E5" color="#E8342C" title="Win+ Hai Bà Trưng" verified sub={done.hold ? "Mai: chị My đã chừa 1 khay bò nạm" : "Mai lọc 47 tin, giữ lại 1 tin hợp bếp"} time="08:21" unread={done.hold ? null : "1"} onTap={() => setScreen("winplus")} />
                  <div style={{ padding: "12px 14px 5px", fontSize: 11, fontWeight: 750, letterSpacing: 0.8, color: T.faint }}>KÊNH</div>
                  <ChatRow Icon={Music} tint="#F4EBFF" color="#7A2ECC" title="Anh Trai Say Hi" sub="Tập cuối tối nay 20:00 · ▲2,1k" time="15:33" onTap={() => setScreen("atsh")} />
                  <ChatRow Icon={Car} tint={T.amberBg} color={T.amber} title="Vietnam Cars" sub="Đăng kiểm Q2: sáng thứ Ba vắng nhất · ▲214" time="15:10" onTap={() => setScreen("cars")} />
                  <ChatRow Icon={Hash} tint={T.greenBg} color={T.green} title="Cơm tối 30 phút" sub="Bò kho nồi áp suất · ▲462" time="14:30" onTap={() => setScreen("com")} />
                  {/* Ba việc Mai giữ hộ: tiền, chợ, giấy tờ. Mỗi dòng mở một luồng thật. */}
                  <div style={{ padding: "12px 14px 5px", fontSize: 11, fontWeight: 750, letterSpacing: 0.8, color: T.faint }}>MAI LO GIÚP ANH</div>
                  <div onClick={() => openFlow("wallet")} className="press" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: T.surf, borderTop: `1px solid ${T.hair}`, cursor: "pointer" }}>
                    <IconSq Icon={Wallet} size={40} tint={T.brandSoft} color={T.brand} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 650, fontSize: 15, color: T.ink }}>Ví WinMoney</div>
                      <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2, ...num }}>{fmt(bal)} · {done.wallet ? "Mai tự trả dưới trần anh đặt" : "đặt trần chi tiêu cho Mai"}</div>
                    </div>
                    {done.wallet ? <Pill tone="green"><Check size={11} strokeWidth={3} /> Đã đặt trần</Pill> : <ChevronRight size={16} color={T.faint} />}
                  </div>
                  <div onClick={() => openFlow("cart")} className="press" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: T.surf, borderTop: `1px solid ${T.hair}`, cursor: "pointer" }}>
                    <IconSq Icon={ShoppingCart} size={40} tint={T.greenBg} color={T.green} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 650, fontSize: 15, color: T.ink }}>Đi chợ · WinMart+</div>
                      <div style={{ fontSize: 12.5, color: done.cart ? T.green : T.sub, marginTop: 2, fontWeight: done.cart ? 650 : 400 }}>{done.cart ? "Đã đặt · Supra giao trước " + (done.cartSlot || "18:00") + (done.cartCod ? " · trả tiền mặt" : "") : "Bò kho tối nay · 5 món · Supra giao"}</div>
                    </div>
                    {done.cart ? <Pill tone="green"><Check size={11} strokeWidth={3} /> Xong</Pill> : <span style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 600, color: T.ink, ...num }}>{fmt(186000)}</span>}
                  </div>
                  <div onClick={() => { setFiles(true); ding(); }} className="press" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: T.surf, borderTop: `1px solid ${T.hair}`, borderBottom: `1px solid ${T.hair}`, cursor: "pointer" }}>
                    <IconSq Icon={FolderClosed} size={40} tint="#F1EBE1" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 650, fontSize: 15, color: T.ink }}>Hồ sơ nhà mình</div>
                      <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>6 mục · 1 việc cần để ý</div>
                    </div>
                    <Pill tone="amber">đăng kiểm 37 ngày</Pill>
                  </div>
                </div>
              </>
            )}

            {screen === "family" && (
              <>
                <Head back={() => setScreen("home")} title="Nhà mình"
                  sub={<><ShieldCheck size={15} color={T.green} strokeWidth={2.2} /><span style={{ fontSize: 12, color: T.faint, ...num }}>15:42</span></>}
                  right={<><HBtn Icon={FolderClosed} onTap={() => { setFiles(true); ding(); }} /><HBtn Icon={Phone} onTap={() => openFlow("call")} ml /></>} />
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 6px" }}>
                  {/* Giống dòng ngày tháng trong Zalo — đọc lướt qua là hiểu đang xem nhà ai. */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 12px" }}>
                    <span style={{ height: 1, flex: 1, background: T.hair }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: T.sub, whiteSpace: "nowrap" }}>Nhà anh Hải · bản xem thử</span>
                    <span style={{ height: 1, flex: 1, background: T.hair }} />
                  </div>
                  <Msg m={{ from: "w", name: "Vy", text: "Anh ơi em thấy anh còn họp, đừng lo vụ đón Bin nha" }} />
                  <CardBox style={{ margin: "8px 0" }}>
                    {/* Sự gấp gáp nằm ngay trên thẻ việc, không cần một cái
                        băng nổi che mất đầu màn hình. */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: `1px solid ${T.hair}` }}>
                      {!allDone && <Countdown minutes={78} total={480} size={34} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 750, letterSpacing: 0.6, color: T.sub }}>TRƯỚC 17:00</div>
                        {!allDone && <div style={{ fontSize: 12, color: T.amber, fontWeight: 650, marginTop: 2, ...num }}>Chưa chốt ai đón Bin</div>}
                      </div>
                      <span style={{ fontSize: 11.5, color: T.faint }}>chỉ mình anh thấy</span>
                    </div>
                    <Row Icon={Banknote} iconTint={T.amberBg} iconColor={T.amber} title="Học bơi · Bin" amount={fmt(850000)}
                      meta="Cô nhắc lần 2 · 14/32 đã đóng" metaTone="amber" pill={<Pill tone="amber">hạn 17:00</Pill>} cta="Trả"
                      done={done.pay ? "Đã trả" : null} doneMeta="Trả 15:43 · biên lai đã gửi riêng cô Lan" onTap={() => openFlow("pay")} />
                    <Row Icon={Car} iconTint={T.amberBg} iconColor={T.amber} title="Đón Bin 16:30 · còn 48 phút"
                      quote="em đón được, anh họp đi 👍" quoteWho="Vy · 15:38" meta="Họp của anh kéo tới 17:00" metaTone="amber" cta="Chốt"
                      done={done.pick ? "Đã chốt" : null} doneMeta="Vy đón 16:20 · đã vào lịch 2 người" onTap={() => openFlow("pickup")} />
                    <Row Icon={FileText} title="Đơn dã ngoại · Na" meta="Email THCS Trần Phú · hạn 08/08" cta="Ký"
                      done={done.form ? "Đã gửi" : null} doneMeta="Cô Hồng đã nhận · lưu hồ sơ Na" onTap={() => openFlow("form")} last />
                  </CardBox>
                  {allDone && (
                    <>
                      <Burst />
                      <div className="pop" style={{ position: "relative", margin: "12px 0 4px", background: T.greenBg, border: "1px solid #CFE7DA", borderRadius: 20, padding: "16px 16px 15px", boxShadow: "var(--e2)" }}>
                        <StrokeCheck size={30} color="#14603C" />
                        <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 600, color: "#14603C", letterSpacing: -0.4, marginTop: 9 }}>Xong sớm trước hạn</div>
                        <div style={{ fontSize: 13.5, color: "#2C6B4C", lineHeight: 1.5, marginTop: 5, ...num }}>15:46 · suýt trễ tiền học và suýt không ai đón Bin, giờ xong cả rồi.</div>
                        <div style={{ display: "flex", gap: 14, marginTop: 13, paddingTop: 12, borderTop: "1px solid #CFE7DA" }}>
                          {[["Đã trả", fmt(850000)], ["Đón Bin", "16:20 · Vy"], ["Đơn Na", "đã gửi"]].map(([k, v]) => (
                            <div key={k} style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 9.5, fontWeight: 750, letterSpacing: 0.5, color: "#5C8A72" }}>{k.toUpperCase()}</div>
                              <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 13, color: "#14603C", marginTop: 3, ...num }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {evt >= 1 && <Msg m={{ type: "ext", src: "Zalo · Vy chuyển tiếp · nhóm 3A", time: "15:44", text: "Cô Lan: Chiều mai lớp nghỉ, giáo viên họp." }} />}
                  {evt >= 2 && <Msg m={{ type: "act", done: undone, text: undone ? "Đã giữ lịch cũ" : "Dời bơi Bin sang 07/08 lúc 17:00 · đã báo Vy · đã xem ✓", undo: () => { setUndone(true); ding(); }, undoLabel: "Giữ lịch cũ" }} />}
                  {cam === 1 && <div className="rise" style={{ display: "flex", gap: 7, alignItems: "center", padding: "6px 2px", fontSize: 12.5, color: T.sub }}><Camera size={13} /> Mai đang đọc giấy báo…</div>}
                  {cam === 2 && (
                    <>
                      <Msg m={{ type: "ext", color: "#7A5CB8", Icon: Camera, src: "Ảnh giấy báo · từ cặp sách Na", time: "15:47", text: "THCS Trần Phú: Họp phụ huynh 19:00 15/08, phòng A2." }} />
                      <Msg m={{ type: "act", done: camUndone, text: camUndone ? "Đã xóa khỏi lịch" : "Đã vào lịch anh & Vy · nhắc trước 1 ngày", undo: () => { setCamUndone(true); ding(); }, undoLabel: "Xóa khỏi lịch" }} />
                    </>
                  )}
                  {famMsgs.map((m) => <Msg key={m.id} m={m} />)}
                  <div ref={endRef} />
                </div>
                {inputBar(sendFam, "Nhắn cả nhà…", true, false)}
              </>
            )}

            {screen === "ongba" && (
              <>
                <Head back={() => setScreen("home")} title="Ông bà & cô chú" sub={<><ShieldCheck size={15} color={T.green} strokeWidth={2.2} /><span style={{ fontSize: 12, color: T.faint }}>8 người thật</span></>} />
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 6px" }}>
                  <Msg m={{ from: "w", name: "Bà", text: "Cuối tuần về ăn giỗ nha các con 🙏" }} />
                  <Msg m={{ from: "w", name: "Cô Út", text: "Dạ con đặt xe rồi má ơi" }} />
                  <MaiBanner thumb={{ from: "#1E6B4F", to: "#0C3A28", emoji: "🍵" }} text="Giỗ Ông 09/08 · Bà thích trà sen · hộp quà Phúc Long 165.000đ" cta="Xem"
                    done={!!done.tea} doneText="Hộp trà sen Phúc Long · Supra giao 08/08" onTap={() => { setDone((d) => ({ ...d, tea: true })); ding(true); }} />
                  {ongMsgs.map((m) => <Msg key={m.id} m={m} />)}
                  <div ref={endRef} />
                </div>
                {inputBar(sendOng, "Nhắn ông bà cô chú…", false, false)}
              </>
            )}

            {screen === "winplus" && (
              <>
                <Head back={() => setScreen("home")} title="Win+ Hai Bà Trưng"
                  sub={<><BadgeCheck size={15} color="#E8342C" strokeWidth={2.2} /><span style={{ fontSize: 12, color: T.faint, ...num }}>498 thành viên</span></>} />
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 6px" }}>
                  {/* Ghim thật của nhóm ngoài đời — cũng là lý do Mai có việc ở đây. */}
                  <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#FFF8EC", border: "1px solid #F0D8B0", borderRadius: 14, padding: "10px 12px", marginBottom: 12 }}>
                    <Bell size={15} color={T.amber} strokeWidth={2.2} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: T.ink, lineHeight: 1.45 }}>Ghim: đừng rời nhóm, hãy tắt thông báo</span>
                  </div>

                  <Msg m={{ from: "w", name: "chị My · nhân viên quầy tươi", text: "Sáng nay cửa hàng em còn ít khay thịt giảm giá, khách ăn gì nhắn em chừa nha" }} />
                  <div style={{ margin: "2px 0 10px" }}><TrayGrid onTap={(x) => { setHoldTray(x); openFlow("hold"); }} /></div>
                  <div style={{ fontSize: 14, color: T.sub, margin: "0 0 12px 2px", ...num }}>08:21 · chạm khay nào cũng được, Mai nhắn chị My chừa giúp</div>

                  <Msg m={{ type: "ext", color: "#E8342C", Icon: BadgeCheck, src: "Hội viên WinX · tin cửa hàng", time: "07:00",
                    text: "Ngày 08/08 WinMart+ ưu đãi lớn cho hội viên WinX. Quét thẻ ở quầy là được giá hội viên, không cần phiếu giấy." }} />
                  <Msg m={{ from: "w", name: "cô Bảy", text: "Chừa tui 2 khay ba rọi nghen My 😀" }} />
                  <Msg m={{ from: "w", name: "chị My · nhân viên quầy tươi", text: "Dạ rồi cô Bảy ơi, em ghi rồi ạ" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "2px 0 12px 46px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 999, padding: "3px 9px", fontSize: 12.5 }}>❤️ 4</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: T.surf, border: `1px solid ${T.hair}`, borderRadius: 999, padding: "3px 9px", fontSize: 12.5 }}>👍 7</span>
                  </div>

                  {/* Bình chọn — nhóm cộng đồng Zalo nào cũng có một cái đang chạy. */}
                  <CardBox style={{ margin: "2px 0 10px", padding: "12px 13px" }}>
                    <div style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.5 }}>BÌNH CHỌN · CỬA HÀNG HỎI</div>
                    <div style={{ fontSize: 14.5, fontWeight: 650, color: T.ink, marginTop: 4, marginBottom: 9 }}>Tuần sau cô chú muốn cửa hàng gom món gì?</div>
                    {[["Cá đồng miền Tây", 58], ["Rau Đà Lạt", 31], ["Trái cây theo mùa", 11]].map(([lb, pc]) => (
                      <div key={lb} style={{ marginBottom: 7 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: T.ink, marginBottom: 3 }}><span>{lb}</span><span style={{ color: T.sub, ...num }}>{pc}%</span></div>
                        <div style={{ height: 6, borderRadius: 3, background: "#EDE6DA", overflow: "hidden" }}><div style={{ width: pc + "%", height: "100%", background: T.brand, borderRadius: 3 }} /></div>
                      </div>
                    ))}
                    <div style={{ fontSize: 12.5, color: T.faint, marginTop: 6, ...num }}>91 người đã chọn · còn 2 ngày</div>
                  </CardBox>

                  <Msg m={{ from: "w", name: "anh Dũng", text: "Nhà mình tối qua kho cốt lết mua ở đây, con nít ăn hết nồi 🍚" }} />
                  <Msg m={{ from: "w", name: "cô Tư", text: "Loto show tối thứ Bảy ở sân cửa hàng còn chỗ hông em?" }} />
                  <Msg m={{ from: "w", name: "chị My · nhân viên quầy tươi", text: "Dạ còn cô ơi, cô ghé sớm 19:00 giữ chỗ nha" }} />

                  <MaiBanner text="498 người, 47 tin sáng nay. Mai giữ lại 1 tin: sườn non còn 2 khay, 62.000đ thay vì 96.000đ. Kho được, mà rẻ hơn miếng bò trong giỏ."
                    cta="Xem" done={!!done.hold} doneText="Chị My đã chừa hàng · nhắn riêng, không đăng nhóm" onTap={() => { setHoldTray(null); openFlow("hold"); }} />
                  {wpMsgs.map((m) => <Msg key={m.id} m={m} />)}
                  <div ref={endRef} />
                </div>
                {inputBar(sendWp, "Nhắn nhóm cửa hàng…", false, false)}
              </>
            )}

            {screen === "mai" && (
              <>
                <Head back={() => setScreen("home")} title="Mai" sub={<span style={{ fontSize: 12, color: T.faint }}>chỉ anh Hải và Mai · không gửi ra ngoài</span>} />
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 6px" }}>
                  {maiMsgs.map((m) => <Msg key={m.id} m={m} />)}
                  {busy && <Thinking />}
                  <div ref={endRef} />
                </div>
                {/* thanh gợi ý xếp lại sau mỗi câu trả lời, nằm ngay trên
                    ngón cái, để anh đi hết demo mà không cần gõ */}
                <ChipRail items={chips} seed={chips.join("|")} onPick={(c) => !busy && askMai(c)} />
                {inputBar(sendMai, "Hỏi Mai gì cũng được…", false, true)}
              </>
            )}

            {screen === "atsh" && channel("atsh", "Anh Trai Say Hi", "214k thành viên · mặt thật")}
            {screen === "cars" && channel("cars", "Vietnam Cars", "12,4k thành viên · mặt thật")}
            {screen === "com" && channel("com", "Cơm tối 30 phút", "8,1k thành viên")}
          </div>

          {files && (
            <Sheet onClose={() => setFiles(false)} tall>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <button onClick={() => setFiles(false)} className="btn" style={{ background: "#F1EBE1", padding: 7, borderRadius: 999, display: "flex" }}><X size={15} color={T.sub} /></button>
                <span style={{ fontSize: 11, fontWeight: 750, color: T.faint, letterSpacing: 0.6 }}>HỒ SƠ NHÀ MÌNH</span>
              </div>
              <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 10, lineHeight: 1.5 }}>Mọi cửa đều ghi về đây: bàn phím trong Zalo, nút chia sẻ của điện thoại, loa nhà Bà, đồng hồ, xe. Chạm từng mục để xem nguồn.</div>
              {FILES.map((f) => (
                <div key={f.id} onClick={() => { setFile(f); ding(); }} className="press" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.hair}`, cursor: "pointer" }}>
                  <IconSq Icon={f.Icon} tint={f.tone === "amber" ? T.amberBg : f.tone === "green" ? T.greenBg : "#F1EBE1"} color={f.tone === "amber" ? T.amber : f.tone === "green" ? T.green : T.sub} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 650, fontSize: 14, color: T.ink }}>{f.t}</div>
                    {f.warn && <div style={{ fontSize: 11.5, color: T.amber, fontWeight: 650, marginTop: 2 }}>{f.warn}</div>}
                  </div>
                  <span style={{ fontSize: 12.5, color: f.tone === "amber" ? T.amber : T.sub, fontWeight: 600, ...num }}>{f.v}</span>
                  <ChevronRight size={15} color={T.faint} />
                </div>
              ))}
            </Sheet>
          )}

          {file && <FileSheet f={file} onClose={() => setFile(null)} onFlow={(id) => { setFile(null); openFlow(id); }} onGoto={(s) => { setFile(null); setFiles(false); setScreen(s); }} onAsk={(q) => { setFile(null); setFiles(false); askMai(q); }} />}
          {post && <PostSheet post={post} onClose={() => setPost(null)} onAuthor={() => { setProf(post.profile); }} onAct={() => post.act && openFlow(post.act.flow)} />}
          {prof && <ProfileSheet p={prof} onClose={() => setProf(null)} />}
          {flow && <Wizard title={TITLES[flow]} steps={FLOWS[flow]()} ctx={{ bal }} onClose={() => setFlow(null)} />}
          {cover && <Cover onClose={closeCover} />}
          {intro && <Intro onDone={() => setIntro(false)} />}
        </Boundary>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// MOUNT (added for standalone web build)
// ————————————————————————————————————————————————————————————
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")).render(<MaiV18 />);
