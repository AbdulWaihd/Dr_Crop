export const LOCALES = ["en", "hi", "ur"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_STORAGE_KEY = "dr-crop-locale";

/** BCP-47 for Web Speech API (primary tag per app locale) */
export const SPEECH_LANG: Record<Locale, string> = {
  en: "en-US",
  hi: "hi-IN",
  ur: "ur-PK",
};

/**
 * Tags to try in order for `SpeechRecognition.lang`. Chrome often lacks some
 * regional tags; falling back avoids English-only recognition when the UI is hi/ur.
 */
export function speechLangChainFor(locale: Locale): string[] {
  switch (locale) {
    case "en":
      return ["en-US", "en-GB", "en"];
    case "hi":
      return ["hi-IN", "hi", "en-IN", "en-US"];
    case "ur":
      return ["ur-PK", "ur-IN", "ur", "en-IN", "en-US"];
    default:
      return ["en-US"];
  }
}

export const RTL_LOCALES: Locale[] = ["ur"];

export type MessageKey = keyof typeof messagesEn;

const messagesEn = {
  headerTitle: "Dr. Crop",
  headerSubtitle: "A friend for your field — simple words, real help",
  navHow: "How It Works",
  navCopilot: "Farm copilot",
  navDiseases: "Crops",
  navTechnology: "Technology",
  navResearch: "Research",
  navLogin: "Login",
  navSignUp: "Sign Up",
  navDashboard: "Dashboard",
  navDiagnosisHub: "Diagnosis Hub",
  navFarmHistory: "Crop History",
  navLaboratory: "Laboratory",
  badgeOnline: "AI Online",
  btnNewDiagnosis: "New Diagnosis",
  btnNewScan: "New Scan",
  searchPlaceholder: "Search...",
  historyEmpty: "No History Found",
  historyEmptyDesc: "Your diagnostic history is currently empty. Start your first scan to begin tracking your crops.",
  downloadReport: "Download Report",
  welcomeMessage: "Hello. I'm ready to assist with your field analysis. Ask me anything about plant health or treatments.",

  heroBadge: "Help for every farmer",
  heroTitle: "Check your crop",
  heroTitleHighlight: "in minutes",
  heroSubtitle:
    "Take a clear photo of your crop. We use smart tools to spot problems and suggest what to do — plus weather and air tips when your phone shares location.",

  statVision: "Vision",
  statVisionLabel: "Crop photo check",
  statExa: "Exa",
  statExaLabel: "Web RAG",
  statLive: "Live",
  statLiveLabel: "Weather & air",
  statTime: "<60s",
  statTimeLabel: "Typical run",

  howWorksTitle: "How It Works",
  howWorksSubtitle: "Three easy steps — works on low bandwidth too",
  how1Title: "Photo of your crop",
  how1Desc:
    "Use camera, quick snap, or gallery. Bright light and a clear picture of the crop help a lot.",
  how2Title: "Vision + Exa RAG",
  how2Desc:
    "A vision model extracts structured findings; Exa retrieves agricultural context to finalize crop and disease.",
  how3Title: "Plan & yield tips",
  how3Desc:
    "Get treatment, prevention, and irrigation/soil/yield advice plus air-quality-aware tips when location is available.",

  landingHeroTitle: "Precision Plant Health in Seconds",
  landingHeroDesc: "Upload a photo and let our AI diagnose plant diseases and provide expert agricultural advice. The clinical precision of a laboratory, directly in the field.",
  landingStartDiagnosis: "Start Diagnosis",
  landingWatchDemo: "Watch Demo",
  landingFeaturesTitle: "The Science of Growth",
  landingFeaturesSubtitle: "Advanced tools for modern agriculture.",
  landingCard1Title: "Instant AI Detection",
  landingCard1Desc: "Our proprietary neural network identifies over 500+ plant pathogens and nutrient deficiencies within milliseconds of image upload.",
  landingCard2Title: "Expert Treatment Plans",
  landingCard2Desc: "Receive immediately actionable, scientifically-backed treatment protocols tailored to your specific crop variety and local climate conditions.",
  landingCard3Title: "Historical Tracking",
  landingCard3Desc: "Build a comprehensive longitudinal health record for every field. Monitor treatment efficacy and predict seasonal vulnerability trends.",
  landingProtocolTitle: "The Diagnosis Protocol",
  landingProtocolDesc: "A seamless integration of field observation and laboratory analysis.",
  landingStep1Title: "Snap a Photo",
  landingStep1Desc: "Capture a clear image of the affected leaf, stem, or fruit using your mobile device. Ensure good lighting for maximum accuracy.",
  landingStep2Title: "AI Analysis",
  landingStep2Desc: "Our system processes the image against a vast database of verified agricultural anomalies, returning a high-confidence diagnosis instantly.",
  landingTrustTitle: "Backed by The Living Laboratory research initiative",
  landingStat1Val: "98%",
  landingStat1Label: "Diagnostic Accuracy",
  landingStat2Val: "50+",
  landingStat2Label: "Crop Species Supported",
  landingFooterPrivacy: "Privacy",
  landingFooterTerms: "Terms",
  landingFooterContact: "Contact",
  landingFooterCopyright: "© 2024 drCrop. Part of The Living Laboratory.",

  geoNotice:
    "Weather and air use the location you choose below (phone GPS or your farm coordinates). Diagnosis does not need location.",
  geoStatusUsed: "Weather & air enabled",
  geoStatusDenied:
    "Weather/air had no coordinates: GPS was blocked, timed out, or unavailable. Allow location next time, or choose “Enter lat / lon” with your field’s coordinates and scan again.",
  geoLatLon: "Approx. {lat}°, {lon}°",
  geoSourceGps: "from phone GPS",
  geoSourceManual: "from coordinates you entered",
  weatherLocTitle: "Weather & air — field location",
  weatherLocHint:
    "Your phone may not be at the farm. Use GPS here, or type the latitude/longitude of the field for Open-Meteo weather, soil, and air quality.",
  weatherLocGps: "Phone GPS",
  weatherLocManual: "Enter lat / lon",
  weatherLat: "Latitude (−90 to 90)",
  weatherLon: "Longitude (−180 to 180)",
  coordsIncomplete: "Enter both latitude and longitude, or leave both empty to skip weather/air.",
  coordsInvalid: "Latitude must be between −90 and 90, longitude between −180 and 180.",

  footerLeft: "Dr. Crop v0.1 — Vision + Exa RAG",
  footerRight: "Next.js · FastAPI · Open-Meteo",

  uploadLiveCamera: "Live camera",
  uploadQuickCapture: "Quick capture",
  uploadGallery: "From gallery",
  uploadDrop: "Drop your crop photo here",
  uploadCaptureCrop: "Capture crop",
  cameraCancel: "Cancel",
  uploadFormats: "or use the buttons above · JPG, PNG, WebP",
  uploadAnalyzing: "Vision + RAG analysis…",
  statusUploading: "Uploading image...",
  statusAnalyzing: "Analyzing disease...",
  statusFetching: "Fetching treatment...",
  statusDone: "Done!",


  resultTitle: "Diagnosis Result",
  resultHealthyBadge: "Healthy",
  resultDiseaseBadge: "Disease Found",
  cropType: "Crop Type",
  condition: "Condition",
  noDisease: "No disease detected",
  confidenceLabel: "Confidence",
  matchLabel: "Match",
  severityHigh: "High",
  severityMedium: "Medium",
  severityLow: "Low",
  pipelineBadge: "Vision + Exa RAG",

  fieldTitle: "Field weather & soil (estimate)",
  fieldHint: "Open-Meteo for your location — use with local soil tests for decisions.",

  airTitle: "Air quality & your crop",
  airHint:
    "Live pollutant estimates (Open-Meteo). Advice is educational — verify critical decisions locally.",
  airAdviceTitle: "Effects & how to reduce harm",
  airUsAqi: "US AQI",
  airEuAqi: "EU AQI",
  airPm25: "PM2.5",
  airPm10: "PM10",
  airOzone: "Ozone (O₃)",
  airNo2: "NO₂",
  airSo2: "SO₂",
  airCo: "CO",
  airUgm3: "µg/m³",
  airTemp: "Air temperature",
  humidity: "Humidity",
  precipitation: "Precipitation",
  wind: "Wind",
  soilMoist07: "Soil moisture (0–7 cm)",
  soilMoist728: "Soil moisture (7–28 cm)",
  soilTemp: "Soil temp (0–7 cm)",
  timeUtc: "Time (UTC)",

  diseaseMgmt: "Disease management",
  tabTreatment: "Treatment",
  tabPrevention: "Prevention",
  tabFertilizer: "Fertilizer",

  yieldTitle: "Maximum yield plan",
  yieldHint: "Irrigation, soil health, and crop practices for yield under current conditions.",
  yieldUpliftTitle: "Yield comparison (if you follow the advice)",
  yieldUpliftHint:
    "Indicative only — not a guarantee. Real harvest depends on weather, soil, variety, and how closely you follow the plan.",
  yieldWater: "Irrigation & water",
  yieldSoil: "Soil health & nutrients",
  yieldCrop: "Crop practices for yield",

  healthyCardTitle: "Your crop looks healthy!",
  healthyCardDesc: "No strong disease signal. Check yield and air tips below when location is shared.",

  scanAnother: "Scan another crop",
  copyReport: "Copy Report",
  copied: "Copied!",

  errCameraApi: "Camera API not available. Use gallery or quick capture.",
  errCameraPermission: "Could not access the camera. Check permissions or use upload.",
  cameraOverlayHelp:
    "Fill the screen with your crop in good light. The check runs on our server — your data is used only for advice.",

  copilotTitle: "Farm copilot",
  copilotSubtitle:
    "Ask anything about farming: water, fertilizer, pests, soil, weather. Replies follow your language (English / हिन्दी / اردو) above. Short, clear words — like talking to a friend.",
  copilotPlaceholder: "e.g. When should I water wheat after rain? How to reduce insects without too much spray?",
  copilotSend: "Get advice",
  copilotThinking: "Thinking…",
  copilotError: "Could not get advice. Check your connection or try again.",
  copilotOffline: "The assistant needs the API key on the server. Ask your support person to set LLM_API_KEY in backend/.env.",
  copilotNeedQuestion: "Type your farming question in the box above, then tap Get advice.",

  copilotVoiceStart: "Voice",
  copilotVoiceStop: "Stop",
  copilotVoiceListening: "Listening… speak clearly",
  copilotVoiceNotSupported: "Voice typing is not available in this browser. Try Chrome on Android or desktop.",
  copilotVoicePermission: "Microphone access was blocked. Allow the mic in your browser settings and try again.",
  copilotVoiceError: "Voice input failed. Try again or type your question.",
  copilotVoiceLangUnsupported:
    "This browser does not offer voice typing for the selected language. Try Chrome, switch app language, or type your question.",
  copilotVoiceNetwork: "Voice needs internet (browser sends audio to recognition servers). Check Wi‑Fi or mobile data.",
  copilotVoiceMic: "No microphone found, or it is busy in another app. Check your device settings.",
  copilotVoiceStartFail: "Could not start listening. Close other tabs using the mic and try again.",
  copilotExpertLabel: "Expert Recommendation",
} as const;

const messagesHi: Record<MessageKey, string> = {
  headerTitle: "डॉ. क्रॉप",
  headerSubtitle: "खेत के लिए साथी — सरल भाषा में मदद",
  navHow: "यह कैसे काम करता है",
  navCopilot: "फार्म सहायक",
  navDiseases: "फसलें",
  navTechnology: "तकनीक",
  navResearch: "शोध",
  navLogin: "लॉगिन",
  navSignUp: "साइन अप",
  navDashboard: "डैशबोर्ड",
  navDiagnosisHub: "निदान केंद्र",
  navFarmHistory: "फसल इतिहास",
  navLaboratory: "प्रयोगशाला",
  badgeOnline: "एआई ऑनलाइन",
  btnNewDiagnosis: "नया निदान",
  btnNewScan: "नया स्कैन",
  searchPlaceholder: "खोजें...",
  historyEmpty: "कोई इतिहास नहीं मिला",
  historyEmptyDesc: "आपका निदान इतिहास अभी खाली है। अपनी फसलों पर नज़र रखने के लिए अपना पहला स्कैन शुरू करें।",
  downloadReport: "रिपोर्ट डाउनलोड करें",
  welcomeMessage: "नमस्ते। मैं आपके क्षेत्र विश्लेषण में सहायता के लिए तैयार हूं। मुझसे पौधों के स्वास्थ्य या उपचार के बारे में कुछ भी पूछें।",

  heroBadge: "हर किसान के लिए मदद",
  heroTitle: "अपनी फसल की जाँच करें",
  heroTitleHighlight: "कुछ ही मिनट में",
  heroSubtitle:
    "फसल की साफ़ फोटो लें। हम समस्या पहचानने और सलाह देने में मदद करते हैं — जब स्थान मिले तो मौसम और हवा की जानकारी भी।",

  statVision: "विज़न",
  statVisionLabel: "फसल फोटो जाँच",
  statExa: "Exa",
  statExaLabel: "वेब RAG",
  statLive: "लाइव",
  statLiveLabel: "मौसम और वायु",
  statTime: "<60 से",
  statTimeLabel: "औसत समय",

  howWorksTitle: "यह कैसे काम करता है",
  howWorksSubtitle: "तीन आसान चरण — कम इंटरनेट पर भी चलता है",
  how1Title: "फसल की फोटो",
  how1Desc:
    "कैमरा, त्वरित कैप्चर या गैलरी। अच्छी रोशनी और साफ़ फसल की तस्वीर बेहतर नतीजे देती है।",
  how2Title: "विज़न + Exa RAG",
  how2Desc:
    "विज़न मॉडल संरचित जानकारी निकालता है; Exa कृषि संदर्भ ढूंढकर फसल और रोग तय करता है।",
  how3Title: "योजना और उपज सुझाव",
  how3Desc:
    "स्थान उपलब्ध होने पर उपचार, रोकथाम, सिंचाई/मिट्टी/उपज और वायु-जागरूक सलाह।",

  landingHeroTitle: "पौधों का स्वास्थ्य, अब आपके हाथ में",
  landingHeroDesc: "एक फोटो अपलोड करें और हमारे एआई को पौधों के रोगों का निदान करने और विशेषज्ञ कृषि सलाह देने दें। प्रयोगशाला जैसी सटीकता, सीधे आपके खेत में।",
  landingStartDiagnosis: "निदान शुरू करें",
  landingWatchDemo: "डेमो देखें",
  landingFeaturesTitle: "विकास का विज्ञान",
  landingFeaturesSubtitle: "आधुनिक कृषि के लिए उन्नत उपकरण।",
  landingCard1Title: "त्वरित एआई पहचान",
  landingCard1Desc: "हमारा एआई नेटवर्क इमेज अपलोड होने के कुछ ही मिलीसेकंड में 500+ से अधिक पौधों के रोगजनकों और पोषक तत्वों की कमी की पहचान करता है।",
  landingCard2Title: "विशेषज्ञ उपचार योजना",
  landingCard2Desc: "अपनी फसल की विविधता और स्थानीय जलवायु परिस्थितियों के अनुरूप वैज्ञानिक तरीके से उपचार प्राप्त करें।",
  landingCard3Title: "इतिहास ट्रैकिंग",
  landingCard3Desc: "हर खेत के लिए एक व्यापक स्वास्थ्य रिकॉर्ड बनाएं। उपचार की प्रभावकारिता की निगरानी करें और रुझानों की भविष्यवाणी करें।",
  landingProtocolTitle: "निदान प्रक्रिया",
  landingProtocolDesc: "क्षेत्र अवलोकन और प्रयोगशाला विश्लेषण का एक सहज एकीकरण।",
  landingStep1Title: "एक फोटो लें",
  landingStep1Desc: "अपने मोबाइल का उपयोग करके प्रभावित पत्ते या फल की एक साफ़ तस्वीर लें। अधिकतम सटीकता के लिए अच्छी रोशनी सुनिश्चित करें।",
  landingStep2Title: "एआई विश्लेषण",
  landingStep2Desc: "हमारा सिस्टम सत्यापित कृषि विसंगतियों के एक विशाल डेटाबेस के विरुद्ध छवि को प्रोसेस करता है, और तुरंत परिणाम देता है।",
  landingTrustTitle: "लिविंग लेबोरेटरी अनुसंधान पहल द्वारा समर्थित",
  landingStat1Val: "98%",
  landingStat1Label: "निदान सटीकता",
  landingStat2Val: "50+",
  landingStat2Label: "फसल प्रजातियां समर्थित",
  landingFooterPrivacy: "गोपनीयता",
  landingFooterTerms: "शर्तें",
  landingFooterContact: "संपर्क",
  landingFooterCopyright: "© 2024 drCrop. लिविंग लेबोरेटरी का हिस्सा।",

  geoNotice:
    "मौसम और वायु के लिए नीचे चुना गया स्थान (फोन GPS या खेत के अक्षांश/देशांतर)। निदान के लिए स्थान जरूरी नहीं।",
  geoStatusUsed: "मौसम और वायु सक्रिय",
  geoStatusDenied:
    "मौसम/वायु के लिए निर्देशांक नहीं: GPS ब्लॉक, समय समाप्त या उपलब्ध नहीं। अगली बार स्थान की अनुमति दें, या “अक्षांश / देशांतर” चुनकर खेत के निर्देशांक डालें और फिर स्कैन करें।",
  geoLatLon: "लगभग {lat}°, {lon}°",
  geoSourceGps: "फोन GPS से",
  geoSourceManual: "आपके दर्ज निर्देशांक से",
  weatherLocTitle: "मौसम और वायु — खेत का स्थान",
  weatherLocHint:
    "फोन खेत पर नहीं हो सकता। यहाँ GPS चुनें, या Open-Meteo मौसम/मिट्टी/वायु के लिए खेत का अक्षांश व देशांतर लिखें।",
  weatherLocGps: "फोन GPS",
  weatherLocManual: "अक्षांश / देशांतर",
  weatherLat: "अक्षांश (−90 से 90)",
  weatherLon: "देशांतर (−180 से 180)",
  coordsIncomplete: "दोनों अक्षांश और देशांतर भरें, या मौसम/वायु छोड़ने के लिए दोनों खाली छोड़ें।",
  coordsInvalid: "अक्षांश −90 से 90 और देशांतर −180 से 180 के बीच होना चाहिए।",

  footerLeft: "डॉ. क्रॉप v0.1 — विज़न + Exa RAG",
  footerRight: "Next.js · FastAPI · Open-Meteo",

  uploadLiveCamera: "लाइव कैमरा",
  uploadQuickCapture: "त्वरित कैप्चर",
  uploadGallery: "गैलरी से",
  uploadDrop: "फसल की फोटो यहाँ छोड़ें",
  uploadCaptureCrop: "फसल कैप्चर करें",
  cameraCancel: "रद्द करें",
  uploadFormats: "या ऊपर बटन · JPG, PNG, WebP",
  uploadAnalyzing: "विज़न + RAG विश्लेषण…",
  statusUploading: "छवि अपलोड हो रही है...",
  statusAnalyzing: "रोग का विश्लेषण हो रहा है...",
  statusFetching: "उपचार खोजा जा रहा है...",
  statusDone: "सम्पन्न!",


  resultTitle: "निदान परिणाम",
  resultHealthyBadge: "स्वस्थ",
  resultDiseaseBadge: "रोग मिला",
  cropType: "फसल प्रकार",
  condition: "स्थिति",
  noDisease: "कोई रोग नहीं",
  confidenceLabel: "विश्वास",
  matchLabel: "मिलान",
  severityHigh: "उच्च",
  severityMedium: "मध्यम",
  severityLow: "कम",
  pipelineBadge: "विज़न + Exa RAG",

  fieldTitle: "खेत का मौसम और मिट्टी (अनुमान)",
  fieldHint: "आपके स्थान के लिए Open-Meteo — निर्णय के लिए स्थानीय मिट्टी परीक्षण के साथ।",

  airTitle: "वायु गुणवत्ता और आपकी फसल",
  airHint:
    "लाइव प्रदूषक अनुमान (Open-Meteo)। सलाह शैक्षिक है — महत्वपूर्ण निर्णय स्थानीय रूप से सत्यापित करें।",
  airAdviceTitle: "प्रभाव और नुकसान कम करने के उपाय",
  airUsAqi: "US AQI",
  airEuAqi: "EU AQI",
  airPm25: "PM2.5",
  airPm10: "PM10",
  airOzone: "ओज़ोन (O₃)",
  airNo2: "NO₂",
  airSo2: "SO₂",
  airCo: "CO",
  airUgm3: "µg/m³",

  airTemp: "वायु तापमान",
  humidity: "आर्द्रता",
  precipitation: "वर्षा",
  wind: "हवा",
  soilMoist07: "मिट्टी नमी (0–7 सेमी)",
  soilMoist728: "मिट्टी नमी (7–28 सेमी)",
  soilTemp: "मिट्टी ताप (0–7 सेमी)",
  timeUtc: "समय (UTC)",

  diseaseMgmt: "रोग प्रबंधन",
  tabTreatment: "उपचार",
  tabPrevention: "रोकथाम",
  tabFertilizer: "उर्वरक",

  yieldTitle: "अधिकतम उपज योजना",
  yieldHint: "वर्तमान स्थितियों में सिंचाई, मिट्टी और उपज के लिए प्रथाएँ।",
  yieldUpliftTitle: "सलाह मानने पर उपज की तुलना",
  yieldUpliftHint:
    "केवल अनुमानित — गारंटी नहीं। असली फसल मौसम, मिट्टी, बीज और सलाह का पालन कितना होता है, इस पर निर्भर करती है।",
  yieldWater: "सिंचाई और पानी",
  yieldSoil: "मिट्टी स्वास्थ्य और पोषक",
  yieldCrop: "उपज के लिए फसल प्रथाएँ",

  healthyCardTitle: "आपकी फसल स्वस्थ लगती है!",
  healthyCardDesc: "मजबूत रोग संकेत नहीं। स्थान साझा होने पर नीचे उपज और वायु सुझाव देखें।",

  scanAnother: "दूसरी फसल स्कैन करें",
  copyReport: "रिपोर्ट कॉपी करें",
  copied: "कॉपी!",

  errCameraApi: "कैमरा API उपलब्ध नहीं। गैलरी या त्वरित कैप्चर का उपयोग करें।",
  errCameraPermission: "कैमरा एक्सेस नहीं हो सका। अनुमति जाँचें या अपलोड करें।",
  cameraOverlayHelp:
    "अच्छी रोशनी में फसल पूरे फ्रेम में दिखाएँ। जाँच सर्वर पर होती है — सलाह के लिए।",

  copilotTitle: "फार्म सहायक — तुरंत सलाह",
  copilotSubtitle:
    "खेती से जुड़ा कुछ भी पूछें: पानी, खाद, कीट, मिट्टी, मौसम। जवाब ऊपर चुनी भाषा (English / हिन्दी / اردو) में मिलेंगे — सरल शब्द।",
  copilotPlaceholder: "जैसे: बारिश के बाद गेहूँ में कब सिंचाई करें? कम दवा से कीट कम करें?",
  copilotSend: "सलाह लें",
  copilotThinking: "सोच रहा है…",
  copilotError: "सलाह नहीं मिली। इंटरनेट जाँचें या फिर कोशिश करें।",
  copilotOffline: "सहायक के लिए सर्वर पर API कुंजी चाहिए। backend/.env में LLM_API_KEY लगवाएँ।",
  copilotNeedQuestion: "ऊपर बॉक्स में अपना सवाल लिखें, फिर सलाह लें पर टैप करें।",

  copilotVoiceStart: "आवाज़",
  copilotVoiceStop: "रोकें",
  copilotVoiceListening: "सुन रहा है… साफ़ बोलें",
  copilotVoiceNotSupported: "इस ब्राउज़र में आवाज़ टाइपिंग नहीं। Chrome आज़माएँ।",
  copilotVoicePermission: "माइक्रोफ़ोन ब्लॉक है। ब्राउज़र सेटिंग में अनुमति दें।",
  copilotVoiceError: "आवाज़ नहीं आई। फिर कोशिश करें या टाइप करें।",
  copilotVoiceLangUnsupported:
    "इस ब्राउज़र में चुनी भाषा के लिए आवाज़ टाइपिंग उपलब्ध नहीं। Chrome आज़माएँ, ऐप भाषा बदलें, या टाइप करें।",
  copilotVoiceNetwork: "आवाज़ के लिए इंटरनेट चाहिए। Wi‑Fi या मोबाइल डेटा चेक करें।",
  copilotVoiceMic: "माइक नहीं मिला या दूसरे ऐप में व्यस्त है। डिवाइस सेटिंग देखें।",
  copilotVoiceStartFail: "सुनना शुरू नहीं हो सका। दूसरे टैब बंद करके फिर कोशिश करें।",
  copilotExpertLabel: "विशेषज्ञ सलाह",
};

const messagesUr: Record<MessageKey, string> = {
  headerTitle: "ڈاکٹر کراپ",
  headerSubtitle: "کھیت کا دوست — سادہ الفاظ میں مدد",
  navHow: "یہ کیسے کام کرتا ہے",
  navCopilot: "فارمنگ معاون",
  navDiseases: "فصلیں",
  navTechnology: "ٹیکنالوجی",
  navResearch: "تحقیق",
  navLogin: "لاگ ان",
  navSignUp: "سائن اپ",
  navDashboard: "ڈیش بورڈ",
  navDiagnosisHub: "تشخیصی مرکز",
  navFarmHistory: "فصل کی تاریخ",
  navLaboratory: "لیبارٹری",
  badgeOnline: "اے آئی آن لائن",
  btnNewDiagnosis: "نئی تشخیص",
  btnNewScan: "نیا اسکین",
  searchPlaceholder: "تلاش کریں...",
  historyEmpty: "کوئی ریکارڈ نہیں ملا",
  historyEmptyDesc: "آپ کی تشخیص کی تاریخ فی الحال خالی ہے۔ اپنی فصلوں کو ٹریک کرنے کے لیے پہلا اسکین شروع کریں۔",
  downloadReport: "رپورٹ ڈاؤن لوڈ کریں",
  welcomeMessage: "ہیلو۔ میں آپ کے فیلڈ تجزیہ میں مدد کے لیے تیار ہوں۔ مجھ سے پودوں کی صحت یا علاج کے بارے میں کچھ بھی پوچھیں۔",

  heroBadge: "ہر کسان کے لیے مدد",
  heroTitle: "اپنی فصل کی جانچ کریں",
  heroTitleHighlight: "چند منٹ میں",
  heroSubtitle:
    "فصل کی صاف تصویر لیں۔ ہم مسئلہ پہچاننے اور مشورے میں مدد کرتے ہیں — مقام ملے تو موسم اور ہوا بھی۔",

  statVision: "ویژن",
  statVisionLabel: "فصل کی تصویر",
  statExa: "Exa",
  statExaLabel: "ویب RAG",
  statLive: "لائیو",
  statLiveLabel: "موسم اور ہوا",
  statTime: "<60 س",
  statTimeLabel: "اوسط وقت",

  howWorksTitle: "یہ کیسے کام کرتا ہے",
  howWorksSubtitle: "تین آسان مراحل — کم انٹرنیٹ پر بھی",
  how1Title: "فصل کی تصویر",
  how1Desc:
    "کیمرہ، فوری شاٹ یا گیلری۔ اچھی روشنی اور صاف فصل کی تصویر بہتر نتیجہ دیتی ہے۔",
  how2Title: "ویژن + Exa RAG",
  how2Desc:
    "ویژن ماڈل ڈھانچہ جاتی معلومات نکالتا ہے؛ Exa زرعی سیاق تلاش کر کے فصل اور بیماری طے کرتا ہے۔",
  how3Title: "منصوبہ اور پیداوار کے مشورے",
  how3Desc:
    "مقام دستیاب ہو تو علاج، روک تھام، آبپاشی/مٹی/پیداوار اور ہوا سے آگاہ مشورے۔",

  landingHeroTitle: "پودوں کی صحت، چند سیکنڈ میں",
  landingHeroDesc: "تصویر اپ لوڈ کریں اور ہماری اے آئی کو پودوں کی بیماریوں کی تشخیص اور ماہرانہ زرعی مشورہ دینے دیں۔ لیبارٹری جیسی درستگی، براہ راست آپ کے کھیت میں۔",
  landingStartDiagnosis: "تشخیص شروع کریں",
  landingWatchDemo: "ڈیمو دیکھیں",
  landingFeaturesTitle: "ترقی کی سائنس",
  landingFeaturesSubtitle: "جدید زراعت کے لیے جدید آلات۔",
  landingCard1Title: "فوری اے آئی تشخیص",
  landingCard1Desc: "ہمارا نیورل نیٹ ورک تصویر اپ لوڈ ہونے کے چند ملی سیکنڈ میں 500 سے زیادہ پودوں کے امراض اور غذائیت کی کمی کو پہچان لیتا ہے۔",
  landingCard2Title: "ماہرانہ علاج کے منصوبے",
  landingCard2Desc: "اپنی فصل اور مقامی آب و ہوا کے مطابق سائنسی بنیادوں پر علاج کے مشورے حاصل کریں۔",
  landingCard3Title: "ہسٹری ٹریکنگ",
  landingCard3Desc: "ہر کھیت کے لیے صحت کا مکمل ریکارڈ بنائیں۔ علاج کی تاثیر پر نظر رکھیں اور مستقبل کے رجحانات کی پیش گوئی کریں۔",
  landingProtocolTitle: "تشخیصی طریقہ کار",
  landingProtocolDesc: "کھیت کے مشاہدے اور لیبارٹری تجزیہ کا ایک بہترین امتزاج۔",
  landingStep1Title: "فوٹو لیں",
  landingStep1Desc: "اپنے موبائل سے متاثرہ حصے کی صاف تصویر لیں۔ درستگی کے لیے اچھی روشنی کا خیال رکھیں۔",
  landingStep2Title: "اے آئی تجزیہ",
  landingStep2Desc: "ہمارا نظام زرعی معلومات کے ایک وسیع ذخیرے کی بنیاد پر تصویر کا تجزیہ کرتا ہے اور فوری نتیجہ دیتا ہے۔",
  landingTrustTitle: "لیونگ لیبارٹری ریسرچ انیشیٹو کے تعاون سے",
  landingStat1Val: "98%",
  landingStat1Label: "تشخیص کی درستگی",
  landingStat2Val: "50+",
  landingStat2Label: "فصلوں کی اقسام",
  landingFooterPrivacy: "رازداری",
  landingFooterTerms: "شرائط",
  landingFooterContact: "رابطہ",
  landingFooterCopyright: "© 2024 drCrop. لیونگ لیبارٹری کا حصہ۔",

  geoNotice:
    "موسم اور ہوا کے لیے نیچے منتخب مقام (فون GPS یا کھیت کے طول و عرض)۔ تشخیص کے لیے مقام ضروری نہیں۔",
  geoStatusUsed: "موسم اور ہوا فعال",
  geoStatusDenied:
    "موسم/ہوا کے لیے نقاط نہیں: GPS بلاک، وقت ختم یا دستیاب نہیں۔ اگلی بار مقام کی اجازت دیں، یا “عرض / طول” چن کر کھیت کے نقاط لکھیں اور دوبارہ اسکین کریں۔",
  geoLatLon: "تقریباً {lat}°، {lon}°",
  geoSourceGps: "فون GPS سے",
  geoSourceManual: "آپ کے درج طول و عرض سے",
  weatherLocTitle: "موسم اور ہوا — کھیت کا مقام",
  weatherLocHint:
    "فون کھیت پر نہیں ہو سکتا۔ یہاں GPS چنیں، یا Open-Meteo موسم/مٹی/ہوا کے لیے کھیت کا عرض البلد و طول البلد لکھیں۔",
  weatherLocGps: "فون GPS",
  weatherLocManual: "عرض / طول",
  weatherLat: "عرض البلد (−90 سے 90)",
  weatherLon: "طول البلد (−180 سے 180)",
  coordsIncomplete: "عرض اور طول دونیں بھریں، یا موسم/ہوا چھوڑنے کے لیے دونوں خالی چھوڑیں۔",
  coordsInvalid: "عرض −90 سے 90 اور طول −180 سے 180 کے درمیان ہونا چاہیے۔",

  footerLeft: "ڈاکٹر کراپ v0.1 — ویژن + Exa RAG",
  footerRight: "Next.js · FastAPI · Open-Meteo",

  uploadLiveCamera: "لائیو کیمرہ",
  uploadQuickCapture: "فوری کیپچر",
  uploadGallery: "گیلری سے",
  uploadDrop: "فصل کی تصویر یہاں چھوڑیں",
  uploadCaptureCrop: "فصل کیپچر",
  cameraCancel: "منسوخ",
  uploadFormats: "یا اوپر بٹن · JPG, PNG, WebP",
  uploadAnalyzing: "ویژن + RAG تجزیہ…",
  statusUploading: "تصویر اپ لوڈ ہو رہی ہے...",
  statusAnalyzing: "بیماری کا تجزیہ ہو رہا ہے...",
  statusFetching: "علاج تلاش کیا جا رہا ہے...",
  statusDone: "مکمل!",


  resultTitle: "تشخیص کا نتیجہ",
  resultHealthyBadge: "صحت مند",
  resultDiseaseBadge: "بیماری ملی",
  cropType: "فصل کی قسم",
  condition: "حالت",
  noDisease: "کوئی بیماری نہیں",
  confidenceLabel: "اعتماد",
  matchLabel: "مماثلت",
  severityHigh: "زیادہ",
  severityMedium: "درمیانی",
  severityLow: "کم",
  pipelineBadge: "ویژن + Exa RAG",

  fieldTitle: "کھیت کا موسم اور مٹی (تخمینہ)",
  fieldHint: "آپ کے مقام کے لیے Open-Meteo — فیصلوں کے لیے مقامی مٹی کے ٹیسٹ کے ساتھ۔",

  airTitle: "ہوا کی کوالٹی اور آپ کی فصل",
  airHint:
    "لائیو آلودگی تخمینے (Open-Meteo)۔ مشورے تعلیمی ہیں — اہم فیصلے مقامی طور پر تصدیق کریں۔",
  airAdviceTitle: "اثرات اور نقصان کم کرنے کے طریقے",
  airUsAqi: "US AQI",
  airEuAqi: "EU AQI",
  airPm25: "PM2.5",
  airPm10: "PM10",
  airOzone: "اوزون (O₃)",
  airNo2: "NO₂",
  airSo2: "SO₂",
  airCo: "CO",
  airUgm3: "µg/m³",

  airTemp: "ہوا کا درجہ حرارت",
  humidity: "نمی",
  precipitation: "بارش",
  wind: "ہوا",
  soilMoist07: "مٹی کی نمی (0–7 سم)",
  soilMoist728: "مٹی کی نمی (7–28 سم)",
  soilTemp: "مٹی کا درجہ (0–7 سم)",
  timeUtc: "وقت (UTC)",

  diseaseMgmt: "بیماری کا انتظام",
  tabTreatment: "علاج",
  tabPrevention: "روکتھام",
  tabFertilizer: "کھاد",

  yieldTitle: "زیادہ سے زیادہ پیداوار کا منصوبہ",
  yieldHint: "موجودہ حالات میں آبپاشی، مٹی اور پیداوار کے طریقے۔",
  yieldUpliftTitle: "مشورے پر عمل سے پیداوار کا موازنہ",
  yieldUpliftHint:
    "صرف تخمینہ — ضمانت نہیں۔ حقیقی پیداوار موسم، مٹی، بیج اور مشورے پر عمل پر منحصر ہے۔",
  yieldWater: "آبپاشی اور پانی",
  yieldSoil: "مٹی کی صحت اور غذائیت",
  yieldCrop: "پیداوار کے لیے فصل کے طریقے",

  healthyCardTitle: "آپ کی فصل صحت مند لگتی ہے!",
  healthyCardDesc: "کوئی مضبوط بیماری کا اشارہ نہیں۔ مقام شیئر ہونے پر نیچے پیداوار اور ہوا کے مشورے دیکھیں۔",

  scanAnother: "دوسری فصل اسکین کریں",
  copyReport: "رپورٹ کاپی",
  copied: "کاپی!",

  errCameraApi: "کیمرہ API دستیاب نہیں۔ گیلری یا فوری کیپچر استعمال کریں۔",
  errCameraPermission: "کیمرہ تک رسائی نہیں ہو سکی۔ اجازت چیک کریں یا اپ لوڈ کریں۔",
  cameraOverlayHelp:
    "اچھی روشنی میں فصل پورے فریم میں دکھائیں۔ جانچ سرور پر ہوتی ہے — مشورے کے لیے۔",

  copilotTitle: "فارمنگ معاون — فوری مشورہ",
  copilotSubtitle:
    "کھیت سے متعلق کچھ بھی پوچھیں: پانی، کھاد، کیڑے، مٹی، موسم۔ جواب اوپر منتخب زبان (English / हिन्दी / اردو) میں — سادہ الفاظ۔",
  copilotPlaceholder: "مثال: بارش کے بعد گندم میں کب پانی دیں؟ کم سپرے سے کیڑے کم؟",
  copilotSend: "مشورہ لیں",
  copilotThinking: "سوچ رہا ہے…",
  copilotError: "مشورہ نہیں ملا۔ انٹرنیٹ چیک کریں یا دوبارہ کوشش کریں۔",
  copilotOffline: "معاون کے لیے سرور پر API کلید درکار ہے۔ backend/.env میں LLM_API_KEY لگوائیں۔",
  copilotNeedQuestion: "اوپر والے خانے میں سوال لکھیں، پھر مشورہ لیں دبائیں۔",

  copilotVoiceStart: "آواز",
  copilotVoiceStop: "روکیں",
  copilotVoiceListening: "سن رہا ہے… صاف بولیں",
  copilotVoiceNotSupported: "اس براؤزر میں آواز دستیاب نہیں۔ Chrome آزمائیں۔",
  copilotVoicePermission: "مائیک بلاک ہے۔ براؤزر میں اجازت دیں۔",
  copilotVoiceError: "آواز نہیں ملی۔ دوبارہ کوشش کریں یا ٹائپ کریں۔",
  copilotVoiceLangUnsupported:
    "اس براؤزر میں منتخب زبان کے لیے آواز دستیاب نہیں۔ Chrome آزمائیں، ایپ کی زبان بدلیں، یا ٹائپ کریں۔",
  copilotVoiceNetwork: "آواز کے لیے انٹرنیٹ درکار ہے۔ Wi‑Fi یا ڈیٹا چیک کریں۔",
  copilotVoiceMic: "مائک نہیں ملا یا دوسری ایپ میں مصروف ہے۔ سیٹنگ دیکھیں۔",
  copilotVoiceStartFail: "سننا شروع نہیں ہوا۔ دوسرے ٹیب بند کر کے دوبارہ کوشش کریں۔",
  copilotExpertLabel: "ماہر مشورہ",
};

export const messages: Record<Locale, Record<MessageKey, string>> = {
  en: messagesEn as Record<MessageKey, string>,
  hi: messagesHi,
  ur: messagesUr,
};

export function formatMessage(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ""
  );
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.split("-")[0]?.toLowerCase() || "en";
  if (lang === "hi") return "hi";
  if (lang === "ur") return "ur";
  return "en";
}
