import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Store } from '../types';
import { Download, Printer, Copy, Check, Sparkles, ExternalLink, RefreshCw, ZoomIn, ZoomOut, Wifi } from 'lucide-react';
import { StoreAwningIcon } from './BrandLogo';

interface QrStandGeneratorProps {
  store: Store;
  onOpenCustomerView: () => void;
}

export const QrStandGenerator: React.FC<QrStandGeneratorProps> = ({ store, onOpenCustomerView }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [customLocality, setCustomLocality] = useState(store.locality);
  const [customTitle, setCustomTitle] = useState(store.name);
  const standRef = useRef<HTMLDivElement>(null);

  // Review URL pointing to the customer interactive review portal
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const customerReviewUrl = `${origin}/#review?storeId=${store.id}&slug=${store.slug}`;

  useEffect(() => {
    setCustomTitle(store.name);
    setCustomLocality(store.locality);
  }, [store]);

  // Generate QR Code with high error correction to allow center logo
  useEffect(() => {
    async function generateCustomQR() {
      try {
        const url = await QRCode.toDataURL(customerReviewUrl, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 600,
          color: {
            dark: '#1E40AF', // Deep Google Blue for QR modules
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR Code', err);
      }
    }
    generateCustomQR();
  }, [customerReviewUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerReviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // High-Resolution 300-DPI Canvas Rendering (1200 x 1800 pixels for 4" x 6" standard print)
  const handleDownloadImage = async (format: 'jpeg' | 'png' = 'jpeg') => {
    setIsGeneratingDownload(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 4" x 6" at 300 DPI = 1200 x 1800 px
      canvas.width = 1200;
      canvas.height = 1800;

      // 1. Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer Rounded Border (Google Blue)
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#2563EB';
      ctx.beginPath();
      ctx.roundRect(40, 40, canvas.width - 80, canvas.height - 80, 48);
      ctx.stroke();

      // Inner subtle frame
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.roundRect(48, 48, canvas.width - 96, canvas.height - 96, 44);
      ctx.stroke();

      // Top Awning Icon (Draw clean vectorized representation onto Canvas)
      const centerX = canvas.width / 2;
      const topY = 160;

      // Awning base
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.roundRect(centerX - 80, topY, 160, 140, 36);
      ctx.fill();

      // Awning stripes
      const stripeColors = ['#2563EB', '#EA4335', '#FBBC05', '#34A853'];
      const stripeW = 40;
      stripeColors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(centerX - 80 + i * stripeW, topY - 24, stripeW, 64, [16, 16, 20, 20]);
        ctx.fill();
      });

      // Star in center
      drawStar(ctx, centerX, topY + 74, 5, 34, 16, '#FDE047', '#EAB308');

      // Top Right NFC Badge
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(canvas.width - 240, 100, 140, 80, 20);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NFC', canvas.width - 170, 155);

      // NFC Waves icon indicator
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(canvas.width - 170, 126, 12, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(canvas.width - 170, 126, 18, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();

      // ReviewMyStore.AI Brand Header
      ctx.font = '900 68px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';

      // Multi-color header
      const brandParts = [
        { text: 'Review', color: '#4285F4' },
        { text: 'My', color: '#EA4335' },
        { text: 'Store', color: '#FBBC05' },
        { text: '.AI', color: '#34A853' }
      ];
      
      const fullTextW = brandParts.reduce((acc, p) => acc + ctx.measureText(p.text).width, 0);
      let currX = centerX - fullTextW / 2;

      brandParts.forEach((part) => {
        ctx.fillStyle = part.color;
        ctx.textAlign = 'left';
        ctx.fillText(part.text, currX, 390);
        currX += ctx.measureText(part.text).width;
      });

      // Business Name
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(customTitle || store.name, centerX, 475);

      // Locality
      ctx.fillStyle = '#475569';
      ctx.font = '500 38px system-ui, -apple-system, sans-serif';
      ctx.fillText(customLocality || store.locality, centerX, 535);

      // QR Code Box
      const qrSize = 680;
      const qrY = 580;
      const qrX = centerX - qrSize / 2;

      // Draw red corner targets
      ctx.fillStyle = '#EA4335';
      const cornerBox = 140;
      // Top-Left corner accent
      ctx.fillRect(qrX - 12, qrY - 12, cornerBox, cornerBox);
      // Top-Right corner accent
      ctx.fillRect(qrX + qrSize - cornerBox + 12, qrY - 12, cornerBox, cornerBox);
      // Bottom-Left corner accent
      ctx.fillRect(qrX - 12, qrY + qrSize - cornerBox + 12, cornerBox, cornerBox);

      // White padding for QR
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);

      // QR Image
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = resolve;
        });
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      }

      // Google Center Logo Emblem
      const emblemSize = 130;
      const emblemX = centerX - emblemSize / 2;
      const emblemY = qrY + qrSize / 2 - emblemSize / 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX, qrY + qrSize / 2, emblemSize / 2 + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      // Multi-colored Google G Icon
      drawGoogleG(ctx, centerX, qrY + qrSize / 2, 44);

      // Tagline Divider
      const divY = 1360;
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(180, divY);
      ctx.lineTo(canvas.width - 180, divY);
      ctx.stroke();

      // Diamonds on sides
      drawDiamond(ctx, 180, divY, 8, '#64748B');
      drawDiamond(ctx, canvas.width - 180, divY, 8, '#64748B');

      // Tagline Text
      ctx.fillStyle = '#475569';
      ctx.font = '600 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      // Erase line under text
      const tagText = 'The AI-Powered Google Review Platform';
      const tagW = ctx.measureText(tagText).width + 30;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(centerX - tagW / 2, divY - 20, tagW, 40);
      ctx.fillStyle = '#475569';
      ctx.fillText(tagText, centerX, divY + 8);

      // Google 4-Color Signature Bar
      const barY = 1430;
      const barH = 26;
      const barTotalW = canvas.width - 160;
      const barSegmentW = barTotalW / 4;
      const barColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

      barColors.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        const startX = 80 + idx * barSegmentW;
        if (idx === 0) {
          ctx.roundRect(startX, barY, barSegmentW, barH, [8, 0, 0, 8]);
        } else if (idx === 3) {
          ctx.roundRect(startX, barY, barSegmentW, barH, [0, 8, 8, 0]);
        } else {
          ctx.fillRect(startX, barY, barSegmentW, barH);
        }
        ctx.fill();
      });

      // Bottom CTA
      ctx.font = '600 40px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';

      // Draw "Tap or Scan with mobile to Review on " + Google in colors
      const prefixText = 'Tap or Scan with mobile to Review on ';
      const gLetters = [
        { char: 'G', color: '#4285F4' },
        { char: 'o', color: '#EA4335' },
        { char: 'o', color: '#FBBC05' },
        { char: 'g', color: '#4285F4' },
        { char: 'l', color: '#34A853' },
        { char: 'e', color: '#EA4335' }
      ];

      const prefixW = ctx.measureText(prefixText).width;
      const gTotalW = gLetters.reduce((acc, l) => acc + ctx.measureText(l.char).width, 0);
      const totalCtaW = prefixW + gTotalW;

      let startCtaX = centerX - totalCtaW / 2;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(prefixText, startCtaX, 1540);

      startCtaX += prefixW;
      gLetters.forEach((l) => {
        ctx.fillStyle = l.color;
        ctx.fillText(l.char, startCtaX, 1540);
        startCtaX += ctx.measureText(l.char).width;
      });

      // Export as Blob
      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUri = canvas.toDataURL(mime, 0.96);
      const link = document.createElement('a');
      link.download = `${store.name.replace(/[^a-zA-Z0-9]/g, '_')}_6x4_Google_Review_Stand.${format}`;
      link.href = dataUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error rendering high-res print canvas', err);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  return (
    <div className="space-y-6" id="qr-stand-section">
      {/* Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Standard 6" × 4" NFC & QR Sticker Stand
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Table Stand & NFC Review Plaque
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Download print-ready 300 DPI files for acrylic counter stands, table tents, and NFC stickers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-sm active:scale-95"
            id="copy-unique-review-url-btn"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            {copied ? 'Review Link Copied!' : 'Copy Review Link'}
          </button>

          <button
            onClick={onOpenCustomerView}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            Live Customer Portal
          </button>

          <button
            onClick={() => handleDownloadImage('jpeg')}
            disabled={isGeneratingDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
            id="download-stand-jpeg-btn"
          >
            {isGeneratingDownload ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download 6"×4" JPEG (300 DPI)
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print
          </button>
        </div>
      </div>

      {/* Grid: Preview & Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customization Settings Sidebar */}
        <div className="lg:col-span-5 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
            Sticker & Stand Customizer
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Display Store Name
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Cafe UrbanBite"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Locality / Subtitle
              </label>
              <input
                type="text"
                value={customLocality}
                onChange={(e) => setCustomLocality(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Edappally, Kochi"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Aspect Ratio:</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">6" Height × 4" Width (2:3)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Print Resolution:</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">1200 × 1800 px (300 DPI)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">NFC Capability:</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Wifi className="w-3.5 h-3.5" /> Ready for NTAG213/215
                </span>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-semibold">💡 Printing Recommendation:</p>
              <p className="text-amber-700 dark:text-amber-400">
                Print on 300 GSM glossy cardstock for clear acrylic stands, or waterproof vinyl for tabletop stickers.
              </p>
            </div>
          </div>
        </div>

        {/* Live Stand Graphic Display */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3 self-end text-xs text-slate-500">
            <span>Preview Scale:</span>
            <button
              onClick={() => setZoomLevel(Math.max(0.75, zoomLevel - 0.1))}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(1.25, zoomLevel + 0.1))}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stand Container (Strict 4:6 Aspect Ratio Styled Template) */}
          <div
            ref={standRef}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              width: '380px',
              height: '570px',
            }}
            className="relative bg-white rounded-[28px] border-[5px] border-[#2563EB] shadow-2xl p-6 flex flex-col justify-between select-none overflow-hidden transition-transform"
            id="printable-stand-element"
          >
            {/* Top Row: Awning Icon & NFC Badge */}
            <div className="flex items-start justify-between">
              {/* Left Awning Logo */}
              <div className="pt-1">
                <StoreAwningIcon size={64} />
              </div>

              {/* Right NFC Tag Pill */}
              <div className="bg-slate-950 text-white px-3.5 py-2 rounded-xl flex flex-col items-center shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center">
                    <Wifi className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[11px] font-black tracking-wider">NFC</span>
                </div>
              </div>
            </div>

            {/* Brand Title: ReviewMyStore.AI */}
            <div className="text-center -mt-1">
              <div className="text-[28px] font-black tracking-tight leading-none" style={{ fontFamily: 'system-ui, sans-serif' }}>
                <span className="text-[#4285F4]">Review</span>
                <span className="text-[#EA4335]">My</span>
                <span className="text-[#FBBC05]">Store</span>
                <span className="text-[#34A853]">.AI</span>
              </div>
              <h1 className="text-[22px] font-extrabold text-slate-950 mt-1 leading-tight tracking-tight">
                {customTitle || store.name}
              </h1>
              <p className="text-[14px] font-semibold text-slate-700 leading-snug">
                {customLocality || store.locality}
              </p>
            </div>

            {/* QR Code Container with Google Center Emblem */}
            <div className="relative mx-auto my-1 flex items-center justify-center">
              {/* Outer corner colored markers */}
              <div className="absolute inset-0 border-2 border-slate-100 rounded-2xl pointer-events-none"></div>

              {qrDataUrl ? (
                <div className="relative p-2 bg-white rounded-2xl shadow-inner">
                  {/* Red corner highlights */}
                  <div className="absolute top-1 left-1 w-8 h-8 border-t-4 border-l-4 border-[#EA4335] rounded-tl-lg pointer-events-none"></div>
                  <div className="absolute top-1 right-1 w-8 h-8 border-t-4 border-r-4 border-[#EA4335] rounded-tr-lg pointer-events-none"></div>
                  <div className="absolute bottom-1 left-1 w-8 h-8 border-b-4 border-l-4 border-[#EA4335] rounded-bl-lg pointer-events-none"></div>

                  <img
                    src={qrDataUrl}
                    alt="Review QR Code"
                    className="w-52 h-52 object-contain"
                  />

                  {/* Google 'G' Emblem in Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center">
                      <svg className="w-7 h-7" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-52 h-52 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Sub-tagline Divider */}
            <div className="flex items-center justify-center gap-1.5 my-1">
              <span className="w-1.5 h-1.5 rotate-45 border border-slate-500"></span>
              <div className="h-[1px] bg-slate-300 flex-1"></div>
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-1">
                The AI–Powered Google Review Platform
              </span>
              <div className="h-[1px] bg-slate-300 flex-1"></div>
              <span className="w-1.5 h-1.5 rotate-45 border border-slate-500"></span>
            </div>

            {/* Google 4-Color Signature Bar */}
            <div className="grid grid-cols-4 h-2.5 rounded-full overflow-hidden my-1 shadow-xs">
              <div className="bg-[#4285F4]"></div>
              <div className="bg-[#EA4335]"></div>
              <div className="bg-[#FBBC05]"></div>
              <div className="bg-[#34A853]"></div>
            </div>

            {/* Bottom Call to Action */}
            <div className="text-center pt-1 pb-0.5">
              <p className="text-[13px] font-semibold text-slate-900 tracking-tight">
                Tap or Scan with mobile to Review on{' '}
                <span className="font-bold inline-flex">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Canvas Helper Functions
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fillColor: string,
  strokeColor: string
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
  ctx.fillStyle = fillColor;
  ctx.fill();
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = color;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawGoogleG(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  // Draw simple Google 4-color G on canvas
  ctx.save();
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';

  // Blue segment
  ctx.strokeStyle = '#4285F4';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI * 0.25, Math.PI * 0.25);
  ctx.stroke();

  // Green segment
  ctx.strokeStyle = '#34A853';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI * 0.25, Math.PI * 0.75);
  ctx.stroke();

  // Yellow segment
  ctx.strokeStyle = '#FBBC05';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * 1.25);
  ctx.stroke();

  // Red segment
  ctx.strokeStyle = '#EA4335';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI * 1.25, Math.PI * 1.75);
  ctx.stroke();

  // Center bar
  ctx.fillStyle = '#4285F4';
  ctx.fillRect(cx - 2, cy - 5, radius + 2, 10);

  ctx.restore();
}
